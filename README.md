# MZXHUB

A personal Android WebView app built from HTML, CSS, and JavaScript.

## What This Is

MZXHUB is a personal project. It wraps a local web app inside a native
Android WebView shell so it can be installed and used as a normal Android
application.

This repository is **public for transparency** but the project is intended
**for personal use only.**

## Features

- Native Android WebView wrapper
- Works fully offline (assets bundled inside the APK)
- Modern dark UI
- Custom permissions (files, media, notifications, and more)
- Built automatically with GitHub Actions
- Free to build — no PC or Android Studio required

## How to Build

This repo uses **GitHub Actions** to build the APK automatically.

1. Push any change to the `main` branch, or
2. Go to the **Actions** tab → select **Build APK** → click **Run workflow**

After ~3 minutes:

1. Open the finished workflow run
2. Scroll to **Artifacts**
3. Download `app-release-apk`
4. Install the APK on your Android device

## Project Structure

```

├── .github/workflows/build-apk.yml   # Auto-build pipeline
├── app/
│   ├── build.gradle                  # App module config
│   └── src/main/
│       ├── AndroidManifest.xml       # Permissions & app config
│       ├── java/com/mzxhub/app/      # Native Android code
│       ├── res/                      # Icons, themes, strings
│       └── assets/                   # Your HTML/CSS/JS website
├── build.gradle                      # Root Gradle config
├── settings.gradle
└── gradle.properties

```

## Customizing

| What | Where |
|---|---|
| App name | `app/src/main/res/values/strings.xml` |
| App icon | `app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (512×512 PNG) |
| Permissions | `app/src/main/AndroidManifest.xml` |
| Website content | `app/src/main/assets/index.html` |
| Version | `app/build.gradle` (`versionCode` / `versionName`) |
| Package name | `app/build.gradle` (`applicationId`) |

## Disclaimer

This is a **personal project**. It is provided "as is" without warranty of
any kind. Use at your own risk.

- Not affiliated with Google, Android, or any third-party service.
- Not intended for distribution on the Google Play Store.
- The keystore in this repo is a **throwaway test key** — do not use it
  for any app you plan to publish or update long-term.

## License

MIT — see [LICENSE](LICENSE).
