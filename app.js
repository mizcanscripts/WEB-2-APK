const $ = id => document.getElementById(id);

// ---------- PERMISSIONS LIST ----------
const PERMS = [
  ["INTERNET","Internet",true],
  ["ACCESS_NETWORK_STATE","Network State",true],
  ["ACCESS_WIFI_STATE","WiFi State"],
  ["READ_EXTERNAL_STORAGE","Read Files"],
  ["WRITE_EXTERNAL_STORAGE","Write Files"],
  ["MANAGE_EXTERNAL_STORAGE","Manage Files"],
  ["READ_MEDIA_IMAGES","Media Images"],
  ["READ_MEDIA_VIDEO","Media Video"],
  ["READ_MEDIA_AUDIO","Media Audio"],
  ["POST_NOTIFICATIONS","Notifications"],
  ["VIBRATE","Vibration",true],
  ["WAKE_LOCK","Wake Lock"],
  ["CAMERA","Camera"],
  ["RECORD_AUDIO","Microphone"],
  ["ACCESS_FINE_LOCATION","Location (Fine)"],
  ["ACCESS_COARSE_LOCATION","Location (Coarse)"],
  ["BLUETOOTH","Bluetooth"],
  ["BLUETOOTH_CONNECT","Bluetooth Connect"],
  ["NFC","NFC"],
  ["FOREGROUND_SERVICE","Foreground Service"],
  ["RECEIVE_BOOT_COMPLETED","Boot Start"],
  ["REQUEST_INSTALL_PACKAGES","Install Packages"],
  ["SYSTEM_ALERT_WINDOW","Overlay Window"],
  ["USE_BIOMETRIC","Biometric"],
  ["USE_FINGERPRINT","Fingerprint"],
  ["SET_WALLPAPER","Set Wallpaper"],
  ["FLASHLIGHT","Flashlight"]
];

const permContainer = $("permContainer");
PERMS.forEach(([id, label, def]) => {
  const l = document.createElement("label");
  l.className = "perm";
  l.innerHTML = `
    <input type="checkbox" data-perm="${id}" ${def ? "checked" : ""}/>
    <span class="box"></span>
    <span>${label}</span>
  `;
  permContainer.appendChild(l);
});

// ---------- LOGO ----------
const logoInput = $("logoInput");
const logoPreview = $("logoPreview");
const prevLogo = $("prevLogo");
let logoData = null;

$("logoDrop").addEventListener("click", () => logoInput.click());
logoInput.addEventListener("change", e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    logoData = ev.target.result;
    logoPreview.style.backgroundImage = `url(${logoData})`;
    logoPreview.textContent = "";
    prevLogo.style.backgroundImage = `url(${logoData})`;
  };
  r.readAsDataURL(f);
});

// ---------- ZIP ----------
const zipInput = $("zipInput");
const zipPreview = $("zipPreview");
let zipName = null;

$("zipDrop").addEventListener("click", () => zipInput.click());
zipInput.addEventListener("change", e => {
  const f = e.target.files[0]; if (!f) return;
  zipName = f.name;
  zipPreview.textContent = "✓ " + f.name;
  zipPreview.style.color = "#fff";
});

// ---------- LIVE PREVIEW ----------
$("appName").addEventListener("input", e => $("prevName").textContent = e.target.value || "App Name");
$("verName").addEventListener("input", e => $("prevVer").textContent = "v" + (e.target.value || "1.0.0"));

function pkg() {
  const suf = $("pkgSuffix").value.trim() || "example.myapp";
  return "com." + suf;
}
$("pkgSuffix").addEventListener("input", () => $("prevPkg").textContent = pkg());

// ---------- GENERATE ----------
function collect() {
  const perms = [...document.querySelectorAll(".perm input:checked")].map(p => `android.permission.${p.dataset.perm}`);
  const prot  = [...document.querySelectorAll(".tgl input:checked")].map(p => p.dataset.prot);
  return {
    appName: $("appName").value || "MyApp",
    packageName: pkg(),
    versionName: $("verName").value || "1.0.0",
    versionCode: parseInt($("verCode").value) || 1,
    webUrl: $("webUrl").value || "https://example.com",
    minSdk: parseInt($("minSdk").value),
    targetSdk: parseInt($("targetSdk").value),
    permissions: perms,
    protection: prot,
    sourceZip: zipName
  };
}

