# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Build a release APK locally (Android)

### One-time setup

Requires [Android Studio](https://developer.android.com/studio) (it provides the Android SDK + a bundled JDK 17+).

Set these user environment variables (PowerShell), then **open a new terminal**:

```powershell
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
setx JAVA_HOME "C:\Program Files\Android\Android Studio\jbr"
```

Verify in the new terminal:

```powershell
java -version   # should report JDK 17+
adb --version
```

### Build

```powershell
npm install
npx expo prebuild --platform android   # generates the native android/ folder
cd android
.\gradlew.bat assembleRelease
```

The APK is written to:

```
android\app\build\outputs\apk\release\app-release.apk
```

Install it on a connected device with `adb install <path-to-apk>`.

### Rebuilding after changes

| What changed | Steps |
|---|---|
| JS/TS code, components, styles, assets | `cd android; .\gradlew.bat assembleRelease` (fast, cached) |
| Added/removed an npm package | `npm install`, then `assembleRelease` |
| `app.json` or a native module | `npx expo prebuild --platform android`, then `assembleRelease` |

> `assembleRelease` reuses Gradle's cache (fast). `npx expo prebuild` regenerates the `android/` folder, so the following build is slower.
>
> The release APK is signed with a debug key — fine for testing/sideloading. Play Store distribution needs your own signing keystore.

## Running on Expo Go (Android) from GitHub Codespaces

Since Codespaces runs in the cloud with no shared LAN, use tunnel mode to connect your Android device via Expo Go.

**Step 1 — Install ngrok:**

```bash
npm install -g @expo/ngrok
```

**Step 2 — Start the dev server with tunnel:**

```bash
npx expo start --tunnel --go
```

**Step 3 — Scan the QR code** that appears in the terminal using the Expo Go app on your Android device.

> **Note:** Tunnel is slower than LAN — expect slightly longer reload times. If the tunnel fails to connect, check [status.ngrok.com](https://status.ngrok.com).

## Running on Expo Go (iPhone) from GitHub Codespaces

This project uses SDK 56, which requires building a custom Expo Go via TestFlight — the standard App Store version does not support SDK 56.

### Prerequisites

- An active [Apple Developer Program](https://developer.apple.com/programs/) subscription ($99/year)
- An [Expo account](https://expo.dev/signup) (free)

### Step 1 — Install EAS CLI and log in

```bash
npm install -g eas-cli
eas login
```

### Step 2 — Build Expo Go for your device

```bash
npx eas-cli@latest go
```

This builds a version of Expo Go compatible with SDK 56 and submits it to your TestFlight.

### Step 3 — Install on your iPhone

1. Install [TestFlight](https://apps.apple.com/us/app/testflight/id899247664) on your iPhone.
2. Go to [App Store Connect](https://appstoreconnect.apple.com), select the Expo Go app, navigate to the **TestFlight** tab, and add your Apple ID as an internal tester.
3. Accept the email invite and install Expo Go via TestFlight.

### Step 4 — Start the dev server with tunnel

```bash
npx expo start --tunnel --go
```

### Step 5 — Scan the QR code

Scan the QR code in the terminal using Expo Go on your iPhone.

> **Note:** SDK 54 supports the standard Expo Go App Store app (no Apple Developer account needed). If the $99/year cost is a blocker, consider downgrading to SDK 54.