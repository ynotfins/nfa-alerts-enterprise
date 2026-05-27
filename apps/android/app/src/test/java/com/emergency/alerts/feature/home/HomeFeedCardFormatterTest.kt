package com.emergency.alerts.feature.home

import com.emergency.alerts.domain.model.HomeFeedIncident
import com.emergency.alerts.domain.model.Incident
import com.emergency.alerts.domain.model.LocationData
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HomeFeedCardFormatterTest {

    private data class TestIncidentInput(
        val alertId: String?,
        val type: String,
        val description: String,
        val location: LocationData,
        val alarmLevel: String? = null,
        val departmentNumber: List<String> = emptyList()
    )

    @Test
    fun toCardData_preservesHomeFieldOrder() {
        val cardData = homeFeedIncident(
            TestIncidentInput(
                alertId = "1839267",
                type = "storm",
                description = "Power lines down",
                alarmLevel = "4th_alarm",
                departmentNumber = listOf("BNNDESK", "nj159"),
                location = LocationData(
                    lat = 40.66,
                    lng = -74.21,
                    address = "323 Stiles St",
                    city = "Elizabeth",
                    county = "Union",
                    state = "NJ"
                )
            )
        ).toCardData()

        assertEquals(
            "NJ • Union • Elizabeth • 323 Stiles St • 🚨 4th Alarm / Storm • Power lines down • nj159 • #1839267",
            cardData.inlineBodyText
        )
    }

    @Test
    fun toCardData_doesNotInferFireTypeFromDescription() {
        val cardData = homeFeedIncident(
            TestIncidentInput(
                alertId = "9911",
                type = "other",
                description = "Structure Fire reported in basement",
                departmentNumber = listOf("nyc075"),
                location = LocationData(
                    lat = 40.76,
                    lng = -73.92,
                    address = "12 Main St",
                    city = "Astoria",
                    county = "Queens",
                    state = "NY"
                )
            )
        ).toCardData()

        assertTrue(cardData.inlineBodyText.contains(" • Other • Structure Fire reported in basement • "))
        assertFalse(cardData.inlineBodyText.contains("🔥"))
    }

    private fun homeFeedIncident(input: TestIncidentInput): HomeFeedIncident {
        return HomeFeedIncident(
            incident = Incident(
                id = "incident-${input.alertId ?: "local"}",
                alertId = input.alertId,
                displayId = "INC-000001",
                commercialDisplayId = null,
                location = input.location,
                type = input.type,
                description = input.description,
                departmentNumber = input.departmentNumber,
                alarmLevel = input.alarmLevel,
                emergencyServicesStatus = null,
                responderIds = emptyList(),
                respondedAt = null,
                responderCount = 0L,
                securedById = null,
                securedAt = null,
                status = "active",
                closedAt = null,
                closedById = null,
                homeowner = null,
                activityCount = 1L,
                createdAt = 100L,
                updatedAt = 200L
            ),
            isFavorite = false,
            isBookmarked = false,
            isHidden = false,
            isMuted = false,
            hasViewed = false,
            distanceMiles = 1.2,
            latestUpdateTimestamp = 200L,
            readStateKey = input.alertId?.let { "alert:$it" } ?: "incident:local",
            lastSeenTimestamp = null,
            isUnread = true,
            updateCount = 1
        )
    }
}
