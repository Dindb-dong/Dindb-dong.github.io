import { createServer } from "node:http";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { chromium } from "playwright";
import { WebSocket, WebSocketServer } from "ws";

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
const maxSessionMs = Number(process.env.MAX_SESSION_MS || 180000);
const idleTimeoutMs = Number(process.env.IDLE_TIMEOUT_MS || 60000);
const hostVerdictCache = new Map();

const server = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "not_found" }));
});

const wss = new WebSocketServer({ server, path: "/browser" });

wss.on("connection", async (socket, request) => {
  const origin = request.headers.origin || "";
  if (!isAllowedOrigin(origin)) {
    socket.close(1008, "origin_not_allowed");
    return;
  }

  let browser;
  let page;
  let captureTimer;
  let idleTimer;
  let capturing = false;

  const send = (payload) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  };

  const capture = async () => {
    if (!page || capturing) return;
    capturing = true;
    try {
      const buffer = await page.screenshot({
        type: "jpeg",
        quality: 72,
        fullPage: false,
      });
      send({
        type: "frame",
        image: `data:image/jpeg;base64,${buffer.toString("base64")}`,
      });
    } catch (error) {
      send({ type: "error", message: error.message });
    } finally {
      capturing = false;
    }
  };

  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      socket.close(1000, "idle_timeout");
    }, idleTimeoutMs);
  };

  const ensurePage = async (width = 1280, height = 720) => {
    if (!browser) {
      browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      });
    }
    if (!page) {
      page = await browser.newPage({ viewport: { width, height } });
      await page.route("**/*", async (route) => {
        const requestUrl = route.request().url();
        if (isInternalBrowserUrl(requestUrl)) {
          await route.continue();
          return;
        }

        try {
          await assertPublicHttpUrl(requestUrl);
          await route.continue();
        } catch {
          await route.abort();
        }
      });
      page.on("load", capture);
      page.on("domcontentloaded", capture);
    }
    await page.setViewportSize({ width, height });
  };

  const sessionTimer = setTimeout(() => {
    socket.close(1000, "session_limit");
  }, maxSessionMs);

  socket.on("message", async (raw) => {
    resetIdleTimer();
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      send({ type: "error", message: "invalid_json" });
      return;
    }

    try {
      if (message.type === "navigate") {
        await assertPublicHttpUrl(message.url);
        await ensurePage(message.width, message.height);
        send({ type: "status", text: `Opening ${message.url}` });
        await page.goto(message.url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        send({ type: "status", text: page.url() });
        await capture();
        clearInterval(captureTimer);
        captureTimer = setInterval(capture, 700);
      }

      if (message.type === "resize" && page) {
        await page.setViewportSize({ width: message.width, height: message.height });
        await capture();
      }

      if (message.type === "mouse" && page) {
        if (message.event === "move") await page.mouse.move(message.x, message.y);
        if (message.event === "down") {
          await page.mouse.move(message.x, message.y);
          await page.mouse.down({ button: mouseButton(message.button) });
        }
        if (message.event === "up") {
          await page.mouse.move(message.x, message.y);
          await page.mouse.up({ button: mouseButton(message.button) });
        }
        if (message.event === "wheel") await page.mouse.wheel(message.deltaX || 0, message.deltaY || 0);
        await capture();
      }

      if (message.type === "key" && page) {
        if (message.event === "down") await page.keyboard.down(message.key);
        if (message.event === "up") await page.keyboard.up(message.key);
        await capture();
      }
    } catch (error) {
      send({ type: "error", message: error.message });
    }
  });

  socket.on("close", async () => {
    clearTimeout(sessionTimer);
    clearTimeout(idleTimer);
    clearInterval(captureTimer);
    await browser?.close().catch(() => {});
  });

  resetIdleTimer();
  send({ type: "status", text: "Remote Chromium session ready" });
});

server.listen(port, host, () => {
  console.log(`remote browser listening on http://${host}:${port}`);
});

function mouseButton(button) {
  if (button === 1) return "middle";
  if (button === 2) return "right";
  return "left";
}

function isAllowedOrigin(origin) {
  if (allowedOrigin === "*") return true;
  const origins = allowedOrigin.split(",").map((item) => item.trim()).filter(Boolean);
  return origins.includes(origin);
}

function isInternalBrowserUrl(url) {
  return /^(about:|data:|blob:|chrome-error:)/i.test(url);
}

async function assertPublicHttpUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("unsupported_protocol");
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("private_hostname");
  }

  const cached = hostVerdictCache.get(hostname);
  if (cached === "blocked") throw new Error("private_address");
  if (cached === "allowed") return;

  const directIp = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true });
  if (directIp.some((record) => isPrivateAddress(record.address))) {
    hostVerdictCache.set(hostname, "blocked");
    throw new Error("private_address");
  }

  hostVerdictCache.set(hostname, "allowed");
}

function isPrivateAddress(address) {
  if (address === "::1" || address === "0.0.0.0") return true;
  if (address.startsWith("127.")) return true;
  if (address.startsWith("10.")) return true;
  if (address.startsWith("192.168.")) return true;
  if (address.startsWith("169.254.")) return true;

  const parts = address.split(".").map(Number);
  if (parts.length === 4 && parts.every((part) => Number.isInteger(part))) {
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  }

  const normalized = address.toLowerCase();
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80:")) return true;

  return false;
}
