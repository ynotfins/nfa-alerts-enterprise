package com.emergency.alerts.domain.model

enum class HomeDistanceFilterOption(val label: String, val maxMiles: Int?) {
    Any("Any distance", null),
    Within5("Within 5 mi", 5),
    Within10("Within 10 mi", 10),
    Within25("Within 25 mi", 25),
    Within50("Within 50 mi", 50)
}

enum class HomeUpdateFilterOption(val label: String, val minUpdates: Int?) {
    Any("Any updates", null),
    OnePlus("1+ updates", 1),
    TwoPlus("2+ updates", 2),
    ThreePlus("3+ updates", 3),
    FivePlus("5+ updates", 5)
}

data class HomeFeedFilters(
    val selectedAlertTypes: Set<String> = emptySet(),
    val distanceFilter: HomeDistanceFilterOption = HomeDistanceFilterOption.Any,
    val updateFilter: HomeUpdateFilterOption = HomeUpdateFilterOption.Any,
    val keywordQuery: String = "",
    val selectedDepartmentCodes: Set<String> = emptySet(),
    val highAlertOnly: Boolean = false
)

data class HighAlertConfig(
    val enabled: Boolean = false,
    val selectedAlertTypes: Set<String> = emptySet(),
    val selectedKeywords: Set<String> = emptySet(),
    val selectedDepartments: Set<String> = emptySet(),
    val maxDistanceMiles: Int? = null,
    val minUpdateCount: Int = 0,
    val vibrationEnabled: Boolean = true,
    val sirenEnabled: Boolean = false,
    val flashlightStrobeEnabled: Boolean = false
)

data class HomeFeedPreferences(
    val favoriteAlertKeys: Set<String> = emptySet(),
    val bookmarkAlertKeys: Set<String> = emptySet(),
    val silentAlertKeys: Set<String> = emptySet(),
    val hiddenAlertKeys: Set<String> = emptySet(),
    val filters: HomeFeedFilters = HomeFeedFilters(),
    val highAlertConfig: HighAlertConfig = HighAlertConfig()
)

fun HomeFeedFilters.isActive(): Boolean {
    return selectedAlertTypes.isNotEmpty() ||
        distanceFilter != HomeDistanceFilterOption.Any ||
        updateFilter != HomeUpdateFilterOption.Any ||
        keywordQuery.isNotBlank() ||
        selectedDepartmentCodes.isNotEmpty() ||
        highAlertOnly
}

fun HighAlertConfig.hasHomeNarrowingCriteria(): Boolean {
    return selectedAlertTypes.isNotEmpty() ||
        selectedKeywords.isNotEmpty() ||
        selectedDepartments.isNotEmpty() ||
        maxDistanceMiles != null ||
        minUpdateCount > 0
}

fun HomeFeedPreferences.canResetFilters(): Boolean {
    return filters.isActive() || highAlertConfig.hasHomeNarrowingCriteria()
}

