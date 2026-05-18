package com.emergency.alerts.domain.model

sealed interface AuthSession {
    data object Loading : AuthSession
    data object Unauthenticated : AuthSession
    data class MissingProfile(val uid: String) : AuthSession
    data class Restricted(val reason: String) : AuthSession
    data class Authenticated(val profile: Profile) : AuthSession
}
