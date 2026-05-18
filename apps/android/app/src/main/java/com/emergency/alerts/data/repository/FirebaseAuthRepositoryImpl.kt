package com.emergency.alerts.data.repository

import com.emergency.alerts.core.result.Result
import com.emergency.alerts.data.firestore.dto.ProfileDto
import com.emergency.alerts.data.mapper.toDomain
import com.emergency.alerts.domain.model.AuthSession
import com.emergency.alerts.domain.model.Profile
import com.emergency.alerts.domain.repository.AuthRepository
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.tasks.await
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
@Suppress("TooGenericExceptionCaught")
class FirebaseAuthRepositoryImpl @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore
) : AuthRepository {

    companion object {
        private const val MINIMUM_ONBOARDING_STEPS = 4L
    }

    override val currentUserId: String?
        get() = auth.currentUser?.uid

    @OptIn(ExperimentalCoroutinesApi::class)
    override fun observeSession(): Flow<Result<AuthSession>> = callbackFlow {
        val listener = FirebaseAuth.AuthStateListener { firebaseAuth ->
            trySend(firebaseAuth.currentUser?.uid)
        }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }.flatMapLatest { uid ->
        if (uid == null) {
            flowOf(Result.Success(AuthSession.Unauthenticated))
        } else {
            callbackFlow<Result<AuthSession>> {
                val listener = firestore.collection("profiles").document(uid)
                    .addSnapshotListener { snapshot, error ->
                        if (error != null) {
                            Timber.e(error, "Error fetching profile")
                            trySend(Result.Error(error))
                            return@addSnapshotListener
                        }

                        if (snapshot != null && snapshot.exists()) {
                            val profile = snapshot.toObject(ProfileDto::class.java)?.toDomain(snapshot.id)
                            if (profile != null) {
                                if (profile.ban?.active == true) {
                                    trySend(Result.Success(AuthSession.Restricted("Account banned: ${profile.ban.reason ?: "Violations"}")))
                                } else if (profile.suspension?.active == true) {
                                    trySend(Result.Success(AuthSession.Restricted("Account suspended until ${profile.suspension.until}.")))
                                } else if (profile.completedSteps < MINIMUM_ONBOARDING_STEPS) {
                                    val msg = "Onboarding incomplete (steps: ${profile.completedSteps}/$MINIMUM_ONBOARDING_STEPS)"
                                    trySend(Result.Success(AuthSession.Restricted(msg)))
                                } else {
                                    trySend(Result.Success(AuthSession.Authenticated(profile)))
                                }
                            } else {
                                trySend(Result.Success(AuthSession.MissingProfile(uid)))
                            }
                        } else {
                            trySend(Result.Success(AuthSession.MissingProfile(uid)))
                        }
                    }

                awaitClose { listener.remove() }
            }
        }
    }

    override suspend fun getProfile(userId: String): Result<Profile?> {
        return try {
            val snapshot = firestore.collection("profiles").document(userId).get().await()
            if (snapshot.exists()) {
                Result.Success(snapshot.toObject(ProfileDto::class.java)?.toDomain(snapshot.id))
            } else {
                Result.Success(null)
            }
        } catch (e: Exception) {
            Timber.e(e, "Failed to get profile for $userId")
            Result.Error(e)
        }
    }

    override suspend fun updatePushToken(token: String): Result<Unit> {
        return try {
            val uid = auth.currentUser?.uid ?: return Result.Error(Exception("Not authenticated"))
            firestore.collection("profiles").document(uid)
                .update("pushToken", token).await()
            Result.Success(Unit)
        } catch (e: Exception) {
            Timber.e(e, "Failed to update push token")
            Result.Error(e)
        }
    }

    override suspend fun signOut(): Result<Unit> {
        return try {
            auth.signOut()
            Result.Success(Unit)
        } catch (e: Exception) {
            Timber.e(e, "Failed to sign out")
            Result.Error(e)
        }
    }
}
