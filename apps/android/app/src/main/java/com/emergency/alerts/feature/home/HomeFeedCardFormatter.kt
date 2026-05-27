package com.emergency.alerts.feature.home

import com.emergency.alerts.core.designsystem.components.NFAIncidentCardData
import com.emergency.alerts.domain.model.HomeFeedIncident
import java.util.Locale

internal fun HomeFeedIncident.toCardData(): NFAIncidentCardData {
    val incidentData = incident
    val location = incidentData.location
    val inlineBodyText = listOfNotNull(
        location.state.takeIf { it.isNotBlank() }?.uppercase(Locale.getDefault()),
        location.county?.cleanHomeFeedText(),
        location.city.cleanHomeFeedText(),
        location.address.cleanHomeFeedText(),
        buildAlertHeadline(),
        incidentData.description.cleanHomeFeedText(),
        incidentData.departmentNumber
            .map { it.cleanHomeFeedText() }
            .filter { it.isNotBlank() }
            .joinToString(" / ")
            .takeIf { it.isNotBlank() },
        incidentData.alertId?.takeIf { it.isNotBlank() }?.let { "#$it" }
    ).joinToString(separator = " • ")

    return NFAIncidentCardData(
        incidentId = incidentData.id,
        dateTimeMillis = latestUpdateTimestamp,
        distanceMiles = distanceMiles,
        inlineBodyText = inlineBodyText,
        isUnread = isUnread,
        updateCount = updateCount,
        isFavorite = isFavorite,
        isBookmarked = isBookmarked,
        isSilent = isMuted
    )
}

private fun HomeFeedIncident.buildAlertHeadline(): String {
    val incidentData = incident
    // Headline/category stays tied to normalized Firestore fields only.
    val severityText = incidentData.alarmLevel.cleanHomeFeedText()
    val typeText = incidentData.type.cleanHomeFeedText().humanizeFeedToken()
    val normalizedSeverity = severityText.humanizeFeedToken()
    val normalizedType = typeText.ifBlank { "Other" }
    val headlineText = listOfNotNull(
        normalizedSeverity.takeIf { it.isNotBlank() },
        normalizedType.takeIf { it.isNotBlank() && !severityAlreadyImpliesType(normalizedSeverity, it) }
    ).joinToString(" / ")
    val emoji = severityEmoji(normalizedSeverity) ?: categoryEmoji(normalizedType)

    return when {
        headlineText.isBlank() -> "Alert"
        emoji != null -> "$emoji $headlineText"
        else -> headlineText
    }
}

private fun String?.cleanHomeFeedText(): String {
    return this
        ?.replace(Regex("(?i)BNNDESK\\s*"), "")
        ?.replace(Regex("\\s+"), " ")
        ?.trim()
        .orEmpty()
}

private fun String.humanizeFeedToken(): String {
    return split(Regex("[\\s_/\\-]+"))
        .filter { it.isNotBlank() }
        .joinToString(" ") { part ->
            when {
                part.length <= 2 && part.all { it.isLetter() && it.isUpperCase() } -> part
                part.length <= 2 && part.all { it.isLetter() && it.isLowerCase() } -> part.uppercase(Locale.getDefault())
                part.all { it.isDigit() } -> part
                else -> part.lowercase(Locale.getDefault()).replaceFirstChar { first ->
                    if (first.isLowerCase()) first.titlecase(Locale.getDefault()) else first.toString()
                }
            }
        }
}

private fun severityEmoji(severityText: String): String? {
    val haystack = severityText.cleanHomeFeedText().lowercase(Locale.getDefault())
    return if (
        haystack.contains("all hands") ||
        haystack.contains("2nd alarm") ||
        haystack.contains("3rd alarm") ||
        haystack.contains("4th alarm") ||
        haystack.contains("5th alarm")
    ) {
        "🚨"
    } else {
        null
    }
}

private fun categoryEmoji(typeText: String): String? {
    val haystack = typeText.cleanHomeFeedText().lowercase(Locale.getDefault())
    return when {
        haystack == "fire" -> "🔥"
        haystack == "flood" -> "🌊"
        haystack == "storm" -> "🌧️"
        haystack == "wind" -> "💨"
        haystack == "hail" -> "🧊"
        else -> null
    }
}

private fun severityAlreadyImpliesType(severityText: String, typeText: String): Boolean {
    val normalizedSeverity = severityText.lowercase(Locale.getDefault())
    val normalizedType = typeText.lowercase(Locale.getDefault())
    return normalizedSeverity.contains(normalizedType)
}

