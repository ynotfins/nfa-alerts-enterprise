package com.emergency.alerts.feature.home

import com.emergency.alerts.domain.model.HighAlertConfig
import com.emergency.alerts.domain.model.HomeFeedFilters
import com.emergency.alerts.domain.model.HomeFeedIncident
import com.emergency.alerts.domain.model.HomeFeedPreferences

data class HomeFeedFilterOptions(
    val alertTypes: List<String> = emptyList(),
    val departmentCodes: List<String> = emptyList(),
    val hiddenCount: Int = 0
)

internal fun List<HomeFeedIncident>.toVisibleHomeFeed(
    preferences: HomeFeedPreferences
): List<HomeFeedIncident> {
    return map { it.applyLocalPreferences(preferences) }
        .filterNot { it.isHidden }
        .filter { it.matchesFilters(preferences.filters, preferences.highAlertConfig) }
}

internal fun List<HomeFeedIncident>.toFilterOptions(
    preferences: HomeFeedPreferences
): HomeFeedFilterOptions {
    val incidents = map { it.applyLocalPreferences(preferences) }

    return HomeFeedFilterOptions(
        alertTypes = incidents
            .map { it.incident.type.humanizeFilterLabel() }
            .filter { it.isNotBlank() }
            .distinct()
            .sorted(),
        departmentCodes = incidents
            .flatMap { it.incident.departmentNumber }
            .map { it.cleanFilterToken() }
            .filter { it.isNotBlank() }
            .distinct()
            .sorted(),
        hiddenCount = incidents.count { it.isHidden }
    )
}

private fun HomeFeedIncident.applyLocalPreferences(
    preferences: HomeFeedPreferences
): HomeFeedIncident {
    val key = readStateKey
    return copy(
        isFavorite = isFavorite || key in preferences.favoriteAlertKeys,
        isBookmarked = isBookmarked || key in preferences.bookmarkAlertKeys,
        isMuted = isMuted || key in preferences.silentAlertKeys,
        isHidden = isHidden || key in preferences.hiddenAlertKeys
    )
}

private fun HomeFeedIncident.matchesFilters(
    filters: HomeFeedFilters,
    highAlertConfig: HighAlertConfig
): Boolean {
    if (filters.selectedAlertTypes.isNotEmpty()) {
        val incidentType = incident.type.humanizeFilterLabel()
        if (incidentType !in filters.selectedAlertTypes) return false
    }

    if (filters.selectedDepartmentCodes.isNotEmpty()) {
        val incidentDepartments = incident.departmentNumber.map { it.cleanFilterToken() }.toSet()
        if (incidentDepartments.intersect(filters.selectedDepartmentCodes).isEmpty()) return false
    }

    val maxMiles = filters.distanceFilter.maxMiles
    if (maxMiles != null) {
        val distance = distanceMiles ?: return false
        if (distance > maxMiles) return false
    }

    val minUpdates = filters.updateFilter.minUpdates
    if (minUpdates != null && updateCount < minUpdates) return false

    val keyword = filters.keywordQuery.trim().lowercase()
    if (keyword.isNotEmpty() && !searchableContent().contains(keyword)) return false

    if (filters.highAlertOnly && !matchesHighAlert(highAlertConfig)) return false

    return true
}

private fun HomeFeedIncident.matchesHighAlert(config: HighAlertConfig): Boolean {
    if (config.selectedAlertTypes.isNotEmpty()) {
        val incidentType = incident.type.humanizeFilterLabel()
        if (incidentType !in config.selectedAlertTypes) return false
    }

    if (config.selectedDepartments.isNotEmpty()) {
        val incidentDepartments = incident.departmentNumber.map { it.cleanFilterToken() }.toSet()
        if (incidentDepartments.intersect(config.selectedDepartments).isEmpty()) return false
    }

    if (config.selectedKeywords.isNotEmpty()) {
        val searchable = searchableContent()
        val hasKeywordMatch = config.selectedKeywords.any { keyword ->
            searchable.contains(keyword.cleanFilterToken().lowercase())
        }
        if (!hasKeywordMatch) return false
    }

    val maxDistance = config.maxDistanceMiles
    if (maxDistance != null) {
        val distance = distanceMiles ?: return false
        if (distance > maxDistance) return false
    }

    if (updateCount < config.minUpdateCount) return false

    return true
}

private fun HomeFeedIncident.searchableContent(): String {
    return listOfNotNull(
        incident.location.state,
        incident.location.county,
        incident.location.city,
        incident.location.address,
        incident.type,
        incident.description,
        incident.alertId,
        incident.departmentNumber.joinToString(" ")
    ).joinToString(" ")
        .cleanFilterToken()
        .lowercase()
}

private fun String.cleanFilterToken(): String {
    return replace(Regex("(?i)BNNDESK\\s*"), "")
        .replace(Regex("\\s+"), " ")
        .trim()
}

private fun String.humanizeFilterLabel(): String {
    return split(Regex("[\\s_/\\-]+"))
        .filter { it.isNotBlank() }
        .joinToString(" ") { part ->
            part.lowercase().replaceFirstChar { first ->
                if (first.isLowerCase()) first.titlecase() else first.toString()
            }
        }
}
