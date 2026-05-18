package com.emergency.alerts.domain.usecase

import android.location.Location
import javax.inject.Inject
import kotlin.math.round

class CalculateDistanceUseCase @Inject constructor() {

    companion object {
        private const val METERS_IN_MILE = 1609.344
    }

    /**
     * Calculates the distance in miles between two coordinate pairs.
     */
    operator fun invoke(startLat: Double, startLng: Double, endLat: Double, endLng: Double): Double {
        val results = FloatArray(1)
        Location.distanceBetween(startLat, startLng, endLat, endLng, results)
        val meters = results[0]
        val miles = meters / METERS_IN_MILE
        return round(miles * 10) / 10.0 // Round to 1 decimal place
    }
}
