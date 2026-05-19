package com.emergency.alerts

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.emergency.alerts.core.designsystem.components.NFAErrorState
import com.emergency.alerts.core.designsystem.components.NFALoadingState
import com.emergency.alerts.core.designsystem.theme.NFAAlertsTheme
import com.emergency.alerts.core.designsystem.theme.NFAThemeMode
import com.emergency.alerts.core.designsystem.theme.NFAThemePreset
import com.emergency.alerts.core.designsystem.theme.NFAThemeSelection
import com.emergency.alerts.feature.auth.SessionUiState
import com.emergency.alerts.feature.auth.SessionViewModel
import com.emergency.alerts.feature.auth.LoginScreen
import com.emergency.alerts.feature.home.HomeFeedScreen
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val sessionViewModel: SessionViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NFAAlertsTheme(
                selection = NFAThemeSelection(
                    preset = NFAThemePreset.Light,
                    mode = NFAThemeMode.Light
                )
            ) {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    val uiState by sessionViewModel.uiState.collectAsState()

                    Timber.d("Current UI State: $uiState")

                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                        contentAlignment = Alignment.Center
                    ) {
                        when (val state = uiState) {
                            is SessionUiState.Loading -> NFALoadingState(message = "Loading session...")
                            is SessionUiState.Unauthenticated -> LoginScreen()
                            is SessionUiState.MissingProfile -> {
                                InfoPanel(
                                    title = "Profile not found",
                                    message = "Please complete registration on the web app.",
                                    actionLabel = "Sign Out",
                                    onAction = { sessionViewModel.signOut() }
                                )
                            }
                            is SessionUiState.Restricted -> {
                                InfoPanel(
                                    title = "Account restricted",
                                    message = state.reason,
                                    actionLabel = "Sign Out",
                                    onAction = { sessionViewModel.signOut() }
                                )
                            }
                            is SessionUiState.Authenticated -> HomeFeedScreen(
                                role = state.role,
                                onIncidentClick = { incidentId ->
                                    Timber.d("Clicked incident: $incidentId")
                                }
                            )
                            is SessionUiState.Error -> NFAErrorState(message = state.message)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun InfoPanel(
    title: String,
    message: String,
    actionLabel: String,
    onAction: () -> Unit
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shape = MaterialTheme.shapes.medium,
        tonalElevation = 2.dp,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = title, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = message, style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = onAction) {
                Text(actionLabel)
            }
        }
    }
}
