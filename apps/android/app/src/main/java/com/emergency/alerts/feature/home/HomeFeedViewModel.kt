package com.emergency.alerts.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.emergency.alerts.core.result.Result
import com.emergency.alerts.domain.model.HighAlertConfig
import com.emergency.alerts.domain.model.HomeFeedIncident
import com.emergency.alerts.domain.model.HomeFeedFilters
import com.emergency.alerts.domain.model.HomeFeedPreferences
import com.emergency.alerts.domain.usecase.MarkHomeFeedIncidentSeenUseCase
import com.emergency.alerts.domain.usecase.ObserveHomeFeedUseCase
import com.emergency.alerts.domain.repository.HomeFeedPreferencesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

sealed interface HomeFeedUiState {
    data object Loading : HomeFeedUiState
    data class Success(
        val incidents: List<HomeFeedIncident>,
        val preferences: HomeFeedPreferences,
        val filterOptions: HomeFeedFilterOptions
    ) : HomeFeedUiState
    data class Error(val message: String) : HomeFeedUiState
}

@HiltViewModel
class HomeFeedViewModel @Inject constructor(
    observeHomeFeedUseCase: ObserveHomeFeedUseCase,
    private val markHomeFeedIncidentSeenUseCase: MarkHomeFeedIncidentSeenUseCase,
    private val homeFeedPreferencesRepository: HomeFeedPreferencesRepository
) : ViewModel() {

    companion object {
        private const val STOP_TIMEOUT_MILLIS = 5000L
    }

    private val preferencesState = homeFeedPreferencesRepository.observePreferences()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS),
            initialValue = HomeFeedPreferences()
        )

    val uiState: StateFlow<HomeFeedUiState> = combine(
        observeHomeFeedUseCase(activeOnly = true),
        preferencesState
    ) { result, preferences ->
        when (result) {
            is Result.Loading -> HomeFeedUiState.Loading
            is Result.Error -> HomeFeedUiState.Error(
                result.exception.localizedMessage ?: "Failed to load incidents"
            )
            is Result.Success -> {
                val visibleIncidents = result.data.toVisibleHomeFeed(preferences)
                val filterOptions = result.data.toFilterOptions(preferences)
                val newestVisible = visibleIncidents.firstOrNull()
                Timber.d(
                    "ViewModel visible=%d raw=%d hiddenCount=%d favoriteKeys=%d bookmarkKeys=%d silentKeys=%d hiddenKeys=%d typeFilters=%d selectedTypes=%s deptFilters=%d selectedDepartments=%s keyword=%s distance=%s updates=%s highAlertOnly=%s highAlertEnabled=%s highAlertTypes=%d selectedHighAlertTypes=%s highAlertKeywords=%d selectedHighAlertKeywords=%s highAlertDepartments=%d selectedHighAlertDepartments=%s newestVisibleId=%s newestVisibleAlertId=%s newestVisibleLatest=%s",
                    visibleIncidents.size,
                    result.data.size,
                    filterOptions.hiddenCount,
                    preferences.favoriteAlertKeys.size,
                    preferences.bookmarkAlertKeys.size,
                    preferences.silentAlertKeys.size,
                    preferences.hiddenAlertKeys.size,
                    preferences.filters.selectedAlertTypes.size,
                    preferences.filters.selectedAlertTypes,
                    preferences.filters.selectedDepartmentCodes.size,
                    preferences.filters.selectedDepartmentCodes,
                    preferences.filters.keywordQuery,
                    preferences.filters.distanceFilter.name,
                    preferences.filters.updateFilter.name,
                    preferences.filters.highAlertOnly,
                    preferences.highAlertConfig.enabled,
                    preferences.highAlertConfig.selectedAlertTypes.size,
                    preferences.highAlertConfig.selectedAlertTypes,
                    preferences.highAlertConfig.selectedKeywords.size,
                    preferences.highAlertConfig.selectedKeywords,
                    preferences.highAlertConfig.selectedDepartments.size,
                    preferences.highAlertConfig.selectedDepartments,
                    newestVisible?.incident?.id,
                    newestVisible?.incident?.alertId,
                    newestVisible?.latestUpdateTimestamp
                )
                HomeFeedUiState.Success(
                    incidents = visibleIncidents,
                    preferences = preferences,
                    filterOptions = filterOptions
                )
            }
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS),
        initialValue = HomeFeedUiState.Loading
    )

    fun onIncidentOpened(incident: HomeFeedIncident) {
        viewModelScope.launch {
            markHomeFeedIncidentSeenUseCase(incident)
        }
    }

    fun onFavoriteToggle(incident: HomeFeedIncident) {
        viewModelScope.launch {
            homeFeedPreferencesRepository.toggleFavorite(incident.readStateKey)
        }
    }

    fun onBookmarkToggle(incident: HomeFeedIncident) {
        viewModelScope.launch {
            homeFeedPreferencesRepository.toggleBookmark(incident.readStateKey)
        }
    }

    fun onSilentToggle(incident: HomeFeedIncident) {
        viewModelScope.launch {
            homeFeedPreferencesRepository.toggleSilent(incident.readStateKey)
        }
    }

    fun onHideToggle(incident: HomeFeedIncident) {
        viewModelScope.launch {
            homeFeedPreferencesRepository.toggleHidden(incident.readStateKey)
        }
    }

    fun onRestoreHidden() {
        viewModelScope.launch {
            homeFeedPreferencesRepository.clearHidden()
        }
    }

    fun updateFilters(filters: HomeFeedFilters) {
        viewModelScope.launch {
            homeFeedPreferencesRepository.setFilters(filters)
        }
    }

    fun updateHighAlertConfig(config: HighAlertConfig) {
        viewModelScope.launch {
            homeFeedPreferencesRepository.setHighAlertConfig(config)
        }
    }
}
