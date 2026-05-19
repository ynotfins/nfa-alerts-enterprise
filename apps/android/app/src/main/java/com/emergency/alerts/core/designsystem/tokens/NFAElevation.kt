package com.emergency.alerts.core.designsystem.tokens

import androidx.compose.runtime.Immutable
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
data class NFAElevationTokens(
    val none: Dp = 0.dp,
    val subtle: Dp = 1.dp,
    val card: Dp = 4.dp,
    val nav: Dp = 12.dp,
    val floating: Dp = 18.dp
)

val DefaultNFAElevation = NFAElevationTokens()
