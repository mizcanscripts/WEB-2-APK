package com.mzxhub.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import java.io.File

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        val s = webView.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.allowFileAccess = true
        s.allowContentAccess = true
        s.cacheMode = WebSettings.LOAD_DEFAULT
        s.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        s.loadWithOverviewMode = true
        s.useWideViewPort = true

        webView.webViewClient = WebViewClient()

        // Try to load config from /sdcard/AppForge/app-config.json
        val configFile = File("/sdcard/AppForge/app-config.json")
        if (configFile.exists()) {
            try {
                val json = JSONObject(configFile.readText())
                val url = json.optString("webUrl", "")
                if (url.isNotEmpty()) {
                    webView.loadUrl(url)
                    return
                }
            } catch (_: Exception) {}
        }

        // Fallback: load bundled HTML
        webView.loadUrl("file:///android_asset/index.html")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }
}
