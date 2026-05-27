package com.emergency.alerts.domain.repository

import com.emergency.alerts.domain.model.HighAlertConfig
import com.emergency.alerts.domain.model.HomeFeedFilters
import com.emergency.alerts.domain.model.HomeFeedPreferences
import kotlinx.coroutines.flow.Flow

interface HomeFeedPreferencesRepository {
    fun observePreferences(): Flow<HomeFeedPreferences>

    suspend fun toggleFavorite(alertKey: String)

    suspend fun toggleBookmark(alertKey: String)

    suspend fun toggleSilent(alertKey: String)

    suspend fun toggleHidden(alertKey: String)

    suspend fun clearHidden()

    suspend fun setFilters(filters: HomeFeedFilters)

    suspend fun setHighAlertConfig(config: HighAlertConfig)
}
