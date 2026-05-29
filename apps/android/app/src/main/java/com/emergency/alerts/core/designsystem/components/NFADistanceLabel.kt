package com.emergency.alerts.core.designsystem.components

import androidx.compose.foundation.layout.Box
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import com.emergency.alerts.core.designsystem.theme.NFATheme
import kotlin.math.ceil

@Composable
fun NFADistanceLabel(
    distanceMiles: Double?,
    modifier: Modifier = Modifier
) {
    val label = distanceMiles.toCompactDistanceLabel()

    Box(modifier = modifier) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = NFATheme.colors.accentBlue,
            textAlign = TextAlign.Start,
            maxLines = 1
        )
    }
}

private fun Double?.toCompactDistanceLabel(): String {
    if (this == null) return "--mi"

    return "${ceil(this).toInt()}mi"
}

