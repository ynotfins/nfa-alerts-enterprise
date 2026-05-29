package com.emergency.alerts.feature.home

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
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
import com.emergency.alerts.domain.model.canResetFilters
import com.emergency.alerts.domain.model.isActive

private val HomeLocationPermissions = arrayOf(
    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.ACCESS_COARSE_LOCATION
)

@Composable
fun HomeFeedScreen(
    role: String,
    onIncidentClick: (String) -> Unit,
    viewModel: HomeFeedViewModel = viewModel()
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val uiState by viewModel.uiState.collectAsState()
    val navigationConfig = nfaRoleNavigationConfig(NFAUserRole.fromRaw(role))
    var showFilterSheet by remember { mutableStateOf(false) }
    val successState = uiState as? HomeFeedUiState.Success
    val isFiltered = successState?.preferences?.filters?.isActive() == true
    var hasLocationPermission by remember { mutableStateOf(context.hasHomeLocationPermission()) }
    var locationPermissionRequested by rememberSaveable { mutableStateOf(false) }
    val latestPermissionChangeHandler by rememberUpdatedState(newValue = viewModel::onLocationPermissionUpdated)
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) {
        val granted = context.hasHomeLocationPermission()
        hasLocationPermission = granted
        if (granted) {
            latestPermissionChangeHandler()
        }
    }

    LaunchedEffect(hasLocationPermission, locationPermissionRequested) {
        if (hasLocationPermission) {
            latestPermissionChangeHandler()
        } else if (!locationPermissionRequested) {
            locationPermissionRequested = true
            locationPermissionLauncher.launch(HomeLocationPermissions)
        }
    }

    DisposableEffect(lifecycleOwner, context) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                val granted = context.hasHomeLocationPermission()
                val becameGranted = granted && !hasLocationPermission
                hasLocationPermission = granted
                if (becameGranted) {
                    latestPermissionChangeHandler()
                }
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            NFATopBar(
                title = "Incidents",
                trailingContent = {
                    Row {
                        NFAIconButton(
                            icon = Icons.Default.Visibility,
                            contentDescription = "Show hidden alerts",
                            onClick = viewModel::onRestoreHidden,
                            tint = NFATheme.colors.actionHidden,
                            containerColor = NFATheme.colors.transparent,
                            borderColor = NFATheme.colors.transparent,
                            size = 40
                        )
                        NFAIconButton(
                            icon = Icons.Default.FilterList,
                            contentDescription = if (isFiltered) {
                                "Open Home filters (feed filtered)"
                            } else {
                                "Open Home filters"
                            },
                            onClick = { showFilterSheet = true },
                            modifier = Modifier.padding(start = NFATheme.spacing.xs),
                            tint = NFATheme.colors.navIncidents,
                            containerColor = NFATheme.colors.transparent,
                            borderColor = NFATheme.colors.transparent,
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
                    Column(modifier = Modifier.fillMaxSize()) {
                        if (state.preferences.filters.isActive()) {
                            HomeFeedFilteredNotice(
                                onResetFilters = viewModel::resetFilters,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        if (state.incidents.isEmpty()) {
                            NFAEmptyState(
                                title = if (state.preferences.filters.isActive()) {
                                    "No incidents match current filters"
                                } else {
                                    "No active incidents"
                                },
                                message = if (state.preferences.filters.isActive()) {
                                    "Reset or change Home filters to see all active incidents."
                                } else {
                                    "Live alerts will appear here when new incidents are available."
                                },
                                modifier = Modifier.weight(1f)
                            )
                        } else {
                            LazyColumn(
                                modifier = Modifier.weight(1f),
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
    }

    if (showFilterSheet && successState != null) {
        HomeFeedFilterSheet(
            filters = successState.preferences.filters,
            highAlertConfig = successState.preferences.highAlertConfig,
            options = successState.filterOptions,
            canResetFilters = successState.preferences.canResetFilters(),
            onDismiss = { showFilterSheet = false },
            onResetFilters = viewModel::resetFilters,
            onFiltersChange = viewModel::updateFilters,
            onHighAlertConfigChange = viewModel::updateHighAlertConfig
        )
    }
}

private fun Context.hasHomeLocationPermission(): Boolean {
    val fineGranted = ContextCompat.checkSelfPermission(
        this,
        Manifest.permission.ACCESS_FINE_LOCATION
    ) == PackageManager.PERMISSION_GRANTED
    val coarseGranted = ContextCompat.checkSelfPermission(
        this,
        Manifest.permission.ACCESS_COARSE_LOCATION
    ) == PackageManager.PERMISSION_GRANTED
    return fineGranted || coarseGranted
}

@Composable
private fun HomeFeedFilteredNotice(
    onResetFilters: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .padding(horizontal = NFATheme.spacing.screenHorizontal)
            .padding(top = NFATheme.spacing.sm),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.xxs)
        ) {
            Text(
                text = "Home feed filtered",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onBackground,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = "Some incidents are hidden by local Home filters.",
                style = MaterialTheme.typography.bodySmall,
                color = NFATheme.colors.textSecondary
            )
        }
        TextButton(onClick = onResetFilters) {
            Text("Reset")
        }
    }
}

