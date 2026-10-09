const $ = id => document.getElementById(id);

const logoInput   = $("logoInput");
const logoPreview = $("logoPreview");
const prevLogo    = $("prevLogo");
let logoData = null;

// ---- LOGO UPLOAD ----
$("logoDrop").addEventListener("click", () => logoInput.click());

logoInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    logoData = ev.target.result;
    logoPreview.style.backgroundImage = `url(${logoData})`;
    logoPreview.textContent = "";
    prevLogo.style.backgroundImage = `url(${logoData})`;
  };
  reader.readAsDataURL(file);
});

// ---- LIVE PREVIEW ----
const fields = {
  appName: $("prevName"),
  verName: $("prevVer")
};

$("appName").addEventListener("input", e => fields.appName.textContent = e.target.value || "App Name");
$("verName").addEventListener("input", e => fields.verName.textContent = "v" + (e.target.value || "1.0.0"));

// ---- GENERATE CONFIG ----
$("generateBtn").addEventListener("click", () => {
  const perms = [...document.querySelectorAll(".perm input:checked")]
    .map(p => `android.permission.${p.dataset.perm}`);

  const config = {
    appName: $("appName").value || "MyApp",
    packageName: $("pkgName").value || "com.example.myapp",
    versionName: $("verName").value || "1.0.0",
    versionCode: parseInt($("verCode").value) || 1,
    webUrl: $("webUrl").value || "https://example.com",
    minSdk: parseInt($("minSdk").value),
    targetSdk: parseInt($("targetSdk").value),
    permissions: perms,
    playStoreAAB: $("playStore").checked
  };

  $("output").textContent = JSON.stringify(config, null, 2);

  const list = $("permList");
  list.innerHTML = "";
  perms.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.replace("android.permission.", "");
    list.appendChild(li);
  });
});

// ---- DOWNLOAD ZIP ----
$("downloadZip").addEventListener("click", async () => {
  const name = $("appName").value || "MyApp";
  const pkg  = $("pkgName").value || "com.example.myapp";
  const ver  = $("verName").value || "1.0.0";

  const perms = [...document.querySelectorAll(".perm input:checked")]
    .map(p => `    <uses-permission android:name="android.permission.${p.dataset.perm}"/>`)
    .join("\n");

  const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${pkg}">

${perms}

    <application
        android:label="${name}"
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

  const config = {
    appName: name,
    packageName: pkg,
    versionName: ver,
    versionCode: parseInt($("verCode").value) || 1,
    webUrl: $("webUrl").value || "https://example.com",
    minSdk: parseInt($("minSdk").value),
    targetSdk: parseInt($("targetSdk").value),
    permissions: perms ? perms.match(/android\.permission\.\w+/g) : [],
    playStoreAAB: $("playStore").checked
  };

  const zip = new JSZip();
  zip.file("AndroidManifest.xml", manifest);
  zip.file("app-config.json", JSON.stringify(config, null, 2));
  zip.file("README.txt",
`App Builder Export
------------------
App: ${name}
Package: ${pkg}
Version: ${ver}

Next steps:
1. Open Android Studio
2. Create a new "Empty Views Activity" project
3. Use package name: ${pkg}
4. Replace AndroidManifest.xml with the one in this zip
5. Add your logo as app/src/main/res/mipmap/ic_launcher.png (512x512)
6. Set the WebView URL to: ${config.webUrl}
7. Build > Generate Signed Bundle / APK
8. Choose AAB for Play Store, APK for direct install

Done.`);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g,"_")}-config.zip`;
  a.click();
  URL.revokeObjectURL(url);
});
