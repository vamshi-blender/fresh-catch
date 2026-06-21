# Local Android (APK) build — prerequisites report

**Project:** `Fresh Catch` · Expo SDK **56.0.12** · React Native **0.85.3** · CNG (no `android/` folder yet)
**Platform:** Windows 11 · checked against official v56 docs

## What "local APK compiling" means here

There are two distinct local paths. Given the goal (an APK, no EAS queue) **and** Windows as the
platform, the right one is the first:

| Path | Command | Queue? | Windows? | Output |
|---|---|---|---|---|
| **Recommended — Expo/Gradle direct** | `npx expo prebuild` -> `cd android && ./gradlew assembleRelease` | None | Supported | **`.apk`** |
| `eas build --local` | `eas build -p android --local` | None | **Not supported** (WSL only, untested) | `.aab`/`.apk` |

So these prerequisites are scoped to the **Expo/Gradle** path. It needs no EAS account, no `eas.json`,
and never touches the queue. (`assembleRelease` -> APK; `bundleRelease` -> AAB for Play Store.)

## Prerequisite status — ✅ ALL RESOLVED (first successful build: 2026-06-20)

| Requirement (per v56 docs) | Needed | This machine | Status |
|---|---|---|---|
| Node.js LTS | yes | v22.17.0 | OK |
| npm | yes | 11.7.0 | OK |
| **JDK 17** (Microsoft OpenJDK 17) | yes | `C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot` | OK |
| `JAVA_HOME` env var | yes | -> JDK 17 path | OK |
| `keytool` (for signing key) | yes | present | OK (ships with JDK) |
| **Android Studio + SDK** | yes | `D:\Android\Android Studio` / SDK at `D:\Android\Sdk` | OK |
| **SDK Platform 36** (Android 16 "Baklava") | yes | android-36 + android-36.1 | OK |
| Android SDK Build-Tools | yes | 36.1.0 / 37.0.0 | OK |
| **NDK** (reanimated/worklets compile C++) | yes | `27.1.12297006` | OK |
| `ANDROID_HOME` env var | yes | `D:\Android\Sdk` | OK |
| `platform-tools` on PATH (`adb`) | yes | on PATH | OK |
| Gradle (global) | optional | not installed | N/A — project uses `./gradlew` wrapper (Gradle 9.3.1) |
| `android/` native dir | generated | present | OK (`npx expo prebuild`) |

> Heavy SDK packages (NDK + platform android-36) were **auto-installed by Android Studio's first Gradle
> sync** — no manual SDK Manager picking was needed on this machine.

## Setup runbook (Android Studio GUI method)

This is the conventional path: install Android Studio, let its GUI **SDK Manager** download the SDK
packages (it handles platforms, build-tools, NDK, and licenses for you), set two environment variables,
then build. Android Studio also becomes the place where you click **Build → APK**.

> JDK 17 is already installed via winget at `C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot`.

### Step 1 — Set JAVA_HOME (GUI)

