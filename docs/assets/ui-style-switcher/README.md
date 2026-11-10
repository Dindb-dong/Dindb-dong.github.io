# UI style switching runtime evidence

Captured in installed Chrome on 2026-11-10 from the actual portfolio using SDK source `331ddc6`. Browser viewport previews, not physical devices.

- Desktop: 1440 × 900, `?device=windows&ln=en&intro=0`. The system-menu screenshot precedes switching macOS to Windows; Settings shows the Windows result and independent mobile choice.
- Mobile: 320 × 844, `?device=android&ln=en&intro=0`, Samsung selected in Settings. Light and dark screenshots include the corrected wrapping title.
- Recording: project search/selection, system-menu switch, Settings/keyboard switching, independent mobile choice, rotation, reload and Automatic reset.

Reproduce with `PLAYWRIGHT_CHANNEL=chrome npx playwright test tests/ui-style-switcher.spec.js --workers=1`. The suite also covers invalid preferences, denied storage with visible feedback, failed Automatic reset and Settings close/reopen/rerender cleanup.
