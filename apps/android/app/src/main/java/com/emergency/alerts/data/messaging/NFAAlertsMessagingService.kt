package com.emergency.alerts.data.messaging

import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.emergency.alerts.domain.repository.AuthRepository
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

@AndroidEntryPoint
class NFAAlertsMessagingService : FirebaseMessagingService() {

    @Inject
    lateinit var authRepository: AuthRepository

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Timber.d("New FCM token received: $token")
        
        serviceScope.launch {
            authRepository.updatePushToken(token)
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        Timber.d("Message received from: ${message.from}")

        // For NFA Alerts, we ensure the emergency channel exists before showing the notification
        setupNotificationChannels()

        // Further implementation would extract message.data and build a local notification
        // if not handled automatically by FCM payload.
    }

    private fun setupNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelId = "emergency_alerts"
            val channelName = "Emergency Alerts"
            val channelDescription = "Critical notifications for new emergency incidents"
            
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(channelId, channelName, importance).apply {
                description = channelDescription
                enableVibration(true)
                vibrationPattern = longArrayOf(
                    VIBRATION_OFF_1,
                    VIBRATION_ON_1,
                    VIBRATION_OFF_2,
                    VIBRATION_ON_2
                )
            }
            
            val notificationManager: NotificationManager =
                getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    companion object {
        private const val VIBRATION_OFF_1 = 0L
        private const val VIBRATION_ON_1 = 500L
        private const val VIBRATION_OFF_2 = 200L
        private const val VIBRATION_ON_2 = 500L
    }
}