1. Press **Start**, type **"environment variables"**, open **"Edit the system environment variables"**.
2. Click **Environment Variables…**
3. Under **User variables**, click **New…** and enter:
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot`
4. Click **OK**.

> Leave the system `java` (v25) alone — Gradle reads `JAVA_HOME`, so the build will use 17 regardless.

### Step 2 — Install Android Studio

1. Download the installer from **https://developer.android.com/studio** (the big **Download Android
   Studio** button — the full IDE, not "command line tools only").
2. Run the `.exe`. In the setup wizard, keep **Standard** install type and click through — it accepts
   licenses and downloads the latest SDK + platform-tools + emulator automatically.
3. Launch Android Studio once so it finishes first-run setup.

### Step 3 — Add the required SDK packages (SDK Manager GUI)

In Android Studio: **More Actions** (or **⚙ Settings**) **→ Languages & Frameworks → Android SDK**.

**SDK Platforms** tab — tick **Show Package Details** at the bottom right, then under
**Android 16 ("Baklava")** select:
- **Android SDK Platform 36**
- **Sources for Android 36**

**SDK Tools** tab — tick **Show Package Details**, then make sure these are checked:
- **Android SDK Build-Tools** (version 36.x)
- **NDK (Side by side)** — required because reanimated/worklets compile C++. This project pins
  **NDK `27.1.12297006`** (RN 0.85); easiest to let Android Studio install it during Gradle sync (Step 6)
- **Android SDK Platform-Tools** (provides `adb`)
- **Android SDK Command-line Tools (latest)**

Click **Apply** → **OK** and let it download (this is the big one — NDK alone is ~600 MB+).

**This machine's SDK location** (installed to D:, not the default):
`D:\Android\Sdk`

### Step 4 — Set ANDROID_HOME (GUI)

Same dialog as Step 1 (**Environment Variables → User variables → New…**):
- Variable name: `ANDROID_HOME`
- Variable value: `D:\Android\Sdk`

Then add `adb` to your PATH: select the **Path** user variable → **Edit…** → **New** → add:
`D:\Android\Sdk\platform-tools`

Click **OK** on all dialogs. **Open a fresh terminal** (so it picks up the new variables) and verify:

```powershell
adb --version
echo $env:JAVA_HOME
echo $env:ANDROID_HOME
```

### Step 5 — Install deps + generate the native project  ✅ DONE

Already completed on this machine:

```powershell
npm install                 # 823 packages installed
npx expo prebuild -p android   # android/ folder generated
```

### Step 6 — Build the APK from the CLI  ✅ VERIFIED WORKING

This is the path actually used here — no Android Studio needed for the build itself. From the project
root:

```powershell
npx expo prebuild --platform android      # reconciles native project (idempotent)
cd android
.\gradlew.bat assembleRelease             # -> app\build\outputs\apk\release\app-release.apk
```

Result (first run, 2026-06-20):

```
BUILD SUCCESSFUL in 35m 54s
569 actionable tasks: 541 executed, 28 up-to-date
APK: D:\vamshi\Node_Projects\fresh-catch\android\app\build\outputs\apk\release\app-release.apk  (98.6 MB)
```

Notes:
- The release build type is signed with the **debug key** by default (see `android/app/build.gradle`),
  so `assembleRelease` produces an **installable** APK with no keystore setup.
- The ~36 min was the one-time native C++ compile (reanimated/worklets across 4 ABIs). **Re-runs take a
  couple of minutes** (native libs cached): just `cd android; .\gradlew.bat assembleRelease`.
- Close Android Studio before a CLI build, or Gradle starts a second daemon (extra RAM).
- Harmless log noise you can ignore: `NODE_ENV ... not specified`, `[CXX5304] SDK XML version 4`,
  `deprecated API` notes, and the "Deprecated Gradle features / incompatible with Gradle 10" warning.

Install on a connected device (USB debugging on):

```powershell
adb install "D:\vamshi\Node_Projects\fresh-catch\android\app\build\outputs\apk\release\app-release.apk"
```

#### APK size (98.6 MB) — how to shrink if needed
- **Per-ABI splits** (each ~25–35 MB; most phones need only `arm64-v8a`).
- **`.\gradlew.bat bundleRelease`** -> `.aab` for the Play Store (Google serves per-device APKs).
- Enable R8/minify + `shrinkResources` via gradle properties.

### Step 6 (alt) — Build the APK in Android Studio (GUI)

1. **File → Open** the generated **`android`** folder (`D:\vamshi\Node_Projects\fresh-catch\android`).
2. Wait for the **Gradle sync** (first sync auto-installs NDK / platform-36 and downloads Gradle + deps).
3. **Build → Build App Bundle(s) / APK(s) → Build APK(s)**; use the notification's **locate** link.
4. **Do NOT** accept the "AGP Upgrade Assistant" popup — Expo manages the AGP version; upgrading breaks
   prebuild. For a distributable build use **Build → Generate Signed Bundle / APK** with a real keystore.

## Troubleshooting

### Build fails: `JvmVendorSpec does not have member field ... IBM_SEMERU`

**Cause:** Gradle ran on the **wrong JDK**. The terminal didn't have `JAVA_HOME` pointing at JDK 17, so
`gradlew` fell back to `java` on `PATH` — here that's **Oracle Java 25** (`C:\Program Files\Common
Files\Oracle\Java\javapath`). Gradle 9.3.1's Groovy throws this bogus "missing field" reflection error
on an unsupported JDK. A telltale sign is `1 incompatible Daemon could not be reused` at the top.

**Why it happens:** `JAVA_HOME` is set persistently to JDK 17, but a terminal **opened before** that was
set keeps the old (empty) environment.

**Fix — pick one:**
- Open a **fresh** terminal (inherits `JAVA_HOME=JDK 17`), then build. *(simplest)*
- Or set it for the session before building:
  ```powershell
  $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
  ```
- If a stale daemon is stuck, clear it first: `.\gradlew.bat --stop`

**Verify** before building — this must say `Launcher JVM: 17.x`:
```powershell
.\gradlew.bat --version
```

> Note: Gradle wants a **Java 21** *daemon* (per `android/gradle/gradle-daemon-jvm.properties`) and
> locates one automatically (the Android Studio JBR is 21). Only the **launcher** must be JDK 17 — don't
> let it fall through to Java 25.

## Summary

JDK 17 -> set `JAVA_HOME` -> install **Android Studio** (SDK lands at `D:\Android\Sdk`; NDK + platform-36
auto-install on first sync) -> set `ANDROID_HOME` + PATH -> `npm install` -> `npx expo prebuild` ->
`cd android; .\gradlew.bat assembleRelease`. No EAS account, no build queue. First build ~36 min
(one-time native compile); re-runs ~2 min.
