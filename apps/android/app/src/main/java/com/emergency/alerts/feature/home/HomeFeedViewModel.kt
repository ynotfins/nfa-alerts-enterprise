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
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
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
@OptIn(ExperimentalCoroutinesApi::class)
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

    private val locationRefreshToken = MutableStateFlow(0)

    private val feedState = locationRefreshToken
        .flatMapLatest { observeHomeFeedUseCase(activeOnly = true) }

    val uiState: StateFlow<HomeFeedUiState> = combine(
        feedState,
        preferencesState
    ) { result, preferences ->
        when (result) {
            is Result.Loading -> HomeFeedUiState.Loading
            is Result.Error -> HomeFeedUiState.Error(
                result.exception.localizedMessage ?: "Failed to load incidents"
            )
            is Result.Success -> {
                HomeFeedUiState.Success(
                    incidents = result.data.toVisibleHomeFeed(preferences),
                    preferences = preferences,
                    filterOptions = result.data.toFilterOptions(preferences)
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

    fun resetFilters() {
        viewModelScope.launch {
            homeFeedPreferencesRepository.resetFilters()
        }
    }

    fun onLocationPermissionUpdated() {
        locationRefreshToken.update { current -> current + 1 }
    }
}
