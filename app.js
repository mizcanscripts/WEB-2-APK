/* =========================================================
   AppForge — app.js
   Full build: drag & drop, clipboard paste, permissions,
   protection toggles, live preview, ZIP export.
   ========================================================= */

const $ = id => document.getElementById(id);

/* ---------------------------------------------------------
   1. PERMISSIONS
   --------------------------------------------------------- */
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

/* ---------------------------------------------------------
   2. LOGO — click, drag & drop, clipboard paste
   --------------------------------------------------------- */
const logoInput   = $("logoInput");
const logoPreview = $("logoPreview");
const prevLogo    = $("prevLogo");
const logoDropEl  = $("logoDrop");
let logoData = null;

logoDropEl.addEventListener("click", () => logoInput.click());
logoInput.addEventListener("change", e => {
  const f = e.target.files[0];
  if (f) setLogo(f);
});

["dragover","dragenter"].forEach(ev =>
  logoDropEl.addEventListener(ev, e => {
    e.preventDefault(); e.stopPropagation();
    logoDropEl.classList.add("dragging");
  })
);
logoDropEl.addEventListener("dragleave", e => {
  e.preventDefault(); e.stopPropagation();
  logoDropEl.classList.remove("dragging");
});
logoDropEl.addEventListener("drop", e => {
  e.preventDefault(); e.stopPropagation();
  logoDropEl.classList.remove("dragging");

  const f = e.dataTransfer.files[0];
  if (!f) return;
  if (!f.type.startsWith("image/")) {
    logoPreview.textContent = "❌ Not an image";
    return;
  }
  setLogo(f);
});

// paste from clipboard (Ctrl+V)
document.addEventListener("paste", e => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const it of items) {
    if (it.type.startsWith("image/")) {
      const f = it.getAsFile();
      if (f) { setLogo(f); break; }
    }
  }
});

function setLogo(file) {
  const r = new FileReader();
  r.onload = ev => {
    logoData = ev.target.result;
    logoPreview.style.backgroundImage = `url(${logoData})`;
    logoPreview.textContent = "";
    prevLogo.style.backgroundImage = `url(${logoData})`;
  };
  r.readAsDataURL(file);
}

/* ---------------------------------------------------------
   3. ZIP / HTML SOURCE — click + drag & drop
   --------------------------------------------------------- */
const zipInput    = $("zipInput");
const zipPreview  = $("zipPreview");
const zipDropEl   = $("zipDrop");
let zipName = null;

zipDropEl.addEventListener("click", () => zipInput.click());
zipInput.addEventListener("change", e => {
  const f = e.target.files[0];
  if (f) setZip(f);
});

["dragover","dragenter"].forEach(ev =>
  zipDropEl.addEventListener(ev, e => {
    e.preventDefault(); e.stopPropagation();
    zipDropEl.classList.add("dragging");
  })
);
zipDropEl.addEventListener("dragleave", e => {
  e.preventDefault(); e.stopPropagation();
  zipDropEl.classList.remove("dragging");
});
zipDropEl.addEventListener("drop", e => {
  e.preventDefault(); e.stopPropagation();
  zipDropEl.classList.remove("dragging");

  const f = e.dataTransfer.files[0];
  if (!f) return;

  if (!/\.(zip|html?)$/i.test(f.name)) {
    zipPreview.textContent = "❌ Only .zip or .html";
    zipPreview.style.color = "#ff8080";
    return;
  }
  setZip(f);
});

function setZip(file) {
  zipName = file.name;
  zipPreview.textContent = "✓ " + file.name;
  zipPreview.style.color = "#fff";
}

/* ---------------------------------------------------------
   4. LIVE PREVIEW
   --------------------------------------------------------- */
$("appName").addEventListener("input", e =>
  $("prevName").textContent = e.target.value || "App Name"
);
$("verName").addEventListener("input", e =>
  $("prevVer").textContent = "v" + (e.target.value || "1.0.0")
);

function pkg() {
  const suf = $("pkgSuffix").value.trim() || "example.myapp";
  return "com." + suf;
}
$("pkgSuffix").addEventListener("input", () =>
  $("prevPkg").textContent = pkg()
);

/* ---------------------------------------------------------
   5. COLLECT FORM DATA
   --------------------------------------------------------- */
