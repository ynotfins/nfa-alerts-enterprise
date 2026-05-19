package com.emergency.alerts.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.emergency.alerts.domain.model.HomeFeedIncident
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

private const val BACKGROUND_COLOR = 0xFFF0F2F5

@Composable
fun HomeFeedScreen(
    onIncidentClick: (String) -> Unit,
    viewModel: HomeFeedViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface
            ) {
                // Icons-only navigation. Colors convey active state per design.
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = {
                        Icon(
                            Icons.Default.List,
                            contentDescription = "Incidents",
                            tint = if (selectedTab == 0) Color(0xFF1976D2) else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = {
                        Icon(
                            Icons.Default.FavoriteBorder,
                            contentDescription = "Favorites",
                            tint = if (selectedTab == 1) Color(0xFFE91E63) else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = {
                        Icon(
                            Icons.Default.Place,
                            contentDescription = "Route",
                            tint = if (selectedTab == 2) Color(0xFF4CAF50) else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = {
                        Icon(
                            Icons.Default.Notifications,
                            contentDescription = "Notifications",
                            tint = if (selectedTab == 3) Color(0xFFFFA000) else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                )
                NavigationBarItem(
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4 },
                    icon = {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = "Chasers",
                            tint = if (selectedTab == 4) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                )
                NavigationBarItem(
                    selected = selectedTab == 5,
                    onClick = { selectedTab = 5 },
                    icon = {
                        Icon(
                            Icons.Default.Email,
                            contentDescription = "Chat",
                            tint = if (selectedTab == 5) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                )
                NavigationBarItem(
                    selected = selectedTab == 6,
                    onClick = { selectedTab = 6 },
                    icon = {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = "Profile",
                            tint = if (selectedTab == 6) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                )
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.fillMaxSize().padding(innerPadding).background(Color(BACKGROUND_COLOR))) {
            if (selectedTab != 0) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Placeholder for tab $selectedTab", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            } else {
                when (val state = uiState) {
                    is HomeFeedUiState.Loading -> {
                        CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                    }
                    is HomeFeedUiState.Error -> {
                        Text(
                            text = state.message,
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.align(Alignment.Center).padding(16.dp)
                        )
                    }
                    is HomeFeedUiState.Success -> {
                        if (state.incidents.isEmpty()) {
                            Text(
                                text = "No active incidents.",
                                modifier = Modifier.align(Alignment.Center)
                            )
                        } else {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(top = 8.dp, bottom = 8.dp)
                            ) {
                                items(
                                    items = state.incidents,
                                    key = { it.incident.id }
                                ) { feedIncident ->
                                    IncidentCard(
                                        feedIncident = feedIncident,
                                        onClick = { onIncidentClick(feedIncident.incident.id) }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun IncidentCard(
    feedIncident: HomeFeedIncident,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val incident = feedIncident.incident
    val timeFormat = SimpleDateFormat("MM/dd/yy hh:mm a", Locale.getDefault())
    val dateToFormat = if (incident.updatedAt > 0L) incident.updatedAt else incident.createdAt
    val timeString = timeFormat.format(Date(dateToFormat))

    val loc = incident.location
    val countyCityStr = listOfNotNull(
        loc.state.takeIf { it.isNotBlank() },
        loc.county.takeIf { !it.isNullOrBlank() },
        loc.city.takeIf { it.isNotBlank() }
    ).joinToString(", ")

    // Clean department codes but preserve codes after any BNNDESK tokens
    val deptCodes = incident.departmentNumber.map { it.replace(Regex("(?i)BNNDESK\\s*"), "") }
        .map { it.trim() }
        .filter { it.isNotBlank() }
        .joinToString(" ")

    val filteredDesc = incident.description.replace(Regex("(?i)BNNDESK\\s*"), "")

    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 6.dp)
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        shape = MaterialTheme.shapes.small
    ) {
        Row(modifier = Modifier.fillMaxWidth().height(IntrinsicSize.Min)) {
            // Blue accent bar
            val isImportant = incident.alarmLevel != null || incident.type.equals("fire", ignoreCase = true)
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(4.dp)
                    .background(if (isImportant) Color(0xFF1976D2) else Color.LightGray)
            )

            Column(modifier = Modifier.padding(8.dp).weight(1f)) {
                // Top Line: saved date/time (left) and distance (right)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = timeString,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray,
                        fontWeight = FontWeight.SemiBold
                    )
                    val distanceText = if (feedIncident.distanceMiles != null) {
                        val dist = (feedIncident.distanceMiles * 10.0).roundToInt() / 10.0
                        "${dist} mi"
                    } else {
                        "-- mi"
                    }
                    Text(
                        text = distanceText,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                // Body text (max 7 lines) in required order:
                // State, County, City, Address, Alert type, Alert message, Dept code, Alert ID
                val bodyLines = mutableListOf<String>()
                bodyLines.add(loc.state)
                loc.county?.takeIf { it.isNotBlank() }?.let { bodyLines.add(it) }
                loc.city.takeIf { it.isNotBlank() }?.let { bodyLines.add(it) }
                loc.address.takeIf { it.isNotBlank() }?.let { bodyLines.add(it) }
                bodyLines.add(incident.type.uppercase())
                if (filteredDesc.isNotBlank()) bodyLines.add(filteredDesc)
                if (deptCodes.isNotBlank()) bodyLines.add(deptCodes)
                if (!incident.alertId.isNullOrBlank()) bodyLines.add("#${incident.alertId}")

                Text(
                    text = bodyLines.joinToString(separator = "\n"),
                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 15.sp, lineHeight = 20.sp),
                    color = Color.Black,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 7,
                    overflow = TextOverflow.Ellipsis
                )

                if (incident.alarmLevel != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        color = Color(0xFFFFEBEE),
                        shape = MaterialTheme.shapes.extraSmall,
                        contentColor = Color(0xFFC62828)
                    ) {
                        Text(
                            text = incident.alarmLevel.uppercase(),
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Circular Arrow Right Affordance
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .padding(end = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = Color(0xFFF4F5F7),
                    tonalElevation = 0.dp,
                    modifier = Modifier.width(36.dp).height(36.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                            contentDescription = "Details",
                            tint = Color.LightGray
                        )
                    }
                }
            }
        }
        // subtle divider at bottom of card
        Spacer(modifier = Modifier.height(1.dp).fillMaxWidth().background(Color(0xFFECECEC)))
    }
}