$("generateBtn").addEventListener("click", () => {
  const cfg = collect();
  $("output").textContent = JSON.stringify(cfg, null, 2);

  const pl = $("permList"); pl.innerHTML = "";
  cfg.permissions.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.replace("android.permission.","");
    pl.appendChild(li);
  });

  const pcl = $("protList"); pcl.innerHTML = "";
  cfg.protection.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    pcl.appendChild(li);
  });
});

// ---------- DOWNLOAD ZIP ----------
$("downloadZip").addEventListener("click", async () => {
  const cfg = collect();

  const uses = cfg.permissions.map(p => `    <uses-permission android:name="${p}"/>`).join("\n");

  const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${cfg.packageName}">

${uses}

    <application
        android:label="${cfg.appName}"
        android:icon="@mipmap/ic_launcher"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

    </application>
</manifest>`;

  const buildGradle = `android {
    compileSdk 34
    defaultConfig {
        applicationId "${cfg.packageName}"
        minSdk ${cfg.minSdk}
        targetSdk ${cfg.targetSdk}
        versionCode ${cfg.versionCode}
        versionName "${cfg.versionName}"
    }

    buildTypes {
        release {
            minifyEnabled ${cfg.protection.includes("OBFUSCATE") ? "true" : "false"}
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.webkit:webkit:1.8.0'
}`;

  const protectionReadme = `Protection Options Selected:
${cfg.protection.map(p => "- " + p).join("\n") || "- none"}

Recommended libs / steps:
- DEX2C:      Use a commercial packer (e.g. Bangcle, Tencent Legu) or open-source dex2c
- STRING:     Enable R8 string encryption via ProGuard rules
- ANTIDEBUG:  Add android:debuggable="false" + native anti-debug checks
- OBFUSCATE:  R8 / ProGuard with -repackageclasses + -allowaccessmodification
- SIGCHECK:   Verify APK signature hash at runtime
- OFFLINE:    Enable WebView cache + service worker in your HTML source
- AAB:        Build > Generate Signed Bundle > Android App Bundle`;

  const readme = `AppForge Export
================
App Name:     ${cfg.appName}
Package:      ${cfg.packageName}
Version:      ${cfg.versionName} (${cfg.versionCode})
WebView URL:  ${cfg.webUrl}
Min SDK:      ${cfg.minSdk}
Target SDK:   ${cfg.targetSdk}
Source ZIP:   ${cfg.sourceZip || "(none — WebView loads URL)"}

Permissions (${cfg.permissions.length}):
${cfg.permissions.map(p => "  - " + p).join("\n")}

Protection (${cfg.protection.length}):
${cfg.protection.map(p => "  - " + p).join("\n")}

NEXT STEPS
----------
1. Open Android Studio > New Project > Empty Views Activity
2. Set package name to: ${cfg.packageName}
3. Replace AndroidManifest.xml with the one in this ZIP
4. Merge build.gradle settings from build.gradle in this ZIP
5. Add logo as app/src/main/res/mipmap/ic_launcher.png (512x512)
${cfg.sourceZip ? `6. Extract ${cfg.sourceZip} into app/src/main/assets/` : `6. Set WebView URL to: ${cfg.webUrl}`}
7. Build > Generate Signed Bundle / APK
8. Choose AAB for Play Store, APK for direct install
`;

  const zip = new JSZip();
  zip.file("AndroidManifest.xml", manifest);
  zip.file("build.gradle", buildGradle);
  zip.file("app-config.json", JSON.stringify(cfg, null, 2));
  zip.file("PROTECTION.txt", protectionReadme);
  zip.file("README.txt", readme);

  // If user uploaded a ZIP, include it in export
  if (zipInput.files[0]) {
    const f = zipInput.files[0];
    const buf = await f.arrayBuffer();
    zip.file("source/" + f.name, buf);
  }

  const blob = await zip.generateAsync({ type:"blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cfg.appName.replace(/\s+/g,"_")}-config.zip`;
  a.click();
  URL.revokeObjectURL(url);
});
