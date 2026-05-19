package com.emergency.alerts.core.designsystem.tokens

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.runtime.Immutable
import androidx.compose.ui.unit.dp

@Immutable
data class NFAShapeTokens(
    val chip: RoundedCornerShape = RoundedCornerShape(13.dp),
    val button: RoundedCornerShape = RoundedCornerShape(18.dp),
    val card: RoundedCornerShape = RoundedCornerShape(24.dp),
    val panel: RoundedCornerShape = RoundedCornerShape(28.dp),
    val navContainer: RoundedCornerShape = RoundedCornerShape(30.dp),
    val iconButton: RoundedCornerShape = RoundedCornerShape(20.dp)
) {
    fun toMaterialShapes(): Shapes = Shapes(
        extraSmall = chip,
        small = button,
        medium = card,
        large = panel,
        extraLarge = navContainer
    )
}

val DefaultNFAShapes = NFAShapeTokens()
