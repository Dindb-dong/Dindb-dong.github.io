# DindbOS Remote Browser

Browser.app에서 임의의 주소를 iframe 없이 열려면 이 서버가 필요합니다.

구조:

- 포트폴리오: 주소창과 화면 클라이언트
- remote-browser: Playwright Chromium을 실제로 실행
- WebSocket: Chromium screenshot frame과 사용자 입력 이벤트를 교환

로컬 실행:

```bash
npm install
npm start
```

포트폴리오를 로컬에서 열면 Browser.app이 기본적으로 아래 엔진에 자동 연결합니다.

```text
ws://127.0.0.1:8787/browser
```

배포 시에는 HTTPS 사이트에서 접속해야 하므로 WebSocket도 `wss://`여야 합니다.
배포용 WebSocket 주소는 루트의 `remote-browser.config.json`에서 `productionWebSocketUrl`에 넣습니다.
Render Free cold start를 줄이기 위해 포트폴리오 첫 로드 시 `productionHealthUrl`로 prewake 요청을 보냅니다.

환경 변수:

- `PORT`: 기본 `8787`
- `HOST`: 기본 `0.0.0.0`
- `ALLOWED_ORIGIN`: 포트폴리오 origin 제한. 쉼표로 여러 origin 허용 가능. 로컬 기본 `*`
- `MAX_SESSION_MS`: 한 WebSocket 세션 최대 시간. 기본 `180000`
- `IDLE_TIMEOUT_MS`: 입력 없는 세션 종료 시간. 기본 `60000`

Render에 올릴 때는 최소한 아래 환경 변수를 설정합니다.

```text
ALLOWED_ORIGIN=https://dindb-dong.github.io
```

Blueprint 배포:

1. Render Dashboard에서 New > Blueprint를 선택합니다.
2. `Dindb-dong/Dindb-dong.github.io` 저장소를 연결합니다.
3. 루트의 `render.yaml`을 선택해서 `dindbos-remote-browser` 서비스를 생성합니다.
4. 배포가 끝나면 Render가 발급한 `https://...onrender.com` 주소를 확인합니다.
5. 루트의 `remote-browser.config.json`에 아래처럼 반영합니다.

```json
{
  "productionWebSocketUrl": "wss://YOUR-SERVICE.onrender.com/browser",
  "productionHealthUrl": "https://YOUR-SERVICE.onrender.com/health"
}
```

주의:

- `productionWebSocketUrl`과 `productionHealthUrl`은 브라우저가 접속해야 하므로 공개 값입니다.
- 숨겨야 할 값은 URL이 아니라 서버 권한입니다.
- remote-browser는 `localhost`, 사설 IP, link-local 주소로 향하는 요청을 차단합니다.
