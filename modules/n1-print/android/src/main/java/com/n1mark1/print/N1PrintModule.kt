package com.n1mark1.print

import android.content.Context
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.WebView
import android.webkit.WebViewClient
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil

/**
 * Prints an HTML page through Android's print framework, whose dialog lists
 * every printer the installed print services can reach (Wi-Fi, network,
 * Bluetooth) and Save as PDF.
 */
class N1PrintModule(reactContext: ReactApplicationContext) : NativeN1PrintSpec(reactContext) {

  // Held while printing: a collected WebView hands the print system blank pages.
  private var webView: WebView? = null

  override fun printHtml(html: String, jobName: String, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "There's no screen to print from")
      return
    }
    UiThreadUtil.runOnUiThread {
      val view = WebView(activity)
      webView = view
      view.webViewClient = object : WebViewClient() {
        private var printed = false

        override fun onPageFinished(page: WebView, url: String?) {
          if (printed) return
          printed = true
          try {
            val manager = activity.getSystemService(Context.PRINT_SERVICE) as PrintManager
            manager.print(
              jobName,
              page.createPrintDocumentAdapter(jobName),
              PrintAttributes.Builder().build(),
            )
            promise.resolve(null)
          } catch (e: Exception) {
            promise.reject("E_PRINT", e.message, e)
          }
        }
      }
      view.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
    }
  }

  companion object {
    const val NAME = NativeN1PrintSpec.NAME
  }
}
