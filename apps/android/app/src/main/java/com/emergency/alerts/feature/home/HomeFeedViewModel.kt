package com.emergency.alerts.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.emergency.alerts.core.result.Result
import com.emergency.alerts.domain.model.HomeFeedIncident
import com.emergency.alerts.domain.usecase.ObserveHomeFeedUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

sealed interface HomeFeedUiState {
    data object Loading : HomeFeedUiState
    data class Success(val incidents: List<HomeFeedIncident>) : HomeFeedUiState
    data class Error(val message: String) : HomeFeedUiState
}

@HiltViewModel
class HomeFeedViewModel @Inject constructor(
    observeHomeFeedUseCase: ObserveHomeFeedUseCase
) : ViewModel() {

    companion object {
        private const val STOP_TIMEOUT_MILLIS = 5000L
    }

    val uiState: StateFlow<HomeFeedUiState> = observeHomeFeedUseCase(activeOnly = true)
        .map { result ->
            when (result) {
                is Result.Loading -> HomeFeedUiState.Loading
                is Result.Error -> HomeFeedUiState.Error(result.exception.localizedMessage ?: "Failed to load incidents")
                is Result.Success -> HomeFeedUiState.Success(result.data)
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS),
            initialValue = HomeFeedUiState.Loading
        )
}
