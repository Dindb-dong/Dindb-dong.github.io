# Platform previews

The portfolio passes UI options to DindbOS during its normal boot. With no preview parameters, the SDK selects the UI automatically from the visitor's device and the current host dimensions.

| Query | Effect |
| --- | --- |
| `?device=macos` | Preview the automatic rules for a macOS visitor. |
| `?device=windows` | Preview the automatic rules for a Windows visitor. |
| `?device=ios` | Preview the automatic rules for an iOS visitor. |
| `?device=android` | Preview the automatic rules for an Android visitor. |
| `?device=other` | Preview the SDK fallback rules. |
| `?style=macos` | Explicitly select an available UI preset. Also accepts `windows`, `ios`, `android`, or `auto`. |
| `?mobileStyle=ios` | Override the SDK's mobile selection. Also accepts `macos`, `windows`, or `android`. |

Parameters can be combined, for example `?device=ios&style=windows&ln=en`. An explicit `style` takes precedence over automatic device selection; `mobileStyle` supplies the mobile override. Invalid values are ignored. Values are exact lowercase identifiers. Existing `ln=en` and `ln=ko` locale behavior remains available.

The installed SDK uses these automatic defaults:

| Visitor | Desktop selection | Mobile selection |
| --- | --- | --- |
| macOS | Windows | Samsung-inspired Android |
| Windows | macOS | iOS |
| iOS | Windows in landscape | Samsung-inspired Android in portrait |
| Android | macOS in landscape | iOS in portrait |
| Other | macOS | macOS |

For iOS and Android visitors, the host's portrait/landscape dimensions select the mode. Other visitors use the SDK's 760px host-width breakpoint. Explicit presets use the width breakpoint for an optional `mobileStyle` override. These defaults belong to the SDK; the portfolio does not maintain a second selection table in application code.

Device previews change only the SDK's visitor selection input. They do not spoof the browser user agent, viewport, touch support, or real operating system. Resize or rotate the browser to evaluate the corresponding layout. The portfolio's custom apps, content, project picker and storage continue through the existing runtime.

Validate query parsing with `node --test scripts/ui-options.test.mjs`. Run the four device/orientation flows with `PLAYWRIGHT_CHANNEL=chrome npx playwright test tests/platform-previews.spec.js --workers=2`. To reuse a running local server, set `PORTFOLIO_QA_URL` to its URL. [Runtime screenshots and recording](assets/platform-previews/README.md) document the tested browser viewports.

## Change the UI while browsing

Open the system menu and choose **Switch to Windows/macOS/Samsung/iOS** to change the current UI family immediately. Windows exposes the system menu under **App menus**; on Samsung, open Settings from Home.

**System Settings → Appearance → UI style** provides independent Desktop UI and Mobile UI groups. Choose macOS or Windows for desktop, and iOS or Samsung for mobile. **Automatic** resets that group's manual choice to the SDK configuration, including preview queries. Manual choices override that family's configured preset without restarting apps; resizing/rotation still selects the configured desktop or mobile family.

Choices are stored in this browser under the portfolio runtime's storage key. If saving is denied, a status message explains that the change lasts for the current session and reloading may restore the old choice. Memory-backed SDK instances show session-only wording. Reset both groups to Automatic when comparing device-query defaults after manual changes.
