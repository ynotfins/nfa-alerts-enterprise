package com.emergency.alerts.data.repository

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.emergency.alerts.domain.repository.HomeFeedReadStateRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.homeFeedReadStateDataStore by preferencesDataStore(name = "home_feed_read_state")

@Singleton
class DataStoreHomeFeedReadStateRepository @Inject constructor(
    @ApplicationContext private val context: Context
) : HomeFeedReadStateRepository {

    override fun observeLastSeenByAlertKey(): Flow<Map<String, Long>> {
        return context.homeFeedReadStateDataStore.data.map { preferences ->
            preferences.asMap()
                .mapNotNull { (key, value) ->
                    key.name
                        .takeIf { it.startsWith(PREFERENCE_PREFIX) }
                        ?.removePrefix(PREFERENCE_PREFIX)
                        ?.let { alertKey ->
                            val timestamp = value as? Long ?: return@mapNotNull null
                            alertKey to timestamp
                        }
                }
                .toMap()
        }
    }

    override suspend fun markSeen(alertKey: String, seenAtMillis: Long) {
        context.homeFeedReadStateDataStore.edit { preferences ->
            preferences[preferenceKey(alertKey)] = seenAtMillis
        }
    }

    private fun preferenceKey(alertKey: String): Preferences.Key<Long> {
        return longPreferencesKey(PREFERENCE_PREFIX + alertKey)
    }

    private companion object {
        private const val PREFERENCE_PREFIX = "home_feed_seen_"
    }
}
