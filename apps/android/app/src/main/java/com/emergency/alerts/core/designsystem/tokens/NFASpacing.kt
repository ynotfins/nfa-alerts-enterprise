package com.emergency.alerts.core.designsystem.tokens

import androidx.compose.runtime.Immutable
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
data class NFASpacingTokens(
    val xxxs: Dp = 2.dp,
    val xxs: Dp = 4.dp,
    val xs: Dp = 6.dp,
    val sm: Dp = 10.dp,
    val md: Dp = 16.dp,
    val lg: Dp = 18.dp,
    val xl: Dp = 24.dp,
    val xxl: Dp = 30.dp,
    val screenHorizontal: Dp = 18.dp,
    val screenVertical: Dp = 14.dp,
    val cardHorizontal: Dp = 18.dp,
    val cardVertical: Dp = 14.dp,
    val cardGap: Dp = 12.dp,
    val metadataGap: Dp = 8.dp,
    val dividerInset: Dp = 18.dp,
    val bottomNavPadding: Dp = 14.dp
)

val DefaultNFASpacing = NFASpacingTokens()
