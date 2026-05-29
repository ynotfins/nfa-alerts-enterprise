package com.emergency.alerts.core.designsystem.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.NotificationsOff
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.emergency.alerts.core.designsystem.theme.NFATheme
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val HomeCardVerticalPadding = 8.dp
private val HomeCardTopRowGap = 6.dp
private val HomeCardRowToBodyGap = 2.dp
private val HomeCardIconTapTarget = 32.dp
private val HomeCardIconVisualSize = 18.dp
private val HomeCardDistanceMinWidth = 34.dp
private val HomeCardDistanceMaxWidth = 48.dp
private val HomeCardDateLineHeight = 14.sp
private val HomeCardBodyLineHeight = 18.sp

@Immutable
data class NFAIncidentCardData(
    val incidentId: String,
    val dateTimeMillis: Long,
    val distanceMiles: Double?,
    val inlineBodyText: String,
    val isUnread: Boolean,
    val updateCount: Int,
    val isFavorite: Boolean,
    val isBookmarked: Boolean,
    val isSilent: Boolean
)

@Composable
fun NFAIncidentCard(
    data: NFAIncidentCardData,
    onClick: () -> Unit,
    onFavoriteClick: () -> Unit,
    onBookmarkClick: () -> Unit,
    onSilentClick: () -> Unit,
    onHideClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val dateTimeLabel = rememberDateTimeLabel(
        dateTimeMillis = data.dateTimeMillis
    )
    val bodyColor = if (data.isUnread) {
        MaterialTheme.colorScheme.onSurface
    } else {
        NFATheme.colors.textSecondary
    }
    val updateIndicatorFraction = updateIndicatorFraction(data.updateCount)

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        color = MaterialTheme.colorScheme.surface,
        shape = NFATheme.shapes.card,
        shadowElevation = NFATheme.elevation.card,
        tonalElevation = NFATheme.elevation.none,
        border = BorderStroke(1.dp, NFATheme.colors.cardBorder)
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(IntrinsicSize.Min)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .width(NFATheme.spacing.xs),
                    contentAlignment = Alignment.Center
                ) {
                    if (updateIndicatorFraction > 0f) {
                        Box(
                            modifier = Modifier
                                .fillMaxHeight(updateIndicatorFraction)
                                .width(NFATheme.spacing.xxs)
                                .background(NFATheme.colors.accentBlue)
                        )
                    }
                }

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(
                            horizontal = NFATheme.spacing.cardHorizontal,
                            vertical = HomeCardVerticalPadding
                        ),
                    verticalArrangement = Arrangement.spacedBy(HomeCardRowToBodyGap)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(HomeCardTopRowGap),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            modifier = Modifier.weight(1f),
                            horizontalArrangement = Arrangement.spacedBy(HomeCardTopRowGap),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = dateTimeLabel,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    lineHeight = HomeCardDateLineHeight
                                ),
                                color = MaterialTheme.colorScheme.onSurface,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            NFADistanceLabel(
                                distanceMiles = data.distanceMiles,
                                modifier = Modifier
                                    .width(HomeCardDistanceMaxWidth)
                                    .heightIn(min = HomeCardIconVisualSize)
                            )
                        }

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(
                                HomeCardTopRowGap,
                                Alignment.End
                            ),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            CardActionIcon(
                                active = data.isFavorite,
                                tint = NFATheme.colors.actionFavorite,
                                activeIcon = Icons.Default.Favorite,
                                inactiveIcon = Icons.Default.FavoriteBorder,
                                contentDescription = "Favorite alert",
                                onClick = onFavoriteClick
                            )
                            CardActionIcon(
                                active = data.isBookmarked,
                                tint = NFATheme.colors.actionBookmark,
                                activeIcon = Icons.Default.Bookmark,
                                inactiveIcon = Icons.Default.BookmarkBorder,
                                contentDescription = "Bookmark alert",
                                onClick = onBookmarkClick
                            )
                            CardActionIcon(
                                active = data.isSilent,
                                tint = NFATheme.colors.actionSilent,
                                activeIcon = Icons.Default.NotificationsOff,
                                inactiveIcon = Icons.Default.Notifications,
                                contentDescription = "Silence notifications for this alert",
                                onClick = onSilentClick
                            )
                            CardActionIcon(
                                active = false,
                                tint = NFATheme.colors.actionHidden,
                                activeIcon = Icons.Default.VisibilityOff,
                                inactiveIcon = Icons.Default.VisibilityOff,
                                contentDescription = "Hide alert from Home",
                                onClick = onHideClick
                            )
                        }
                    }

                    Text(
                        text = data.inlineBodyText,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            lineHeight = HomeCardBodyLineHeight
                        ),
                        color = bodyColor,
                        fontWeight = FontWeight.Normal,
                        maxLines = 7,
                        overflow = TextOverflow.Ellipsis
                    )

                }
            }

            HorizontalDivider(
                modifier = Modifier.padding(
                    start = NFATheme.spacing.dividerInset,
                    end = NFATheme.spacing.dividerInset,
                    bottom = NFATheme.spacing.xs
                ),
                thickness = 1.dp,
                color = NFATheme.colors.divider
            )
        }
    }
}

private fun rememberDateTimeLabel(
    dateTimeMillis: Long
): String {
    val formatter = SimpleDateFormat("MM/dd/yy hh:mm a", Locale.getDefault())
    return formatter.format(Date(dateTimeMillis))
}

private fun updateIndicatorFraction(updateCount: Int): Float {
    if (updateCount <= 0) return 0f
    return (updateCount.coerceAtMost(5).toFloat() / 5f)
}

@Composable
private fun CardActionIcon(
    active: Boolean,
    tint: androidx.compose.ui.graphics.Color,
    activeIcon: androidx.compose.ui.graphics.vector.ImageVector,
    inactiveIcon: androidx.compose.ui.graphics.vector.ImageVector,
    contentDescription: String,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .size(HomeCardIconTapTarget)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        androidx.compose.material3.Icon(
            imageVector = if (active) activeIcon else inactiveIcon,
            contentDescription = contentDescription,
            tint = if (active) tint else tint.copy(alpha = 0.88f),
            modifier = Modifier.size(HomeCardIconVisualSize)
        )
    }
}
