package com.emergency.alerts.core.designsystem.components

import androidx.compose.foundation.layout.Box
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import com.emergency.alerts.core.designsystem.theme.NFATheme
import kotlin.math.roundToInt

@Composable
fun NFADistanceLabel(
    distanceMiles: Double?,
    modifier: Modifier = Modifier
) {
    val label = if (distanceMiles != null) {
        val rounded = (distanceMiles * 10.0).roundToInt() / 10.0
        "$rounded mi"
    } else {
        "-- mi"
    }

    Box(modifier = modifier) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = NFATheme.colors.textSecondary,
            textAlign = TextAlign.End
        )
    }
}
