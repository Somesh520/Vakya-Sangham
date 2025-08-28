package com.vakyasangam

import android.os.Bundle // ✅ Yeh import add karna hai
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen // ✅ Yeh import add karna hai

class MainActivity : ReactActivity() {

    // ✅ Yeh poora function add karna hai
    override fun onCreate(savedInstanceState: Bundle?) {
        SplashScreen.show(this) // Splash screen ko dikhata hai
        super.onCreate(savedInstanceState)
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "VakyaSangam"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}