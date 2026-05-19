package com.emergency.alerts.data.repository

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.os.Looper
import androidx.core.content.ContextCompat
import com.emergency.alerts.core.result.Result
import com.emergency.alerts.domain.repository.DeviceLocation
import com.emergency.alerts.domain.repository.LocationRepository
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AndroidLocationRepository @Inject constructor(
    @ApplicationContext private val context: Context
) : LocationRepository {

    companion object {
        private const val UPDATE_INTERVAL_MS = 10000L
        private const val MIN_UPDATE_INTERVAL_MS = 5000L
    }

    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)

    @SuppressLint("MissingPermission")
    override fun observeDeviceLocation(): Flow<Result<DeviceLocation>> = callbackFlow {
        if (!hasLocationPermissionSync()) {
            trySend(Result.Error(SecurityException("Missing location permissions")))
            // Suspend until cancelled so we don't prematurely close and kill the combine flow upstream
            awaitClose {}
            return@callbackFlow
        }

        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, UPDATE_INTERVAL_MS)
            .setMinUpdateIntervalMillis(MIN_UPDATE_INTERVAL_MS)
            .build()

        val locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { loc ->
                    trySend(
                        Result.Success(
                            DeviceLocation(
                                lat = loc.latitude,
                                lng = loc.longitude,
                                accuracy = loc.accuracy
                            )
                        )
                    )
                }
            }
        }

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
        } catch (e: SecurityException) {
            Timber.e(e, "SecurityException while requesting location updates")
            trySend(Result.Error(e))
        }

        awaitClose {
            fusedLocationClient.removeLocationUpdates(locationCallback)
        }
    }

    override suspend fun hasLocationPermission(): Boolean {
        return hasLocationPermissionSync()
    }

    private fun hasLocationPermissionSync(): Boolean {
        val fineLocation = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val coarseLocation = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        return fineLocation || coarseLocation
    }
}
