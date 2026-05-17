package com.emergency.alerts

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

@HiltAndroidApp
class NFAAlertsApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Plant Timber for debug logging
        // In a real production setup we'd have a FirebaseCrashlyticsTree planted conditionally
        Timber.plant(Timber.DebugTree())
    }
}
