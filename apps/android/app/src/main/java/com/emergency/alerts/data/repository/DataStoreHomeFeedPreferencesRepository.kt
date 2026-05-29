package com.emergency.alerts.data.repository

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.emergency.alerts.domain.model.HighAlertConfig
import com.emergency.alerts.domain.model.HomeDistanceFilterOption
import com.emergency.alerts.domain.model.HomeFeedFilters
import com.emergency.alerts.domain.model.HomeFeedPreferences
import com.emergency.alerts.domain.model.HomeUpdateFilterOption
import com.emergency.alerts.domain.model.isActive
import com.emergency.alerts.domain.repository.HomeFeedPreferencesRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.homeFeedPreferencesDataStore by preferencesDataStore(name = "home_feed_preferences")

@Singleton
class DataStoreHomeFeedPreferencesRepository @Inject constructor(
    @ApplicationContext private val context: Context
) : HomeFeedPreferencesRepository {

    override fun observePreferences(): Flow<HomeFeedPreferences> {
        return context.homeFeedPreferencesDataStore.data.map { preferences ->
            val hasUserModifiedFilters = preferences[booleanPreferencesKey(KEY_FILTERS_USER_MODIFIED)] ?: false

            HomeFeedPreferences(
                favoriteAlertKeys = preferences[stringSetPreferencesKey(KEY_FAVORITES)].orEmpty(),
                bookmarkAlertKeys = preferences[stringSetPreferencesKey(KEY_BOOKMARKS)].orEmpty(),
                silentAlertKeys = preferences[stringSetPreferencesKey(KEY_SILENT)].orEmpty(),
                hiddenAlertKeys = preferences[stringSetPreferencesKey(KEY_HIDDEN)].orEmpty(),
                filters = if (hasUserModifiedFilters) {
                    HomeFeedFilters(
                        selectedAlertTypes = preferences[stringSetPreferencesKey(KEY_FILTER_TYPES)].orEmpty(),
                        distanceFilter = preferences[stringPreferencesKey(KEY_FILTER_DISTANCE)]
                            .toDistanceFilter(),
                        updateFilter = preferences[stringPreferencesKey(KEY_FILTER_UPDATES)]
                            .toUpdateFilter(),
                        keywordQuery = preferences[stringPreferencesKey(KEY_FILTER_KEYWORD)].orEmpty(),
                        selectedDepartmentCodes = preferences[stringSetPreferencesKey(KEY_FILTER_DEPARTMENTS)].orEmpty(),
                        highAlertOnly = preferences[booleanPreferencesKey(KEY_FILTER_HIGH_ALERT_ONLY)] ?: false
                    )
                } else {
                    HomeFeedFilters()
                },
                highAlertConfig = HighAlertConfig(
                    enabled = preferences[booleanPreferencesKey(KEY_HIGH_ALERT_ENABLED)] ?: false,
                    selectedAlertTypes = preferences[stringSetPreferencesKey(KEY_HIGH_ALERT_TYPES)].orEmpty(),
                    selectedKeywords = preferences[stringSetPreferencesKey(KEY_HIGH_ALERT_KEYWORDS)].orEmpty(),
                    selectedDepartments = preferences[stringSetPreferencesKey(KEY_HIGH_ALERT_DEPARTMENTS)].orEmpty(),
                    maxDistanceMiles = preferences[intPreferencesKey(KEY_HIGH_ALERT_MAX_DISTANCE)],
                    minUpdateCount = preferences[intPreferencesKey(KEY_HIGH_ALERT_MIN_UPDATES)] ?: 0,
                    vibrationEnabled = preferences[booleanPreferencesKey(KEY_HIGH_ALERT_VIBRATION)] ?: true,
                    sirenEnabled = preferences[booleanPreferencesKey(KEY_HIGH_ALERT_SIREN)] ?: false,
                    flashlightStrobeEnabled = preferences[booleanPreferencesKey(KEY_HIGH_ALERT_STROBE)] ?: false
                )
            )
        }
    }

    override suspend fun toggleFavorite(alertKey: String) {
        updateStringSet(KEY_FAVORITES, alertKey)
    }

    override suspend fun toggleBookmark(alertKey: String) {
        updateStringSet(KEY_BOOKMARKS, alertKey)
    }

    override suspend fun toggleSilent(alertKey: String) {
        updateStringSet(KEY_SILENT, alertKey)
    }

    override suspend fun toggleHidden(alertKey: String) {
        updateStringSet(KEY_HIDDEN, alertKey)
    }

    override suspend fun clearHidden() {
        context.homeFeedPreferencesDataStore.edit { preferences ->
            preferences[stringSetPreferencesKey(KEY_HIDDEN)] = emptySet()
        }
    }

    override suspend fun setFilters(filters: HomeFeedFilters) {
        context.homeFeedPreferencesDataStore.edit { preferences ->
            preferences[stringSetPreferencesKey(KEY_FILTER_TYPES)] = filters.selectedAlertTypes
            preferences[stringPreferencesKey(KEY_FILTER_DISTANCE)] = filters.distanceFilter.name
            preferences[stringPreferencesKey(KEY_FILTER_UPDATES)] = filters.updateFilter.name
            preferences[stringPreferencesKey(KEY_FILTER_KEYWORD)] = filters.keywordQuery
            preferences[stringSetPreferencesKey(KEY_FILTER_DEPARTMENTS)] = filters.selectedDepartmentCodes
            preferences[booleanPreferencesKey(KEY_FILTER_HIGH_ALERT_ONLY)] = filters.highAlertOnly
            preferences[booleanPreferencesKey(KEY_FILTERS_USER_MODIFIED)] = filters.isActive()
        }
    }

    override suspend fun setHighAlertConfig(config: HighAlertConfig) {
        context.homeFeedPreferencesDataStore.edit { preferences ->
            preferences[booleanPreferencesKey(KEY_HIGH_ALERT_ENABLED)] = config.enabled
            preferences[stringSetPreferencesKey(KEY_HIGH_ALERT_TYPES)] = config.selectedAlertTypes
            preferences[stringSetPreferencesKey(KEY_HIGH_ALERT_KEYWORDS)] = config.selectedKeywords
            preferences[stringSetPreferencesKey(KEY_HIGH_ALERT_DEPARTMENTS)] = config.selectedDepartments
            if (config.maxDistanceMiles != null) {
                preferences[intPreferencesKey(KEY_HIGH_ALERT_MAX_DISTANCE)] = config.maxDistanceMiles
            } else {
                preferences.remove(intPreferencesKey(KEY_HIGH_ALERT_MAX_DISTANCE))
            }
            preferences[intPreferencesKey(KEY_HIGH_ALERT_MIN_UPDATES)] = config.minUpdateCount
            preferences[booleanPreferencesKey(KEY_HIGH_ALERT_VIBRATION)] = config.vibrationEnabled
            preferences[booleanPreferencesKey(KEY_HIGH_ALERT_SIREN)] = config.sirenEnabled
            preferences[booleanPreferencesKey(KEY_HIGH_ALERT_STROBE)] = config.flashlightStrobeEnabled
        }
    }

    override suspend fun resetFilters() {
        context.homeFeedPreferencesDataStore.edit { preferences ->
            preferences[stringSetPreferencesKey(KEY_FILTER_TYPES)] = emptySet()
            preferences[stringPreferencesKey(KEY_FILTER_DISTANCE)] = HomeDistanceFilterOption.Any.name
            preferences[stringPreferencesKey(KEY_FILTER_UPDATES)] = HomeUpdateFilterOption.Any.name
            preferences[stringPreferencesKey(KEY_FILTER_KEYWORD)] = ""
            preferences[stringSetPreferencesKey(KEY_FILTER_DEPARTMENTS)] = emptySet()
            preferences[booleanPreferencesKey(KEY_FILTER_HIGH_ALERT_ONLY)] = false
            preferences[booleanPreferencesKey(KEY_FILTERS_USER_MODIFIED)] = false

            preferences[stringSetPreferencesKey(KEY_HIGH_ALERT_TYPES)] = emptySet()
            preferences[stringSetPreferencesKey(KEY_HIGH_ALERT_KEYWORDS)] = emptySet()
            preferences[stringSetPreferencesKey(KEY_HIGH_ALERT_DEPARTMENTS)] = emptySet()
            preferences.remove(intPreferencesKey(KEY_HIGH_ALERT_MAX_DISTANCE))
            preferences[intPreferencesKey(KEY_HIGH_ALERT_MIN_UPDATES)] = 0
        }
    }

    private suspend fun updateStringSet(keyName: String, value: String) {
        context.homeFeedPreferencesDataStore.edit { preferences ->
            val key = stringSetPreferencesKey(keyName)
            val current = preferences[key].orEmpty().toMutableSet()
            if (!current.add(value)) {
                current.remove(value)
            }
            preferences[key] = current
        }
    }

    private fun String?.toDistanceFilter(): HomeDistanceFilterOption {
        return HomeDistanceFilterOption.entries.firstOrNull { it.name == this }
            ?: HomeDistanceFilterOption.Any
    }

    private fun String?.toUpdateFilter(): HomeUpdateFilterOption {
        return HomeUpdateFilterOption.entries.firstOrNull { it.name == this }
            ?: HomeUpdateFilterOption.Any
    }

    private companion object {
        private const val KEY_FAVORITES = "home_favorites"
        private const val KEY_BOOKMARKS = "home_bookmarks"
        private const val KEY_SILENT = "home_silent"
        private const val KEY_HIDDEN = "home_hidden"
        private const val KEY_FILTER_TYPES = "home_filter_types"
        private const val KEY_FILTER_DISTANCE = "home_filter_distance"
        private const val KEY_FILTER_UPDATES = "home_filter_updates"
        private const val KEY_FILTER_KEYWORD = "home_filter_keyword"
        private const val KEY_FILTER_DEPARTMENTS = "home_filter_departments"
        private const val KEY_FILTER_HIGH_ALERT_ONLY = "home_filter_high_alert_only"
        private const val KEY_FILTERS_USER_MODIFIED = "home_filters_user_modified"
        private const val KEY_HIGH_ALERT_ENABLED = "home_high_alert_enabled"
        private const val KEY_HIGH_ALERT_TYPES = "home_high_alert_types"
        private const val KEY_HIGH_ALERT_KEYWORDS = "home_high_alert_keywords"
        private const val KEY_HIGH_ALERT_DEPARTMENTS = "home_high_alert_departments"
        private const val KEY_HIGH_ALERT_MAX_DISTANCE = "home_high_alert_max_distance"
        private const val KEY_HIGH_ALERT_MIN_UPDATES = "home_high_alert_min_updates"
        private const val KEY_HIGH_ALERT_VIBRATION = "home_high_alert_vibration"
        private const val KEY_HIGH_ALERT_SIREN = "home_high_alert_siren"
        private const val KEY_HIGH_ALERT_STROBE = "home_high_alert_strobe"
    }
}
