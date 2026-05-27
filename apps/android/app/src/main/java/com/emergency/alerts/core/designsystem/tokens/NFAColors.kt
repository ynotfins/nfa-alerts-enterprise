package com.emergency.alerts.core.designsystem.tokens

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

@Immutable
data class NFAExtendedColors(
    val divider: Color,
    val cardBorder: Color,
    val mutedSurface: Color,
    val navContainerBorder: Color,
    val navSelectedSurface: Color,
    val accentBlue: Color,
    val favorite: Color,
    val bookmark: Color,
    val route: Color,
    val notifications: Color,
    val chasers: Color,
    val chat: Color,
    val profile: Color,
    val neutralNav: Color,
    val severityCritical: Color,
    val severityWarning: Color,
    val severityInfo: Color,
    val severityCriticalSurface: Color,
    val mapPreviewSurface: Color,
    val mapPreviewOverlay: Color,
    val mapPlaceholderIcon: Color,
    val textSecondary: Color,
    val textTertiary: Color
)

@Immutable
data class NFAThemePalette(
    val name: String,
    val colorScheme: ColorScheme,
    val extended: NFAExtendedColors,
    val isDark: Boolean
)

private val LockedPurple = Color(0xFF6840B8)
private val LockedRed = Color(0xFFD81800)
private val LockedYellow = Color(0xFFF4B400)
private val LockedOrange = Color(0xFFFF7000)
private val LockedGreen = Color(0xFF00A858)
private val LockedBlue = Color(0xFF508FF8)

private val LightBackground = Color(0xFFF7F7F8)
private val LightSurface = Color(0xFFFFFFFF)
private val LightHeaderSurface = Color(0xFFF0F1F3)
private val LightTextPrimary = Color(0xFF111111)
private val LightTextSecondary = Color(0xFF6B7280)
private val LightTextTertiary = Color(0xFF9CA3AF)
private val LightBorder = Color(0xFFE5E7EB)
private val LightBorderSubtle = Color(0xFFEEF2F6)

private val DarkBackground = Color(0xFF080808)
private val DarkSurface = Color(0xFF111111)
private val DarkHeaderSurface = Color(0xFF151515)
private val DarkTextPrimary = Color(0xFFFFFFFF)
private val DarkTextSecondary = Color(0xFFB8B8B8)
private val DarkTextTertiary = Color(0xFF8F8F8F)
private val DarkBorder = Color(0xFF2A2A2A)
private val DarkBorderSubtle = Color(0xFF1A1A1A)

private val LightBaseScheme = lightColorScheme(
    primary = LockedBlue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFDCE8FF),
    onPrimaryContainer = LightTextPrimary,
    secondary = LockedPurple,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE7DEFA),
    onSecondaryContainer = LightTextPrimary,
    tertiary = LockedOrange,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFE1CC),
    onTertiaryContainer = LightTextPrimary,
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightHeaderSurface,
    onSurfaceVariant = LightTextSecondary,
    error = LockedRed,
    onError = Color.White,
    outline = LightBorder,
    outlineVariant = LightBorderSubtle,
    inverseSurface = DarkSurface,
    inverseOnSurface = DarkTextPrimary
)

private val DefaultLightExtended = NFAExtendedColors(
    divider = LightBorder,
    cardBorder = LightBorder,
    mutedSurface = LightHeaderSurface,
    navContainerBorder = LightBorder,
    navSelectedSurface = LockedBlue.copy(alpha = 0.10f),
    accentBlue = LockedBlue,
    favorite = LockedRed,
    bookmark = LockedYellow,
    route = LockedGreen,
    notifications = LockedOrange,
    chasers = LockedPurple,
    chat = LockedBlue,
    profile = LockedYellow,
    neutralNav = LightTextSecondary,
    severityCritical = LockedRed,
    severityWarning = LockedOrange,
    severityInfo = LockedBlue,
    severityCriticalSurface = LockedRed.copy(alpha = 0.10f),
    mapPreviewSurface = LightSurface,
    mapPreviewOverlay = LightHeaderSurface,
    mapPlaceholderIcon = LockedBlue,
    textSecondary = LightTextSecondary,
    textTertiary = LightTextTertiary
)

private val DarkBaseScheme = darkColorScheme(
    primary = LockedBlue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF1E3763),
    onPrimaryContainer = DarkTextPrimary,
    secondary = LockedPurple,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFF3A2863),
    onSecondaryContainer = DarkTextPrimary,
    tertiary = LockedOrange,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFF5A3518),
    onTertiaryContainer = DarkTextPrimary,
    background = DarkBackground,
    onBackground = DarkTextPrimary,
    surface = DarkSurface,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkHeaderSurface,
    onSurfaceVariant = DarkTextSecondary,
    error = LockedRed,
    onError = Color.White,
    outline = DarkBorder,
    outlineVariant = DarkBorderSubtle,
    inverseSurface = LightSurface,
    inverseOnSurface = LightTextPrimary
)

private val DarkExtended = NFAExtendedColors(
    divider = DarkBorder,
    cardBorder = DarkBorder,
    mutedSurface = DarkHeaderSurface,
    navContainerBorder = DarkBorder,
    navSelectedSurface = LockedBlue.copy(alpha = 0.16f),
    accentBlue = LockedBlue,
    favorite = LockedRed,
    bookmark = LockedYellow,
    route = LockedGreen,
    notifications = LockedOrange,
    chasers = LockedPurple,
    chat = LockedBlue,
    profile = LockedYellow,
    neutralNav = DarkTextSecondary,
    severityCritical = LockedRed,
    severityWarning = LockedOrange,
    severityInfo = LockedBlue,
    severityCriticalSurface = LockedRed.copy(alpha = 0.22f),
    mapPreviewSurface = DarkSurface,
    mapPreviewOverlay = DarkHeaderSurface,
    mapPlaceholderIcon = LockedBlue,
    textSecondary = DarkTextSecondary,
    textTertiary = DarkTextTertiary
)

private fun lockedPaletteName(presetName: String, isDark: Boolean): String {
    return when (presetName) {
        "classic_blue" -> "Classic Blue"
        "executive_dark" -> "Executive Dark"
        "high_contrast" -> "High Contrast"
        "firehouse" -> "Firehouse"
        else -> if (isDark) "NFA Dark" else "NFA Light"
    }
}

fun nfaPaletteForPreset(presetName: String, isDark: Boolean): NFAThemePalette {
    return NFAThemePalette(
        name = lockedPaletteName(presetName, isDark),
        colorScheme = if (isDark) DarkBaseScheme else LightBaseScheme,
        extended = if (isDark) DarkExtended else DefaultLightExtended,
        isDark = isDark
    )
}
