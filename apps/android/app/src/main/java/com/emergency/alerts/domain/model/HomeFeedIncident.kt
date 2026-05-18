package com.emergency.alerts.domain.model

data class HomeFeedIncident(
    val incident: Incident,
    val isFavorite: Boolean,
    val isBookmarked: Boolean,
    val isHidden: Boolean,
    val isMuted: Boolean,
    val hasViewed: Boolean,
    val distanceMiles: Double?
)
