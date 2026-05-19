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
    val route: Color,
    val notifications: Color,
    val neutralNav: Color,
    val severityCritical: Color,
    val severityWarning: Color,
    val severityInfo: Color,
    val severityCriticalSurface: Color,
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

private val LightBaseScheme = lightColorScheme(
    primary = Color(0xFF1A73E8),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFD9E9FF),
    onPrimaryContainer = Color(0xFF0D3E80),
    secondary = Color(0xFF5A6B85),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFE8EEF8),
    onSecondaryContainer = Color(0xFF243447),
    tertiary = Color(0xFF4A90E2),
    onTertiary = Color(0xFFFFFFFF),
    background = Color(0xFFF7F9FC),
    onBackground = Color(0xFF0F172A),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF0F172A),
    surfaceVariant = Color(0xFFF7F9FC),
    onSurfaceVariant = Color(0xFF667085),
    error = Color(0xFFB3261E),
    onError = Color(0xFFFFFFFF),
    outline = Color(0xFFE5E7EB),
    outlineVariant = Color(0xFFEEF2F6),
    inverseSurface = Color(0xFF0F172A),
    inverseOnSurface = Color(0xFFF8FAFC)
)

private val DefaultLightExtended = NFAExtendedColors(
    divider = Color(0xFFE7ECF2),
    cardBorder = Color(0xFFEDF1F6),
    mutedSurface = Color(0xFFF4F7FB),
    navContainerBorder = Color(0xFFE9EEF5),
    navSelectedSurface = Color(0xFFE8F1FF),
    accentBlue = Color(0xFF1A73E8),
    favorite = Color(0xFFE85175),
    route = Color(0xFF35A46B),
    notifications = Color(0xFFF59E0B),
    neutralNav = Color(0xFF6B7280),
    severityCritical = Color(0xFFCF3A32),
    severityWarning = Color(0xFFB97804),
    severityInfo = Color(0xFF225CE7),
    severityCriticalSurface = Color(0xFFFFEFED),
    textSecondary = Color(0xFF667085),
    textTertiary = Color(0xFF98A2B3)
)

private val DarkBaseScheme = darkColorScheme(
    primary = Color(0xFF8AB4F8),
    onPrimary = Color(0xFF0F2545),
    primaryContainer = Color(0xFF163B6F),
    onPrimaryContainer = Color(0xFFD9E9FF),
    secondary = Color(0xFFB8C5D6),
    onSecondary = Color(0xFF1E293B),
    secondaryContainer = Color(0xFF2A3647),
    onSecondaryContainer = Color(0xFFE2E8F0),
    tertiary = Color(0xFF9BC7FF),
    onTertiary = Color(0xFF0B294D),
    background = Color(0xFF09111F),
    onBackground = Color(0xFFF8FAFC),
    surface = Color(0xFF101B2D),
    onSurface = Color(0xFFF8FAFC),
    surfaceVariant = Color(0xFF172338),
    onSurfaceVariant = Color(0xFFA7B4C6),
    error = Color(0xFFF2B8B5),
    onError = Color(0xFF601410),
    outline = Color(0xFF283548),
    outlineVariant = Color(0xFF1C2738),
    inverseSurface = Color(0xFFF8FAFC),
    inverseOnSurface = Color(0xFF0F172A)
)

private val DarkExtended = NFAExtendedColors(
    divider = Color(0xFF233144),
    cardBorder = Color(0xFF223248),
    mutedSurface = Color(0xFF172338),
    navContainerBorder = Color(0xFF223146),
    navSelectedSurface = Color(0xFF1B3154),
    accentBlue = Color(0xFF8AB4F8),
    favorite = Color(0xFFFF8DA8),
    route = Color(0xFF65D28C),
    notifications = Color(0xFFF9C74F),
    neutralNav = Color(0xFF9AA6B2),
    severityCritical = Color(0xFFFF867F),
    severityWarning = Color(0xFFFAC858),
    severityInfo = Color(0xFF8AB4F8),
    severityCriticalSurface = Color(0xFF4B1E21),
    textSecondary = Color(0xFFB6C2CF),
    textTertiary = Color(0xFF8B9AAF)
)

private fun highContrastLightScheme() = lightColorScheme(
    primary = Color(0xFF0047FF),
    onPrimary = Color.White,
    secondary = Color(0xFF111827),
    onSecondary = Color.White,
    tertiary = Color(0xFF005BBB),
    onTertiary = Color.White,
    background = Color.White,
    onBackground = Color.Black,
    surface = Color.White,
    onSurface = Color.Black,
    surfaceVariant = Color(0xFFF5F5F5),
    onSurfaceVariant = Color(0xFF202020),
    error = Color(0xFFB00020),
    onError = Color.White,
    outline = Color.Black,
    outlineVariant = Color(0xFFB9B9B9)
)

