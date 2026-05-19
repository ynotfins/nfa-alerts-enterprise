package com.emergency.alerts.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.emergency.alerts.core.designsystem.components.NFABottomDestination
import com.emergency.alerts.core.designsystem.components.NFABottomNavBar
import com.emergency.alerts.core.designsystem.components.NFAEmptyState
import com.emergency.alerts.core.designsystem.components.NFAErrorState
import com.emergency.alerts.core.designsystem.components.NFAIncidentCard
import com.emergency.alerts.core.designsystem.components.NFAIncidentCardData
import com.emergency.alerts.core.designsystem.components.NFALoadingState
import com.emergency.alerts.core.designsystem.components.NFATopBar
import com.emergency.alerts.core.designsystem.components.NFAUserRole
import com.emergency.alerts.core.designsystem.components.nfaRoleNavigationConfig
import com.emergency.alerts.core.designsystem.theme.NFATheme
import com.emergency.alerts.domain.model.HomeFeedIncident

@Composable
fun HomeFeedScreen(
    role: String,
    onIncidentClick: (String) -> Unit,
    viewModel: HomeFeedViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val navigationConfig = nfaRoleNavigationConfig(NFAUserRole.fromRaw(role))

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            NFATopBar(
                title = "Incidents",
                subtitle = when (navigationConfig.role) {
                    NFAUserRole.Admin -> "Admin / Supe command feed"
                    NFAUserRole.Supe -> "Supervisor incident feed"
                    NFAUserRole.Chaser -> "Live responder incident feed"
                }
            )
        },
        bottomBar = {
            NFABottomNavBar(
                items = navigationConfig.items,
                selectedDestination = NFABottomDestination.Incidents,
                onDestinationSelected = { }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            when (val state = uiState) {
                is HomeFeedUiState.Loading -> NFALoadingState()
                is HomeFeedUiState.Error -> NFAErrorState(message = state.message)
                is HomeFeedUiState.Success -> {
                    if (state.incidents.isEmpty()) {
                        NFAEmptyState(
                            title = "No active incidents",
                            message = "Live alerts will appear here when new incidents are available."
                        )
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(
                                start = NFATheme.spacing.screenHorizontal,
                                end = NFATheme.spacing.screenHorizontal,
                                top = NFATheme.spacing.sm,
                                bottom = NFATheme.spacing.xxl
                            )
                        ) {
                            items(
                                items = state.incidents,
                                key = { it.incident.id }
                            ) { feedIncident ->
                                NFAIncidentCard(
                                    data = feedIncident.toCardData(),
                                    onClick = { onIncidentClick(feedIncident.incident.id) },
                                    modifier = Modifier.padding(bottom = NFATheme.spacing.cardGap)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

private fun HomeFeedIncident.toCardData(): NFAIncidentCardData {
    val incidentData = incident
    val location = incidentData.location
    val cleanedDepartmentCode = incidentData.departmentNumber
        .map { it.replace(Regex("(?i)BNNDESK\\s*"), "") }
        .map(String::trim)
        .filter(String::isNotBlank)
        .joinToString(" ")
    val cleanedMessage = incidentData.description.replace(Regex("(?i)BNNDESK\\s*"), "").trim()
    val savedAt = if (incidentData.updatedAt > 0L) incidentData.updatedAt else incidentData.createdAt

    return NFAIncidentCardData(
        incidentId = incidentData.id,
        savedAtMillis = savedAt,
        distanceMiles = distanceMiles,
        state = location.state,
        county = location.county,
        city = location.city,
        address = location.address,
        alertType = incidentData.type.uppercase(),
        alertMessage = cleanedMessage,
        departmentCode = cleanedDepartmentCode.ifBlank { null },
        alertId = incidentData.alertId?.takeIf { it.isNotBlank() }?.let { "#$it" },
        severityLabel = incidentData.alarmLevel,
        isImportant = incidentData.alarmLevel != null || incidentData.type.equals("fire", ignoreCase = true)
    )
}
