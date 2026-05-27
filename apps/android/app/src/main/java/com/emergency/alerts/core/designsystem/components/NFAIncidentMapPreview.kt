package com.emergency.alerts.core.designsystem.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Place
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.emergency.alerts.core.designsystem.theme.NFATheme
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapUiSettings
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState

@Composable
fun NFAIncidentMapPreview(
    latitude: Double?,
    longitude: Double?,
    title: String?,
    address: String?,
    modifier: Modifier = Modifier,
    mapHeight: Dp = 220.dp
) {
    val hasValidCoordinates = latitude.isUsableLatitude() && longitude.isUsableLongitude()

    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = NFATheme.shapes.card,
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, NFATheme.colors.cardBorder),
        shadowElevation = NFATheme.elevation.card,
        tonalElevation = NFATheme.elevation.none
    ) {
        if (hasValidCoordinates) {
            val latLng = remember(latitude, longitude) {
                LatLng(latitude!!, longitude!!)
            }
            val cameraPositionState = rememberCameraPositionState()
            val markerState = remember(latLng) { MarkerState(position = latLng) }

            androidx.compose.runtime.LaunchedEffect(latLng) {
                cameraPositionState.move(CameraUpdateFactory.newLatLngZoom(latLng, 14f))
            }

            Column {
                GoogleMap(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(mapHeight)
                        .clip(NFATheme.shapes.card),
                    cameraPositionState = cameraPositionState,
                    properties = MapProperties(isMyLocationEnabled = false),
                    uiSettings = MapUiSettings(
                        compassEnabled = false,
                        indoorLevelPickerEnabled = false,
                        mapToolbarEnabled = false,
                        myLocationButtonEnabled = false,
                        rotationGesturesEnabled = false,
                        tiltGesturesEnabled = false
                    )
                ) {
                    Marker(
                        state = markerState,
                        title = title?.takeIf { it.isNotBlank() } ?: "Incident location",
                        snippet = address?.takeIf { it.isNotBlank() }
                    )
                }

                MapPreviewMeta(
                    title = title,
                    address = address
                )
            }
        } else {
            MapPreviewUnavailable(
                title = title,
                address = address,
                mapHeight = mapHeight
            )
        }
    }
}

@Composable
private fun MapPreviewMeta(
    title: String?,
    address: String?
) {
    Column(
        modifier = Modifier.padding(NFATheme.spacing.md),
        verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.xs)
    ) {
        Text(
            text = title?.takeIf { it.isNotBlank() } ?: "Incident map",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
        if (!address.isNullOrBlank()) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(NFATheme.spacing.xs),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Outlined.Place,
                    contentDescription = null,
                    tint = NFATheme.colors.accentBlue
                )
                Text(
                    text = address,
                    style = MaterialTheme.typography.bodyMedium,
                    color = NFATheme.colors.textSecondary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun MapPreviewUnavailable(
    title: String?,
    address: String?,
    mapHeight: Dp
) {
    Column {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(mapHeight)
                .background(NFATheme.colors.mapPreviewSurface),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier.padding(NFATheme.spacing.xl),
                verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.sm),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Surface(
                    shape = CircleShape,
                    color = NFATheme.colors.mapPreviewOverlay
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Place,
                        contentDescription = null,
                        tint = NFATheme.colors.mapPlaceholderIcon,
                        modifier = Modifier.padding(NFATheme.spacing.md)
                    )
                }
                Text(
                    text = "Map preview unavailable",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "This alert does not have backend-provided latitude/longitude yet.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = NFATheme.colors.textSecondary
                )
            }
        }

        MapPreviewMeta(
            title = title,
            address = address
        )
    }
}

private fun Double?.isUsableLatitude(): Boolean {
    return this != null && this in -90.0..90.0 && this != 0.0
}

private fun Double?.isUsableLongitude(): Boolean {
    return this != null && this in -180.0..180.0 && this != 0.0
}
