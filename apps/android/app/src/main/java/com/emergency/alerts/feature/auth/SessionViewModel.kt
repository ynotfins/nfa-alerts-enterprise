package com.emergency.alerts.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.emergency.alerts.core.result.Result
import com.emergency.alerts.domain.model.AuthSession
import com.emergency.alerts.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface SessionUiState {
    data object Loading : SessionUiState
    data object Unauthenticated : SessionUiState
    data class MissingProfile(val uid: String) : SessionUiState
    data class Restricted(val reason: String) : SessionUiState
    data class Authenticated(val role: String, val name: String) : SessionUiState
    data class Error(val message: String) : SessionUiState
}

@HiltViewModel
class SessionViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    companion object {
        private const val STOP_TIMEOUT_MILLIS = 5000L
    }

    val uiState: StateFlow<SessionUiState> = authRepository.observeSession()
        .map { result ->
            when (result) {
                is Result.Loading -> SessionUiState.Loading
                is Result.Error -> SessionUiState.Error(result.exception.message ?: "Unknown error")
                is Result.Success -> {
                    when (val session = result.data) {
                        is AuthSession.Unauthenticated -> SessionUiState.Unauthenticated
                        is AuthSession.MissingProfile -> SessionUiState.MissingProfile(session.uid)
                        is AuthSession.Restricted -> SessionUiState.Restricted(session.reason)
                        is AuthSession.Authenticated -> SessionUiState.Authenticated(
                            role = session.profile.role,
                            name = session.profile.name ?: session.profile.firstName ?: "Unknown User"
                        )
                        is AuthSession.Loading -> SessionUiState.Loading
                    }
                }
            }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(STOP_TIMEOUT_MILLIS),
            initialValue = SessionUiState.Loading
        )
        
    fun signOut() {
        viewModelScope.launch { 
            authRepository.signOut() 
        }
    }
}
