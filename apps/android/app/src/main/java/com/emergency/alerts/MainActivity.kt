package com.emergency.alerts

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.emergency.alerts.feature.auth.SessionUiState
import com.emergency.alerts.feature.auth.SessionViewModel
import com.emergency.alerts.feature.auth.LoginScreen
import com.emergency.alerts.feature.home.HomeFeedScreen
import com.emergency.alerts.ui.theme.NFAAlertsTheme
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val sessionViewModel: SessionViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NFAAlertsTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    val uiState by sessionViewModel.uiState.collectAsState()

                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                        contentAlignment = Alignment.Center
                    ) {
                        when (val state = uiState) {
                            is SessionUiState.Loading -> Text("Loading Session...")
                            is SessionUiState.Unauthenticated -> LoginScreen()
                            is SessionUiState.MissingProfile -> Text("Profile missing for UID: ${state.uid}")
                            is SessionUiState.Restricted -> Text("Account Restricted: ${state.reason}")
                            is SessionUiState.Authenticated -> HomeFeedScreen(onIncidentClick = { incidentId ->
                                Timber.d("Clicked incident: $incidentId")
                            })
                            is SessionUiState.Error -> Text("Error: ${state.message}")
                        }
                    }
                }
            }
        }
    }
}
