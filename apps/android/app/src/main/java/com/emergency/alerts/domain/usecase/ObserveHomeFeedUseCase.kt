package com.emergency.alerts.domain.usecase

import com.emergency.alerts.core.result.Result
import com.emergency.alerts.domain.model.AuthSession
import com.emergency.alerts.domain.model.HomeFeedIncident
import com.emergency.alerts.domain.repository.AuthRepository
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

        return combine(incidentsFlow, userFlagsFlow, locationFlow) { incidentsResult, flagsResult, locationResult ->
            if (incidentsResult is Result.Error) return@combine Result.Error(incidentsResult.exception)
            
            val incidents = (incidentsResult as? Result.Success)?.data ?: emptyList()
            val flags = (flagsResult as? Result.Success)?.data ?: emptyList()
            val deviceLocation = (locationResult as? Result.Success)?.data

            val feed = incidents.map { incident ->
                val incidentFlags = flags.filter { it.incidentId == incident.id }
                
                var distance: Double? = null
                if (deviceLocation != null && incident.location.lat != 0.0 && incident.location.lng != 0.0) {
                    distance = calculateDistance(
                        deviceLocation.lat,
                        deviceLocation.lng,
                        incident.location.lat,
                        incident.location.lng
                    )
                }

                HomeFeedIncident(
                    incident = incident,
                    isFavorite = incidentFlags.any { it.action == "favorite" },
                    isBookmarked = incidentFlags.any { it.action == "bookmark" },
                    isHidden = incidentFlags.any { it.action == "hide" },
                    isMuted = incidentFlags.any { it.action == "mute" },
                    hasViewed = incidentFlags.any { it.action == "view" },
                    distanceMiles = distance
                )
            }.sortedByDescending { 
                if (it.incident.updatedAt > 0L) it.incident.updatedAt else it.incident.createdAt
            }
            
            Result.Success(feed)
        }
    }
}
