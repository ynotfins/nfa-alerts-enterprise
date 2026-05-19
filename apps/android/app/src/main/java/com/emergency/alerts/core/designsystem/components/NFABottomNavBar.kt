package com.emergency.alerts.core.designsystem.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.emergency.alerts.core.designsystem.theme.NFATheme

enum class NFAUserRole {
    Admin,
    Supe,
    Chaser;

    companion object {
        fun fromRaw(role: String): NFAUserRole = when (role.lowercase()) {
            "admin" -> Admin
            "supe" -> Supe
            else -> Chaser
        }
    }
}

enum class NFABottomDestination {
    Incidents,
    Favorites,
    Route,
    Notifications,
    Chasers,
    Chat,
    Profile
}

@Immutable
data class NFABottomNavItem(
    val destination: NFABottomDestination,
    val icon: ImageVector,
    val contentDescription: String,
    val tint: Color,
    val enabled: Boolean,
    val visibleFor: Set<NFAUserRole>
)

@Immutable
data class NFARoleNavigationConfig(
    val role: NFAUserRole,
    val items: List<NFABottomNavItem>,
    val selectedDestination: NFABottomDestination = NFABottomDestination.Incidents
)

@Composable
fun nfaRoleNavigationConfig(role: NFAUserRole): NFARoleNavigationConfig {
    val allRoles = setOf(NFAUserRole.Admin, NFAUserRole.Supe, NFAUserRole.Chaser)
    val items = listOf(
        NFABottomNavItem(
            destination = NFABottomDestination.Incidents,
            icon = Icons.AutoMirrored.Filled.List,
            contentDescription = "Incidents",
            tint = NFATheme.colors.accentBlue,
            enabled = true,
            visibleFor = allRoles
        ),
        NFABottomNavItem(
            destination = NFABottomDestination.Favorites,
            icon = Icons.Default.FavoriteBorder,
            contentDescription = "Favorites",
            tint = NFATheme.colors.favorite,
            enabled = false,
            visibleFor = allRoles
        ),
        NFABottomNavItem(
            destination = NFABottomDestination.Route,
            icon = Icons.Default.Place,
            contentDescription = "Route",
            tint = NFATheme.colors.route,
            enabled = false,
            visibleFor = allRoles
        ),
        NFABottomNavItem(
            destination = NFABottomDestination.Notifications,
            icon = Icons.Default.Notifications,
            contentDescription = "Notifications",
            tint = NFATheme.colors.notifications,
            enabled = false,
            visibleFor = allRoles
        ),
        NFABottomNavItem(
            destination = NFABottomDestination.Chasers,
            icon = Icons.Default.Person,
            contentDescription = "Chasers",
            tint = NFATheme.colors.neutralNav,
            enabled = false,
            visibleFor = allRoles
        ),
        NFABottomNavItem(
            destination = NFABottomDestination.Chat,
            icon = Icons.Default.Email,
            contentDescription = "Chat",
            tint = NFATheme.colors.neutralNav,
            enabled = false,
            visibleFor = allRoles
        ),
        NFABottomNavItem(
            destination = NFABottomDestination.Profile,
            icon = Icons.Default.Person,
            contentDescription = "Profile",
            tint = NFATheme.colors.neutralNav,
            enabled = false,
            visibleFor = allRoles
        )
    ).filter { role in it.visibleFor }
    return NFARoleNavigationConfig(role = role, items = items)
}

@Composable
fun NFABottomNavBar(
    items: List<NFABottomNavItem>,
    selectedDestination: NFABottomDestination,
    onDestinationSelected: (NFABottomDestination) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .padding(
                horizontal = NFATheme.spacing.screenHorizontal,
                vertical = NFATheme.spacing.bottomNavPadding
            ),
        shape = NFATheme.shapes.navContainer,
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = NFATheme.elevation.nav,
        tonalElevation = NFATheme.elevation.none,
        border = BorderStroke(1.dp, NFATheme.colors.navContainerBorder)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(
                    horizontal = NFATheme.spacing.sm,
                    vertical = NFATheme.spacing.sm
                ),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            items.forEach { item ->
                val selected = item.destination == selectedDestination
                val iconBackground = if (selected) {
                    NFATheme.colors.navSelectedSurface.copy(alpha = if (item.enabled) 1f else 0.8f)
                } else {
                    Color.Transparent
                }
                Box(
                    modifier = Modifier
                        .width(44.dp)
                        .size(if (selected) 44.dp else 40.dp)
                        .then(
                            if (item.enabled) {
                                Modifier.clickable { onDestinationSelected(item.destination) }
                            } else {
                                Modifier
                            }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Surface(
                        shape = NFATheme.shapes.iconButton,
                        color = iconBackground,
                        border = if (selected) {
                            BorderStroke(1.dp, item.tint.copy(alpha = 0.12f))
                        } else {
                            null
                        }
                    ) {
                        Box(
                            modifier = Modifier
                                .size(if (selected) 44.dp else 40.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.contentDescription,
                                tint = if (selected) item.tint else item.tint.copy(alpha = if (item.enabled) 0.92f else 0.76f)
                            )
                        }
                    }
                }
            }
        }
    }
}