private val HighContrastExtended = NFAExtendedColors(
    divider = Color(0xFFBDBDBD),
    cardBorder = Color.Black,
    mutedSurface = Color(0xFFF5F5F5),
    navContainerBorder = Color.Black,
    navSelectedSurface = Color(0xFFDCE8FF),
    accentBlue = Color(0xFF0047FF),
    favorite = Color(0xFFC40043),
    route = Color(0xFF008A3D),
    notifications = Color(0xFFBD7A00),
    neutralNav = Color(0xFF1F2937),
    severityCritical = Color(0xFFB00020),
    severityWarning = Color(0xFF9A6700),
    severityInfo = Color(0xFF0047FF),
    severityCriticalSurface = Color(0xFFFFE3E6),
    textSecondary = Color(0xFF222222),
    textTertiary = Color(0xFF525252)
)

fun nfaPaletteForPreset(presetName: String, isDark: Boolean): NFAThemePalette {
    return when (presetName) {
        "classic_blue" -> {
            val scheme = if (isDark) {
                DarkBaseScheme.copy(
                    primary = Color(0xFF9CC2FF),
                    secondary = Color(0xFFC5D4F2),
                    tertiary = Color(0xFF7CAAF2)
                )
            } else {
                LightBaseScheme.copy(
                    primary = Color(0xFF2257D9),
                    primaryContainer = Color(0xFFDCE6FF),
                    secondary = Color(0xFF48638C),
                    tertiary = Color(0xFF477DFF)
                )
            }
            NFAThemePalette(
                name = "Classic Blue",
                colorScheme = scheme,
                extended = if (isDark) {
                    DarkExtended.copy(accentBlue = Color(0xFF9CC2FF))
                } else {
                    DefaultLightExtended.copy(
                        accentBlue = Color(0xFF2257D9),
                        navSelectedSurface = Color(0xFFE4ECFF)
                    )
                },
                isDark = isDark
            )
        }

        "executive_dark" -> {
            val scheme = DarkBaseScheme.copy(
                primary = Color(0xFFAEC8FF),
                background = Color(0xFF060B14),
                surface = Color(0xFF0F1828),
                surfaceVariant = Color(0xFF111D30)
            )
            NFAThemePalette(
                name = "Executive Dark",
                colorScheme = scheme,
                extended = DarkExtended.copy(
                    divider = Color(0xFF202E40),
                    cardBorder = Color(0xFF203046),
                    navContainerBorder = Color(0xFF203046),
                    neutralNav = Color(0xFFA9B5C4)
                ),
                isDark = true
            )
        }

        "high_contrast" -> NFAThemePalette(
            name = "High Contrast",
            colorScheme = if (isDark) {
                DarkBaseScheme.copy(
                    primary = Color(0xFFFFFFFF),
                    onPrimary = Color.Black,
                    background = Color.Black,
                    onBackground = Color.White,
                    surface = Color(0xFF090909),
                    onSurface = Color.White,
                    outline = Color.White
                )
            } else {
                highContrastLightScheme()
            },
            extended = if (isDark) {
                HighContrastExtended.copy(
                    divider = Color.White,
                    cardBorder = Color.White,
                    mutedSurface = Color(0xFF151515),
                    navContainerBorder = Color.White,
                    neutralNav = Color.White,
                    textSecondary = Color(0xFFE5E5E5),
                    textTertiary = Color(0xFFCACACA)
                )
            } else {
                HighContrastExtended
            },
            isDark = isDark
        )

        "firehouse" -> {
            val scheme = if (isDark) {
                DarkBaseScheme.copy(
                    primary = Color(0xFFFF9B8C),
                    primaryContainer = Color(0xFF5A1E18),
                    tertiary = Color(0xFFFFB4A8)
                )
            } else {
                LightBaseScheme.copy(
                    primary = Color(0xFFC2410C),
                    primaryContainer = Color(0xFFFFE3D7),
                    tertiary = Color(0xFFEF4444)
                )
            }
            NFAThemePalette(
                name = "Firehouse",
                colorScheme = scheme,
                extended = if (isDark) {
                    DarkExtended.copy(accentBlue = Color(0xFFFF9B8C))
                } else {
                    DefaultLightExtended.copy(
                        accentBlue = Color(0xFFC2410C),
                        navSelectedSurface = Color(0xFFFFEEE5),
                        favorite = Color(0xFFDC2626)
                    )
                },
                isDark = isDark
            )
        }

        else -> NFAThemePalette(
            name = if (isDark) "NFA Dark" else "NFA Light",
            colorScheme = if (isDark) DarkBaseScheme else LightBaseScheme,
            extended = if (isDark) DarkExtended else DefaultLightExtended,
            isDark = isDark
        )
    }
}
