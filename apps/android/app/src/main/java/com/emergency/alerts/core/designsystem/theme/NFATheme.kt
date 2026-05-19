package com.emergency.alerts.core.designsystem.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import com.emergency.alerts.core.designsystem.tokens.DefaultNFAElevation
import com.emergency.alerts.core.designsystem.tokens.DefaultNFAShapes
import com.emergency.alerts.core.designsystem.tokens.DefaultNFASpacing
import com.emergency.alerts.core.designsystem.tokens.NFAElevationTokens
import com.emergency.alerts.core.designsystem.tokens.NFAExtendedColors
import com.emergency.alerts.core.designsystem.tokens.NFAShapeTokens
import com.emergency.alerts.core.designsystem.tokens.NFASpacingTokens
import com.emergency.alerts.core.designsystem.tokens.NFATypography
import com.emergency.alerts.core.designsystem.tokens.nfaPaletteForPreset
import androidx.compose.runtime.CompositionLocalProvider

enum class NFAThemePreset(
    val storageValue: String,
    val displayName: String
) {
    Light("light", "NFA Light"),
    ClassicBlue("classic_blue", "Classic Blue"),
    ExecutiveDark("executive_dark", "Executive Dark"),
    HighContrast("high_contrast", "High Contrast"),
    Firehouse("firehouse", "Firehouse")
}

enum class NFAThemeMode {
    Light,
    Dark,
    System
}

@Immutable
data class NFAThemeOverrides(
    val primaryColor: Color? = null,
    val secondaryColor: Color? = null,
    val accentColor: Color? = null,
    val backgroundColor: Color? = null,
    val surfaceColor: Color? = null,
    val textColor: Color? = null
)

@Immutable
data class NFAThemeSelection(
    val preset: NFAThemePreset = NFAThemePreset.Light,
    val mode: NFAThemeMode = NFAThemeMode.Light,
    val overrides: NFAThemeOverrides? = null
)

private val LocalNFASpacing = staticCompositionLocalOf { DefaultNFASpacing }
private val LocalNFAShapes = staticCompositionLocalOf { DefaultNFAShapes }
private val LocalNFAElevation = staticCompositionLocalOf { DefaultNFAElevation }
private val LocalNFAExtendedColors = staticCompositionLocalOf {
    nfaPaletteForPreset(NFAThemePreset.Light.storageValue, false).extended
}
private val LocalNFAThemeSelection = staticCompositionLocalOf { NFAThemeSelection() }

@Stable
object NFATheme {
    val spacing: NFASpacingTokens
        @Composable
        @ReadOnlyComposable
        get() = LocalNFASpacing.current

    val shapes: NFAShapeTokens
        @Composable
        @ReadOnlyComposable
        get() = LocalNFAShapes.current

    val elevation: NFAElevationTokens
        @Composable
        @ReadOnlyComposable
        get() = LocalNFAElevation.current

    val colors: NFAExtendedColors
        @Composable
        @ReadOnlyComposable
        get() = LocalNFAExtendedColors.current

    val selection: NFAThemeSelection
        @Composable
        @ReadOnlyComposable
        get() = LocalNFAThemeSelection.current
}

@Composable
fun NFAAlertsTheme(
    selection: NFAThemeSelection = NFAThemeSelection(),
    content: @Composable () -> Unit
) {
    val resolvedDarkTheme = when (selection.mode) {
        NFAThemeMode.Light -> false
        NFAThemeMode.Dark -> true
        NFAThemeMode.System -> isSystemInDarkTheme()
    }
    val palette = nfaPaletteForPreset(selection.preset.storageValue, resolvedDarkTheme)
    val overrides = selection.overrides
    val colorScheme = palette.colorScheme.copy(
        primary = overrides?.primaryColor ?: palette.colorScheme.primary,
        secondary = overrides?.secondaryColor ?: palette.colorScheme.secondary,
        tertiary = overrides?.accentColor ?: palette.colorScheme.tertiary,
        background = overrides?.backgroundColor ?: palette.colorScheme.background,
        surface = overrides?.surfaceColor ?: palette.colorScheme.surface,
        onBackground = overrides?.textColor ?: palette.colorScheme.onBackground,
        onSurface = overrides?.textColor ?: palette.colorScheme.onSurface
    )

    CompositionLocalProvider(
        LocalNFASpacing provides DefaultNFASpacing,
        LocalNFAShapes provides DefaultNFAShapes,
        LocalNFAElevation provides DefaultNFAElevation,
        LocalNFAExtendedColors provides palette.extended,
        LocalNFAThemeSelection provides selection
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = NFATypography,
            shapes = DefaultNFAShapes.toMaterialShapes(),
            content = content
        )
    }
}
