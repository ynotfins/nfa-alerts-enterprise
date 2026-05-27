package com.emergency.alerts.domain.usecase

import com.emergency.alerts.domain.model.HomeFeedIncident
import com.emergency.alerts.domain.repository.HomeFeedReadStateRepository
import javax.inject.Inject

class MarkHomeFeedIncidentSeenUseCase @Inject constructor(
    private val homeFeedReadStateRepository: HomeFeedReadStateRepository
) {
    suspend operator fun invoke(incident: HomeFeedIncident) {
        homeFeedReadStateRepository.markSeen(
            alertKey = incident.readStateKey,
            seenAtMillis = incident.latestUpdateTimestamp
        )
    }
}
