package com.emergency.alerts.domain.model

data class Incident(
    val id: String,
    val alertId: String?,
    val displayId: String,
    val commercialDisplayId: String?,
    val location: LocationData,
    val type: String,
    val description: String,
    val departmentNumber: List<String>,
    val alarmLevel: String?,
    val emergencyServicesStatus: String?,
    val responderIds: List<String>,
    val respondedAt: Long?,
    val responderCount: Long?,
    val securedById: String?,
    val securedAt: Long?,
    val status: String,
    val closedAt: Long?,
    val closedById: String?,
    val homeowner: Homeowner?,
    val activityCount: Long?,
    val createdAt: Long,
    val updatedAt: Long
)

data class LocationData(
    val lat: Double,
    val lng: Double,
    val address: String,
    val city: String,
    val county: String?,
    val state: String
)

data class Homeowner(
    val name: String?,
    val contact: String?,
    val phone: String?,
    val email: String?,
    val address: String?,
    val description: String?,
    val notes: String?
)

data class IncidentActivity(
    val id: String,
    val type: String,
    val description: String,
    val profileId: String?,
    val createdAt: Long
)

data class Note(
    val id: String,
    val text: String,
    val authorId: String,
    val createdAt: Long
)

data class UserIncidentFlag(
    val id: String,
    val incidentId: String,
    val action: String,
    val createdAt: Long
)
