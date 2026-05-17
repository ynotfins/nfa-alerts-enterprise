package com.emergency.alerts.domain.repository

import com.emergency.alerts.core.result.Result
import kotlinx.coroutines.flow.Flow

data class DeviceLocation(val lat: Double, val lng: Double, val accuracy: Float)

interface LocationRepository {
    fun observeDeviceLocation(): Flow<Result<DeviceLocation>>
    suspend fun hasLocationPermission(): Boolean
}
