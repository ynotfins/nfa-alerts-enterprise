package com.emergency.alerts.domain.usecase

import com.emergency.alerts.core.result.Result
import com.emergency.alerts.domain.model.AuthSession
import com.emergency.alerts.domain.model.Homeowner
import com.emergency.alerts.domain.model.Incident
import com.emergency.alerts.domain.model.IncidentActivity
import com.emergency.alerts.domain.model.LocationData
import com.emergency.alerts.domain.model.Note
import com.emergency.alerts.domain.model.Profile
import com.emergency.alerts.domain.model.UserIncidentFlag
import com.emergency.alerts.domain.repository.AuthRepository
import com.emergency.alerts.domain.repository.DeviceLocation
import com.emergency.alerts.domain.repository.HomeFeedReadStateRepository
import com.emergency.alerts.domain.repository.IncidentRepository
import com.emergency.alerts.domain.repository.LocationRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ObserveHomeFeedUseCaseTest {

    @Test
    fun invoke_deduplicatesByAlertIdAndSortsByLatestTimestampDescending() = runBlocking {
        val incidents = listOf(
            incident(id = "older-a", alertId = "A-1", createdAt = 100L, updatedAt = 150L),
            incident(id = "newer-a", alertId = "A-1", createdAt = 200L, updatedAt = 300L),
            incident(id = "b", alertId = "B-1", createdAt = 250L, updatedAt = 0L),
            incident(id = "c", alertId = "C-1", createdAt = 400L, updatedAt = 0L)
        )
        val useCase = ObserveHomeFeedUseCase(
            incidentRepository = FakeIncidentRepository(incidents),
            authRepository = FakeAuthRepository(),
            homeFeedReadStateRepository = FakeHomeFeedReadStateRepository(),
            locationRepository = FakeLocationRepository(),
            calculateDistance = CalculateDistanceUseCase()
        )

        val result = useCase(activeOnly = true).first()

        assertTrue(result is Result.Success)
        val feed = (result as Result.Success).data
        assertEquals(3, feed.size)
        assertEquals(listOf("c", "newer-a", "b"), feed.map { it.incident.id })
        assertEquals(listOf("alert:C-1", "alert:A-1", "alert:B-1"), feed.map { it.readStateKey })
    }

    private class FakeIncidentRepository(
        private val incidents: List<Incident>
    ) : IncidentRepository {
        override fun observeHomeIncidents(activeOnly: Boolean): Flow<Result<List<Incident>>> {
            return flowOf(Result.Success(incidents))
        }

        override fun observeIncident(incidentId: String): Flow<Result<Incident?>> {
            return flowOf(Result.Success(incidents.firstOrNull { it.id == incidentId }))
        }

        override fun observeUserFlags(userId: String): Flow<Result<List<UserIncidentFlag>>> {
            return flowOf(Result.Success(emptyList()))
        }

        override fun observeIncidentNotes(incidentId: String): Flow<Result<List<Note>>> {
            return flowOf(Result.Success(emptyList()))
        }

        override fun observeIncidentActivities(incidentId: String): Flow<Result<List<IncidentActivity>>> {
            return flowOf(Result.Success(emptyList()))
        }

        override suspend fun respondToIncident(incidentId: String): Result<Unit> = Result.Success(Unit)

        override suspend fun addNote(incidentId: String, text: String): Result<Unit> = Result.Success(Unit)

        override suspend fun toggleUserIncidentAction(
            incidentId: String,
            action: String
        ): Result<Unit> = Result.Success(Unit)
    }

    private class FakeAuthRepository : AuthRepository {
        override val currentUserId: String?
            get() = "profile-1"

        override fun observeSession(): Flow<Result<AuthSession>> {
            return flowOf(Result.Success(AuthSession.Authenticated(testProfile())))
        }

        override suspend fun getProfile(userId: String): Result<Profile?> = Result.Success(testProfile())

        override suspend fun updatePushToken(token: String): Result<Unit> = Result.Success(Unit)

        override suspend fun signOut(): Result<Unit> = Result.Success(Unit)
    }

    private class FakeHomeFeedReadStateRepository : HomeFeedReadStateRepository {
        override fun observeLastSeenByAlertKey(): Flow<Map<String, Long>> = flowOf(emptyMap())

        override suspend fun markSeen(alertKey: String, seenAtMillis: Long) = Unit
    }

    private class FakeLocationRepository : LocationRepository {
        override fun observeDeviceLocation(): Flow<Result<DeviceLocation>> {
            return flowOf(Result.Error(SecurityException("No test location")))
        }

        override suspend fun hasLocationPermission(): Boolean = false
    }

    companion object {
        private fun testProfile(): Profile {
            return Profile(
                id = "profile-1",
                userId = "profile-1",
                email = null,
                role = "chaser",
                completedSteps = 4L,
                firstName = "Test",
                lastName = "User",
                name = "Test User",
                phone = null,
                avatarUrl = null,
                pushToken = null,
                locationTracking = null,
                suspension = null,
                ban = null,
                online = true,
                lastSeen = null,
                createdAt = 0L,
                updatedAt = 0L
            )
        }

        private fun incident(
            id: String,
            alertId: String,
            createdAt: Long,
            updatedAt: Long
        ): Incident {
            return Incident(
                id = id,
                alertId = alertId,
                displayId = id,
                commercialDisplayId = null,
                location = LocationData(
                    lat = 0.0,
                    lng = 0.0,
                    address = "123 Main St",
                    city = "City",
                    county = "County",
                    state = "TX"
                ),
                type = "other",
                description = "Test incident $id",
                departmentNumber = emptyList(),
                alarmLevel = null,
                emergencyServicesStatus = null,
                responderIds = emptyList(),
                respondedAt = null,
                responderCount = 0L,
                securedById = null,
                securedAt = null,
                status = "active",
                closedAt = null,
                closedById = null,
                homeowner = Homeowner(
                    name = null,
                    contact = null,
                    phone = null,
                    email = null,
                    address = null,
                    description = null,
                    notes = null
                ),
                activityCount = 0L,
                createdAt = createdAt,
                updatedAt = updatedAt
            )
        }
    }
}
