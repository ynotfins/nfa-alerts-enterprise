package com.emergency.alerts.domain.model

data class HomeFeedIncident(
    val incident: Incident,
    val isFavorite: Boolean,
    val isBookmarked: Boolean,
    val isHidden: Boolean,
    val isMuted: Boolean,
    val hasViewed: Boolean,
    val distanceMiles: Double?,
    val latestUpdateTimestamp: Long,
    val readStateKey: String,
    val lastSeenTimestamp: Long?,
    val isUnread: Boolean,
    val updateCount: Int
)
