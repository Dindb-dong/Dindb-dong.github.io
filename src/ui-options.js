const styles = ["macos", "windows", "ios", "android"];
const devices = [...styles, "other"];

/** Preview the SDK's visitor rules without changing the visitor's browser identity. */
export function portfolioUIOptions(search = "") {
  const query = new URLSearchParams(search);
  const style = query.get("style");
  const device = query.get("device");
  const mobileStyle = query.get("mobileStyle");
  return {
    style: style === "auto" || styles.includes(style) ? style : "auto",
    ...(devices.includes(device) ? { visitorOS: device } : {}),
    ...(styles.includes(mobileStyle) ? { mobileStyle } : {}),
  };
}