function collect() {
  const perms = [...document.querySelectorAll(".perm input:checked")]
    .map(p => `android.permission.${p.dataset.perm}`);

  const prot = [...document.querySelectorAll(".tgl input:checked")]
    .map(p => p.dataset.prot);

  return {
    appName:      $("appName").value || "MyApp",
    packageName:  pkg(),
    versionName:  $("verName").value || "1.0.0",
    versionCode:  parseInt($("verCode").value) || 1,
    webUrl:       $("webUrl").value || "https://example.com",
    minSdk:       parseInt($("minSdk").value),
    targetSdk:    parseInt($("targetSdk").value),
    permissions:  perms,
    protection:   prot,
    sourceZip:    zipName
  };
}

/* ---------------------------------------------------------
   6. GENERATE (preview panel)
   --------------------------------------------------------- */
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

/* ---------------------------------------------------------
   7. DOWNLOAD ZIP
   --------------------------------------------------------- */
$("downloadZip").addEventListener("click", async () => {
  const cfg = collect();

  const uses = cfg.permissions
    .map(p => `    <uses-permission android:name="${p}"/>`)
    .join("\n");

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

  const protectionReadme = `Protection Options Selected
==========================
${cfg.protection.map(p => "- " + p).join("\n") || "- none selected"}

Recommended implementation:
- DEX2C:      Use a commercial packer (Bangcle, Tencent Legu) or an
              open-source dex2c tool to convert Dalvik bytecode to C.
- STRING:     Enable R8 string encryption via ProGuard rules.
- ANTIDEBUG:  Set android:debuggable="false" and add native
              anti-debug checks (ptrace detection).
- OBFUSCATE:  R8/ProGuard with -repackageclasses and
              -allowaccessmodification for maximum renaming.
- SIGCHECK:   Verify APK signature hash at runtime against a
              known-good value to detect repackaging.
- OFFLINE:    Enable WebView cache + service worker in the HTML
              source so the app works without internet.
- AAB:        Build > Generate Signed Bundle > Android App Bundle
              in Android Studio (required for Play Store upload).
`;

  const readme = `AppForge Export
================
App Name:     ${cfg.appName}
Package:      ${cfg.packageName}
Version:      ${cfg.versionName} (${cfg.versionCode})
WebView URL:  ${cfg.webUrl}
Min SDK:      ${cfg.minSdk}
Target SDK:   ${cfg.targetSdk}
Source ZIP:   ${cfg.sourceZip || "(none — WebView loads URL directly)"}

Permissions (${cfg.permissions.length}):
${cfg.permissions.map(p => "  - " + p).join("\n")}

Protection (${cfg.protection.length}):
${cfg.protection.map(p => "  - " + p).join("\n")}

NEXT STEPS
----------
1.  Open Android Studio > New Project > Empty Views Activity.
2.  Set package name to: ${cfg.packageName}
3.  Replace AndroidManifest.xml with the one in this ZIP.
4.  Merge build.gradle settings from build.gradle in this ZIP.
5.  Add logo as app/src/main/res/mipmap/ic_launcher.png (512x512).
${cfg.sourceZip
    ? `6.  Extract ${cfg.sourceZip} into app/src/main/assets/ and load it in the WebView.`
    : `6.  Set the WebView URL to: ${cfg.webUrl}`}
7.  Build > Generate Signed Bundle / APK.
8.  Choose AAB for Play Store, APK for direct install.
`;

  const zip = new JSZip();
  zip.file("AndroidManifest.xml", manifest);
  zip.file("build.gradle", buildGradle);
  zip.file("app-config.json", JSON.stringify(cfg, null, 2));
  zip.file("PROTECTION.txt", protectionReadme);
  zip.file("README.txt", readme);

  // include uploaded source zip if present
  if (zipInput.files[0]) {
    const f = zipInput.files[0];
    const buf = await f.arrayBuffer();
    zip.file("source/" + f.name, buf);
  }

  // include logo if present
  if (logoData) {
    const base64 = logoData.split(",")[1];
    zip.file("logo.png", base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${cfg.appName.replace(/\s+/g,"_")}-config.zip`;
  a.click();
  URL.revokeObjectURL(url);
});
