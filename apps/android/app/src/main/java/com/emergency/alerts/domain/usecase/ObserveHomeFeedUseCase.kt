package com.emergency.alerts.domain.usecase

import com.emergency.alerts.core.result.Result
import com.emergency.alerts.domain.model.AuthSession
import com.emergency.alerts.domain.model.Incident
import com.emergency.alerts.domain.model.HomeFeedIncident
import com.emergency.alerts.domain.repository.AuthRepository
import com.emergency.alerts.domain.repository.DeviceLocation
import com.emergency.alerts.domain.repository.HomeFeedReadStateRepository
import com.emergency.alerts.domain.repository.IncidentRepository
import com.emergency.alerts.domain.repository.LocationRepository
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import javax.inject.Inject

class ObserveHomeFeedUseCase @Inject constructor(
    private val incidentRepository: IncidentRepository,
    private val authRepository: AuthRepository,
    private val homeFeedReadStateRepository: HomeFeedReadStateRepository,
    private val locationRepository: LocationRepository,
    private val calculateDistance: CalculateDistanceUseCase
) {

    @OptIn(ExperimentalCoroutinesApi::class)
    operator fun invoke(activeOnly: Boolean = true): Flow<Result<List<HomeFeedIncident>>> {
        val incidentsFlow = incidentRepository.observeHomeIncidents(activeOnly)
        
        val userFlagsFlow = authRepository.observeSession().flatMapLatest { sessionResult ->
            if (sessionResult is Result.Success && sessionResult.data is AuthSession.Authenticated) {
                incidentRepository.observeUserFlags(sessionResult.data.profile.id)
            } else {
                flowOf(Result.Success(emptyList()))
            }
        }
        
        val locationFlow = locationRepository.observeDeviceLocation()
        val readStateFlow = homeFeedReadStateRepository.observeLastSeenByAlertKey()

        return combine(incidentsFlow, userFlagsFlow, locationFlow, readStateFlow) { incidentsResult, flagsResult, locationResult, lastSeenByAlertKey ->
            if (incidentsResult is Result.Error) return@combine Result.Error(incidentsResult.exception)
            
            val incidents = (incidentsResult as? Result.Success)?.data ?: emptyList()
            val flags = (flagsResult as? Result.Success)?.data ?: emptyList()
            
            // Note: Don't treat a location error as a feed error, just ignore the location
            val deviceLocation = (locationResult as? Result.Success)?.data

            // Deduplicate by alertId (keep newest update per alertId). If alertId is null use incident.id.
            val newestByKey = incidents.groupBy { it.homeFeedGroupingKey() }
                .mapValues { entry ->
                    entry.value.maxWithOrNull(homeFeedIncidentComparator)!!
                }
                .values
                .toList()

            val feed = newestByKey.map { incident ->
                val incidentFlags = flags.filter { it.incidentId == incident.id }
                val latestUpdateTimestamp = incident.latestHomeFeedTimestamp()
                val readStateKey = incident.readStateKey()
                val lastSeenTimestamp = lastSeenByAlertKey[readStateKey]
                val updateCount = incident.activityCount?.coerceAtLeast(0L)?.toInt() ?: 0
                val distance = incident.distanceFrom(deviceLocation, calculateDistance)

                HomeFeedIncident(
                    incident = incident,
                    isFavorite = incidentFlags.any { it.action == "favorite" },
                    isBookmarked = incidentFlags.any { it.action == "bookmark" },
                    isHidden = incidentFlags.any { it.action == "hide" },
                    isMuted = incidentFlags.any { it.action == "mute" },
                    hasViewed = incidentFlags.any { it.action == "view" },
                    distanceMiles = distance,
                    latestUpdateTimestamp = latestUpdateTimestamp,
                    readStateKey = readStateKey,
                    lastSeenTimestamp = lastSeenTimestamp,
                    isUnread = latestUpdateTimestamp > (lastSeenTimestamp ?: 0L),
                    updateCount = updateCount
                )
            }.sortedWith(homeFeedComparator)
            
            Result.Success(feed)
        }
    }
}

private fun Incident.homeFeedGroupingKey(): String {
    return alertId?.takeIf { it.isNotBlank() } ?: id
}

private fun Incident.readStateKey(): String {
    return alertId
        ?.takeIf { it.isNotBlank() }
        ?.let { "alert:$it" }
        ?: "incident:$id"
}

private fun Incident.latestHomeFeedTimestamp(): Long {
    return updatedAt.takeIf { it > 0L }
        ?: createdAt.takeIf { it > 0L }
        ?: 0L
}

private val homeFeedIncidentComparator =
    compareBy<Incident>({ it.latestHomeFeedTimestamp() }, { it.createdAt.coerceAtLeast(0L) }, { it.id })

private val homeFeedComparator =
    compareByDescending<HomeFeedIncident> { it.latestUpdateTimestamp }
        .thenByDescending { it.incident.createdAt.coerceAtLeast(0L) }
        .thenBy { it.readStateKey }

private fun Incident.distanceFrom(
    deviceLocation: DeviceLocation?,
    calculateDistance: CalculateDistanceUseCase
): Double? {
    if (deviceLocation == null) return null
    if (!location.hasUsableLatLng()) return null

    return calculateDistance(
        deviceLocation.lat,
        deviceLocation.lng,
        location.lat,
        location.lng
    )
}

private fun com.emergency.alerts.domain.model.LocationData.hasUsableLatLng(): Boolean {
    val hasRangeValidCoordinates = lat in -90.0..90.0 && lng in -180.0..180.0
    val isMissingDefaultCoordinate = lat == 0.0 && lng == 0.0
    return hasRangeValidCoordinates && !isMissingDefaultCoordinate
}
