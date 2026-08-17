package com.businessbirdy26.memorymatch;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Must run before super.onCreate() so the splash theme (styles.xml,
        // AppTheme.NoActionBarLaunch) is actually applied via the AndroidX compat
        // shim on API < 31, matching what the real platform SplashScreen API does
        // natively on API 31+.
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
    }
}
