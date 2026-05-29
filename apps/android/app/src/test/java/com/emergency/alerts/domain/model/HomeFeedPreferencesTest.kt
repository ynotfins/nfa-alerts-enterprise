package com.emergency.alerts.domain.model

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HomeFeedPreferencesTest {

    @Test
    fun homeFeedFilters_isInactiveByDefault() {
        assertFalse(HomeFeedFilters().isActive())
    }

    @Test
    fun homeFeedFilters_isActiveWhenAnyHomeNarrowingSelectionExists() {
        assertTrue(
            HomeFeedFilters(selectedAlertTypes = setOf("Fire")).isActive()
        )
        assertTrue(
            HomeFeedFilters(distanceFilter = HomeDistanceFilterOption.Within10).isActive()
        )
        assertTrue(
            HomeFeedFilters(updateFilter = HomeUpdateFilterOption.TwoPlus).isActive()
        )
        assertTrue(HomeFeedFilters(keywordQuery = "yonkers").isActive())
        assertTrue(
            HomeFeedFilters(selectedDepartmentCodes = setOf("nj233")).isActive()
        )
        assertTrue(HomeFeedFilters(highAlertOnly = true).isActive())
    }

    @Test
    fun highAlertConfig_hasNoHomeNarrowingCriteriaByDefault() {
        assertFalse(HighAlertConfig().hasHomeNarrowingCriteria())
    }

    @Test
    fun homeFeedPreferences_canResetFiltersWhenHighAlertConfigOrFiltersChanged() {
        assertTrue(
            HomeFeedPreferences(
                filters = HomeFeedFilters(selectedAlertTypes = setOf("Fire"))
            ).canResetFilters()
        )
        assertTrue(
            HomeFeedPreferences(
                highAlertConfig = HighAlertConfig(selectedKeywords = setOf("fire"))
            ).canResetFilters()
        )
    }
}

