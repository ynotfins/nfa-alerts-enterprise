package com.emergency.alerts.core.designsystem.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.emergency.alerts.core.designsystem.theme.NFATheme

@Composable
fun NFAIconButton(
    icon: ImageVector,
    contentDescription: String,
    onClick: (() -> Unit)?,
    modifier: Modifier = Modifier,
    tint: Color,
    containerColor: Color,
    borderColor: Color = Color.Transparent,
    size: Int = 38
) {
    val showContainer = containerColor.alpha > 0f || borderColor.alpha > 0f
    Surface(
        modifier = modifier,
        shape = NFATheme.shapes.iconButton,
        color = containerColor,
        shadowElevation = if (showContainer) NFATheme.elevation.subtle else NFATheme.elevation.none,
        border = if (borderColor.alpha > 0f) BorderStroke(1.dp, borderColor) else null
    ) {
        Box(
            modifier = Modifier
                .size(size.dp)
                .then(
                    if (onClick != null) {
                        Modifier.clickable(onClick = onClick)
                    } else {
                        Modifier
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = contentDescription,
                tint = tint,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}
