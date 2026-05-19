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
import androidx.compose.ui.unit.dp
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

                    Timber.d("Current UI State: $uiState")

                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                        contentAlignment = Alignment.Center
                    ) {
                        when (val state = uiState) {
                            is SessionUiState.Loading -> Text("Loading Session...")
                            is SessionUiState.Unauthenticated -> LoginScreen()
                            is SessionUiState.MissingProfile -> {
                                androidx.compose.foundation.layout.Column(
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text("Profile not found.")
                                    Text("Please complete registration on the web app.")
                                    androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(8.dp))
                                    androidx.compose.material3.Button(onClick = { sessionViewModel.signOut() }) {
                                        Text("Sign Out")
                                    }
                                }
                            }
                            is SessionUiState.Restricted -> {
                                androidx.compose.foundation.layout.Column(
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text("Account Restricted")
                                    Text(state.reason)
                                    androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(8.dp))
                                    androidx.compose.material3.Button(onClick = { sessionViewModel.signOut() }) {
                                        Text("Sign Out")
                                    }
                                }
                            }
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
