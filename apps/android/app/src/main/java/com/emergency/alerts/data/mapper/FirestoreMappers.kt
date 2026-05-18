package com.emergency.alerts.data.mapper

import com.emergency.alerts.data.firestore.dto.HomeownerDto
import com.emergency.alerts.data.firestore.dto.IncidentActivityDto
import com.emergency.alerts.data.firestore.dto.IncidentDto
import com.emergency.alerts.data.firestore.dto.IncidentLocationDto
import com.emergency.alerts.data.firestore.dto.LocationTrackingDto
import com.emergency.alerts.data.firestore.dto.NoteDto
import com.emergency.alerts.data.firestore.dto.ProfileDto
import com.emergency.alerts.data.firestore.dto.SuspensionDto
import com.emergency.alerts.data.firestore.dto.BanDto
import com.emergency.alerts.data.firestore.dto.UserIncidentFlagDto
import com.emergency.alerts.data.firestore.dto.ThreadDto
import com.emergency.alerts.data.firestore.dto.MessageDto
import com.emergency.alerts.domain.model.Homeowner
import com.emergency.alerts.domain.model.Incident
import com.emergency.alerts.domain.model.IncidentActivity
import com.emergency.alerts.domain.model.LocationData
import com.emergency.alerts.domain.model.LocationTracking
import com.emergency.alerts.domain.model.Suspension
import com.emergency.alerts.domain.model.Ban
import com.emergency.alerts.domain.model.Note
import com.emergency.alerts.domain.model.Profile
import com.emergency.alerts.domain.model.UserIncidentFlag
import com.emergency.alerts.domain.model.Thread
import com.emergency.alerts.domain.model.Message

fun IncidentDto.toDomain(id: String): Incident {
    return Incident(
        id = id,
        alertId = alertId,
        displayId = displayId,
        location = location?.toDomain() ?: LocationData(0.0, 0.0, "", "", null, ""),
        type = type,
        description = description,
        departmentNumber = departmentNumber ?: emptyList(),
        alarmLevel = alarmLevel,
        emergencyServicesStatus = emergencyServicesStatus,
        responderIds = responderIds ?: emptyList(),
        respondedAt = respondedAt,
        responderCount = responderCount ?: 0L,
        securedById = securedById,
        securedAt = securedAt,
        status = status,
        closedAt = closedAt,
        closedById = closedById,
        homeowner = homeowner?.toDomain(),
        activityCount = activityCount ?: 0L,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

fun IncidentLocationDto.toDomain(): LocationData {
    return LocationData(
        lat = lat,
        lng = lng,
        address = address,
        city = city,
        county = county,
        state = state
    )
}

fun HomeownerDto.toDomain(): Homeowner {
    return Homeowner(
        name = name,
        contact = contact,
        phone = phone,
        email = email,
        address = address,
        description = description,
        notes = notes
    )
}

fun IncidentActivityDto.toDomain(id: String): IncidentActivity {
    return IncidentActivity(
        id = id,
        type = type,
        description = description,
        profileId = profileId,
        createdAt = createdAt
    )
}

fun NoteDto.toDomain(id: String): Note {
    return Note(
        id = id,
        text = text,
        authorId = authorId,
        createdAt = createdAt
    )
}

fun ProfileDto.toDomain(id: String): Profile {
    return Profile(
        id = id,
        userId = userId,
        email = email,
        role = role,
        completedSteps = completedSteps,
        firstName = firstName,
        lastName = lastName,
        name = name,
        phone = phone,
        avatarUrl = avatarUrl,
        pushToken = pushToken,
        locationTracking = locationTracking?.toDomain(),
        suspension = suspension?.toDomain(),
        ban = ban?.toDomain(),
        online = online,
        lastSeen = lastSeen,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

fun SuspensionDto.toDomain(): Suspension {
    return Suspension(
        active = active,
        until = until,
        reason = reason
    )
}

fun BanDto.toDomain(): Ban {
    return Ban(
        active = active,
        at = at,
        reason = reason
    )
}

fun LocationTrackingDto.toDomain(): LocationTracking {
    return LocationTracking(
        enabled = enabled,
        lastUpdate = lastUpdate,
        accuracy = accuracy,
        lat = lat,
        lng = lng
    )
}

fun UserIncidentFlagDto.toDomain(id: String): UserIncidentFlag {
    return UserIncidentFlag(
        id = id,
        incidentId = odm_incidentId,
        action = odm_action,
        createdAt = createdAt
    )
}

fun ThreadDto.toDomain(id: String): Thread {
    return Thread(
        id = id,
        type = type,
        participants = participants,
        chaserIds = chaserIds ?: emptyList(),
        lastMessage = lastMessage,
        lastMessageAt = lastMessageAt,
        lastMessageSenderId = lastMessageSenderId,
        typingUsers = typingUsers,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

fun MessageDto.toDomain(id: String): Message {
    return Message(
        id = id,
        senderId = senderId,
        text = text,
        readBy = readBy,
        replyTo = replyTo,
        createdAt = createdAt
    )
}
