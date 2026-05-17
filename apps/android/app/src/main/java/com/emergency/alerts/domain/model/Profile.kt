package com.emergency.alerts.domain.model

data class Profile(
    val id: String,
    val userId: String,
    val email: String?,
    val role: String,
    val completedSteps: Long,
    val firstName: String?,
    val lastName: String?,
    val name: String?,
    val phone: String?,
    val avatarUrl: String?,
    val pushToken: String?,
    val locationTracking: LocationTracking?,
    val online: Boolean?,
    val lastSeen: Long?,
    val createdAt: Long,
    val updatedAt: Long
)

data class LocationTracking(
    val enabled: Boolean,
    val lastUpdate: Long?,
    val accuracy: Double?,
    val lat: Double?,
    val lng: Double?
)
