package com.emergency.alerts.core.designsystem.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import com.emergency.alerts.core.designsystem.theme.NFATheme

@Composable
fun NFALoadingState(
    modifier: Modifier = Modifier,
    message: String = "Loading incidents..."
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.sm)
        ) {
            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = NFATheme.colors.textSecondary
            )
        }
    }
}

@Composable
fun NFAEmptyState(
    title: String,
    message: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            shape = NFATheme.shapes.card,
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = NFATheme.elevation.subtle,
            shadowElevation = NFATheme.elevation.subtle
        ) {
            Column(
                modifier = Modifier.padding(NFATheme.spacing.xl),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.xs)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = NFATheme.colors.textSecondary
                )
            }
        }
    }
}

@Composable
fun NFAErrorState(
    message: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            shape = NFATheme.shapes.card,
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = NFATheme.elevation.subtle,
            shadowElevation = NFATheme.elevation.subtle
        ) {
            Column(
                modifier = Modifier.padding(NFATheme.spacing.xl),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.xs)
            ) {
                Text(
                    text = "Unable to load incidents",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.error,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = NFATheme.colors.textSecondary
                )
            }
        }
    }
}
