package com.emergency.alerts.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.viewmodel.compose.viewModel
import com.emergency.alerts.core.designsystem.components.NFABottomDestination
import com.emergency.alerts.core.designsystem.components.NFABottomNavBar
import com.emergency.alerts.core.designsystem.components.NFAEmptyState
import com.emergency.alerts.core.designsystem.components.NFAErrorState
import com.emergency.alerts.core.designsystem.components.NFAIconButton
import com.emergency.alerts.core.designsystem.components.NFAIncidentCard
import com.emergency.alerts.core.designsystem.components.NFALoadingState
import com.emergency.alerts.core.designsystem.components.NFATopBar
import com.emergency.alerts.core.designsystem.components.NFAUserRole
import com.emergency.alerts.core.designsystem.components.nfaRoleNavigationConfig
import com.emergency.alerts.core.designsystem.theme.NFATheme

@Composable
fun HomeFeedScreen(
    role: String,
    onIncidentClick: (String) -> Unit,
    viewModel: HomeFeedViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val navigationConfig = nfaRoleNavigationConfig(NFAUserRole.fromRaw(role))
    var showFilterSheet by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            NFATopBar(
                title = "Incidents",
                trailingContent = {
                    val successState = uiState as? HomeFeedUiState.Success
                    Row {
                        NFAIconButton(
                            icon = Icons.Default.Visibility,
                            contentDescription = "Show hidden alerts",
                            onClick = viewModel::onRestoreHidden,
                            tint = NFATheme.colors.chasers,
                            containerColor = Color.Transparent,
                            borderColor = Color.Transparent,
                            size = 40
                        )
                        NFAIconButton(
                            icon = Icons.Default.FilterList,
                            contentDescription = "Open Home filters",
                            onClick = { showFilterSheet = true },
                            modifier = Modifier.padding(start = NFATheme.spacing.xs),
                            tint = NFATheme.colors.accentBlue,
                            containerColor = Color.Transparent,
                            borderColor = Color.Transparent,
                            size = 40
                        )
                    }
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
                                key = { it.readStateKey }
                            ) { feedIncident ->
                                NFAIncidentCard(
                                    data = feedIncident.toCardData(),
                                    onClick = {
                                        viewModel.onIncidentOpened(feedIncident)
                                        onIncidentClick(feedIncident.incident.id)
                                    },
                                    onFavoriteClick = { viewModel.onFavoriteToggle(feedIncident) },
                                    onBookmarkClick = { viewModel.onBookmarkToggle(feedIncident) },
                                    onSilentClick = { viewModel.onSilentToggle(feedIncident) },
                                    onHideClick = { viewModel.onHideToggle(feedIncident) },
                                    modifier = Modifier.padding(bottom = NFATheme.spacing.cardGap)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    val successState = uiState as? HomeFeedUiState.Success
    if (showFilterSheet && successState != null) {
        HomeFeedFilterSheet(
            filters = successState.preferences.filters,
            highAlertConfig = successState.preferences.highAlertConfig,
            options = successState.filterOptions,
            onDismiss = { showFilterSheet = false },
            onFiltersChange = viewModel::updateFilters,
            onHighAlertConfigChange = viewModel::updateHighAlertConfig
        )
    }
}
