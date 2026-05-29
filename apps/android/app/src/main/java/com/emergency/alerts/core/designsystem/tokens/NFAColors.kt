package com.emergency.alerts.core.designsystem.tokens

import androidx.compose.material3.ColorScheme
import androidx.compose.ui.graphics.Brush
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

@Immutable
data class NFAExtendedColors(
    val divider: Color,
    val cardBorder: Color,
    val mutedSurface: Color,
    val elevatedSurface: Color,
    val navContainerBorder: Color,
    val navSelectedSurface: Color,
    val transparent: Color,
    val primaryText: Color,
    val actionFavorite: Color,
    val actionBookmark: Color,
    val actionSilent: Color,
    val actionHidden: Color,
    val navIncidents: Color,
    val navFavorites: Color,
    val navRoute: Color,
    val navNotifications: Color,
    val navChasers: Color,
    val navChat: Color,
    val navProfile: Color,
    val neutralNav: Color,
    val alertCritical: Color,
    val alertWarning: Color,
    val alertInfo: Color,
    val alertCriticalSurface: Color,
    val mapPreviewSurface: Color,
    val mapPreviewOverlay: Color,
    val mapPlaceholderIcon: Color,
    val textSecondary: Color,
    val textTertiary: Color
) {
    val accentBlue: Color get() = navIncidents
    val favorite: Color get() = actionFavorite
    val bookmark: Color get() = actionBookmark
    val route: Color get() = navRoute
    val notifications: Color get() = navNotifications
    val chasers: Color get() = navChasers
    val chat: Color get() = navChat
    val profile: Color get() = navProfile
    val severityCritical: Color get() = alertCritical
    val severityWarning: Color get() = alertWarning
    val severityInfo: Color get() = alertInfo
    val severityCriticalSurface: Color get() = alertCriticalSurface
}

@Immutable
data class NFAThemePalette(
    val name: String,
    val colorScheme: ColorScheme,
    val extended: NFAExtendedColors,
    val isDark: Boolean
)

private val LockedBlue = Color(0xFF508FF8)
private val LockedRed = Color(0xFFD81800)
private val LockedOrange = Color(0xFFFF7000)
private val LockedGreen = Color(0xFF00A858)
private val LockedPurple = Color(0xFF6840B8)
private val LockedYellow = Color(0xFFF4B400)

private val TokenBlack = Color(0xFF000000)
private val TokenNearBlack = Color(0xFF050505)
private val TokenDarkCard = Color(0xFF121212)
private val TokenDarkElevatedSurface = Color(0xFF151515)
private val TokenDarkBorder = Color(0xFF2A2A2A)
private val TokenWhite = Color(0xFFFFFFFF)
private val TokenDarkSecondaryText = Color(0xFFB8B8B8)

private val LightBackground = Color(0xFFF7F7F8)
private val LightSurface = TokenWhite
private val LightSurfaceElevated = Color(0xFFF0F1F3)
private val LightTextPrimary = Color(0xFF111111)
private val LightTextSecondary = Color(0xFF6B7280)
private val LightTextTertiary = Color(0xFF9CA3AF)
private val LightBorder = Color(0xFFE5E7EB)
private val LightBorderSubtle = Color(0xFFEEF2F6)
private val LightPrimaryContainer = Color(0xFFDCE8FF)
private val LightSecondaryContainer = Color(0xFFE7DEFA)
private val LightTertiaryContainer = Color(0xFFFFE1CC)

private val DarkBackground = TokenNearBlack
private val DarkSurface = TokenDarkCard
private val DarkSurfaceElevated = TokenDarkElevatedSurface
private val DarkTextPrimary = TokenWhite
private val DarkTextSecondary = TokenDarkSecondaryText
private val DarkTextTertiary = Color(0xFF8F8F8F)
private val DarkBorder = TokenDarkBorder
private val DarkBorderSubtle = Color(0xFF1A1A1A)
private val DarkPrimaryContainer = Color(0xFF1E3763)
private val DarkSecondaryContainer = Color(0xFF3A2863)
private val DarkTertiaryContainer = Color(0xFF5A3518)

