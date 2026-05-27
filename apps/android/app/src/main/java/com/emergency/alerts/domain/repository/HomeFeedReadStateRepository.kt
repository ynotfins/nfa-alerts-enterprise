package com.emergency.alerts.domain.repository

import kotlinx.coroutines.flow.Flow

interface HomeFeedReadStateRepository {
    fun observeLastSeenByAlertKey(): Flow<Map<String, Long>>

    suspend fun markSeen(alertKey: String, seenAtMillis: Long)
}
