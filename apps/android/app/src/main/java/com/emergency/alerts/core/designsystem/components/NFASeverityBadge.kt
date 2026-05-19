package com.emergency.alerts.core.designsystem.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.emergency.alerts.core.designsystem.theme.NFATheme

@Composable
fun NFASeverityBadge(
    label: String,
    modifier: Modifier = Modifier
) {
    val normalized = label.lowercase()
    val containerColor = when {
        normalized.contains("3rd") || normalized.contains("4th") || normalized.contains("5th") ->
            NFATheme.colors.severityCriticalSurface

        normalized.contains("2nd") -> MaterialTheme.colorScheme.secondaryContainer
        else -> MaterialTheme.colorScheme.primaryContainer
    }
    val contentColor = when {
        normalized.contains("3rd") || normalized.contains("4th") || normalized.contains("5th") ->
            NFATheme.colors.severityCritical

        normalized.contains("2nd") -> NFATheme.colors.severityWarning
        else -> NFATheme.colors.severityInfo
    }

    Surface(
        modifier = modifier,
        color = containerColor,
        contentColor = contentColor,
        shape = NFATheme.shapes.chip,
        border = BorderStroke(1.dp, contentColor.copy(alpha = 0.14f))
    ) {
        Text(
            text = label.replace('_', ' ').uppercase(),
            modifier = Modifier.padding(
                horizontal = NFATheme.spacing.sm,
                vertical = NFATheme.spacing.xs
            ),
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold
        )
    }
}
