package com.emergency.alerts.data.firestore.dto

import androidx.annotation.Keep

@Keep
data class IncidentDto(
    val alertId: String? = null,
    val displayId: String = "",
    val location: IncidentLocationDto? = null,
    val type: String = "other",
    val description: String = "",
    val departmentNumber: List<String>? = null,
    val alarmLevel: String? = null,
    val emergencyServicesStatus: String? = null,
    val responderIds: List<String>? = null,
    val respondedAt: Long? = null,
    val responderCount: Long? = null,
    val securedById: String? = null,
    val securedAt: Long? = null,
    val status: String = "active",
    val closedAt: Long? = null,
    val closedById: String? = null,
    val homeowner: HomeownerDto? = null,
    val activityCount: Long? = null,
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L
)

@Keep
data class IncidentLocationDto(
    val lat: Double = 0.0,
    val lng: Double = 0.0,
    val address: String = "",
    val city: String = "",
    val county: String? = null,
    val state: String = ""
)

@Keep
data class HomeownerDto(
    val name: String? = null,
    val contact: String? = null,
    val phone: String? = null,
    val email: String? = null,
    val address: String? = null,
    val description: String? = null,
    val notes: String? = null
)

@Keep
data class UserIncidentFlagDto(
    val odm_profileId: String = "",
    val odm_incidentId: String = "",
    val odm_action: String = "",
    val createdAt: Long = 0L
)

@Keep
data class NoteDto(
    val text: String = "",
    val authorId: String = "",
    val createdAt: Long = 0L
)

@Keep
data class IncidentActivityDto(
    val type: String = "custom",
    val description: String = "",
    val profileId: String? = null,
    val createdAt: Long = 0L
)

@Keep
data class ProfileDto(
    val userId: String = "",
    val email: String? = null,
    val role: String = "chaser",
    val completedSteps: Long = 0L,
    val firstName: String? = null,
    val lastName: String? = null,
    val name: String? = null,
    val phone: String? = null,
    val avatarUrl: String? = null,
    val pushToken: String? = null,
    val locationTracking: LocationTrackingDto? = null,
    val suspension: SuspensionDto? = null,
    val ban: BanDto? = null,
    val online: Boolean? = null,
    val lastSeen: Long? = null,
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L
)

@Keep
data class SuspensionDto(
    val active: Boolean = false,
    val until: Long? = null,
    val reason: String? = null
)

@Keep
data class BanDto(
    val active: Boolean = false,
    val at: Long = 0L,
    val reason: String? = null
)

@Keep
data class LocationTrackingDto(
    val enabled: Boolean = false,
    val lastUpdate: Long? = null,
    val accuracy: Double? = null,
    val lat: Double? = null,
    val lng: Double? = null
)

@Keep
data class ThreadDto(
    val type: String = "direct",
    val participants: List<String> = emptyList(),
    val chaserIds: List<String>? = null,
    val lastMessage: String? = null,
    val lastMessageAt: Long? = null,
    val lastMessageSenderId: String? = null,
    val typingUsers: List<String> = emptyList(),
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L
)

@Keep
data class MessageDto(
    val senderId: String = "",
    val text: String = "",
    val readBy: List<String> = emptyList(),
    val replyTo: String? = null,
    val createdAt: Long = 0L
)
