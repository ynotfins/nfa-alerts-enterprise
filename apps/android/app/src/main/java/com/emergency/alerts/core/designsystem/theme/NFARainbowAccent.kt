package com.emergency.alerts.core.designsystem.theme

import androidx.compose.foundation.border
import androidx.compose.runtime.Stable
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import com.emergency.alerts.core.designsystem.tokens.nfaRainbowAccentBrush

@Stable
fun Modifier.nfaRainbowStroke(
    enabled: Boolean,
    shape: Shape,
    width: Dp
): Modifier = composed {
    if (!enabled) {
        this
    } else {
        border(
            width = width,
            brush = nfaRainbowAccentBrush(isDark = NFATheme.isDarkTheme),
            shape = shape
        )
    }
}
