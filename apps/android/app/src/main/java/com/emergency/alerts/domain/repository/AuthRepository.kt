package com.emergency.alerts.domain.repository

import com.emergency.alerts.core.result.Result
import com.emergency.alerts.domain.model.AuthSession
import com.emergency.alerts.domain.model.Profile
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    val currentUserId: String?
    fun observeSession(): Flow<Result<AuthSession>>
    suspend fun getProfile(userId: String): Result<Profile?>
    suspend fun updatePushToken(token: String): Result<Unit>
    suspend fun signOut(): Result<Unit>
}