private val LightBaseScheme = lightColorScheme(
    primary = LockedBlue,
    onPrimary = TokenWhite,
    primaryContainer = LightPrimaryContainer,
    onPrimaryContainer = LightTextPrimary,
    secondary = LockedPurple,
    onSecondary = TokenWhite,
    secondaryContainer = LightSecondaryContainer,
    onSecondaryContainer = LightTextPrimary,
    tertiary = LockedOrange,
    onTertiary = TokenWhite,
    tertiaryContainer = LightTertiaryContainer,
    onTertiaryContainer = LightTextPrimary,
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightSurfaceElevated,
    onSurfaceVariant = LightTextSecondary,
    error = LockedRed,
    onError = TokenWhite,
    outline = LightBorder,
    outlineVariant = LightBorderSubtle,
    inverseSurface = DarkSurface,
    inverseOnSurface = DarkTextPrimary
)

private val DefaultLightExtended = NFAExtendedColors(
    divider = LightBorder,
    cardBorder = LightBorder,
    mutedSurface = LightSurfaceElevated,
    elevatedSurface = LightSurfaceElevated,
    navContainerBorder = LightBorder,
    navSelectedSurface = LockedBlue.copy(alpha = 0.10f),
    transparent = Color.Transparent,
    primaryText = LightTextPrimary,
    actionFavorite = LockedRed,
    actionBookmark = LockedYellow,
    actionSilent = LockedOrange,
    actionHidden = LockedBlue,
    navIncidents = LockedBlue,
    navFavorites = LockedRed,
    navRoute = LockedGreen,
    navNotifications = LockedOrange,
    navChasers = LockedPurple,
    navChat = LockedBlue,
    navProfile = LockedYellow,
    neutralNav = LightTextSecondary,
    alertCritical = LockedRed,
    alertWarning = LockedYellow,
    alertInfo = LockedBlue,
    alertCriticalSurface = LockedRed.copy(alpha = 0.10f),
    mapPreviewSurface = LightSurface,
    mapPreviewOverlay = LightSurfaceElevated,
    mapPlaceholderIcon = LockedBlue,
    textSecondary = LightTextSecondary,
    textTertiary = LightTextTertiary
)

private val DarkBaseScheme = darkColorScheme(
    primary = LockedBlue,
    onPrimary = TokenWhite,
    primaryContainer = DarkPrimaryContainer,
    onPrimaryContainer = DarkTextPrimary,
    secondary = LockedPurple,
    onSecondary = TokenWhite,
    secondaryContainer = DarkSecondaryContainer,
    onSecondaryContainer = DarkTextPrimary,
    tertiary = LockedOrange,
    onTertiary = TokenWhite,
    tertiaryContainer = DarkTertiaryContainer,
    onTertiaryContainer = DarkTextPrimary,
    background = DarkBackground,
    onBackground = DarkTextPrimary,
    surface = DarkSurface,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkSurfaceElevated,
    onSurfaceVariant = DarkTextSecondary,
    error = LockedRed,
    onError = TokenWhite,
    outline = DarkBorder,
    outlineVariant = DarkBorderSubtle,
    inverseSurface = LightSurface,
    inverseOnSurface = LightTextPrimary
)

private val DarkExtended = NFAExtendedColors(
    divider = DarkBorder,
    cardBorder = DarkBorder,
    mutedSurface = DarkSurfaceElevated,
    elevatedSurface = DarkSurfaceElevated,
    navContainerBorder = DarkBorder,
    navSelectedSurface = LockedBlue.copy(alpha = 0.16f),
    transparent = Color.Transparent,
    primaryText = DarkTextPrimary,
    actionFavorite = LockedRed,
    actionBookmark = LockedYellow,
    actionSilent = LockedOrange,
    actionHidden = LockedBlue,
    navIncidents = LockedBlue,
    navFavorites = LockedRed,
    navRoute = LockedGreen,
    navNotifications = LockedOrange,
    navChasers = LockedPurple,
    navChat = LockedBlue,
    navProfile = LockedYellow,
    neutralNav = DarkTextSecondary,
    alertCritical = LockedRed,
    alertWarning = LockedYellow,
    alertInfo = LockedBlue,
    alertCriticalSurface = LockedRed.copy(alpha = 0.22f),
    mapPreviewSurface = DarkSurface,
    mapPreviewOverlay = DarkSurfaceElevated,
    mapPlaceholderIcon = LockedBlue,
    textSecondary = DarkTextSecondary,
    textTertiary = DarkTextTertiary
)

fun nfaRainbowAccentBrush(isDark: Boolean): Brush {
    val colors = listOf(
        LockedBlue,
        LockedPurple,
        LockedRed,
        LockedOrange,
        LockedYellow,
        LockedGreen
    ).map { color ->
        if (isDark) color.copy(alpha = 0.96f) else color.copy(alpha = 0.88f)
    }
    return Brush.horizontalGradient(colors)
}

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
