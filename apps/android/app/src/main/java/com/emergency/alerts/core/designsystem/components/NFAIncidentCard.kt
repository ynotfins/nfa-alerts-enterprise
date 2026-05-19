package com.emergency.alerts.core.designsystem.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
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

@Immutable
data class NFAIncidentCardData(
    val incidentId: String,
    val savedAtMillis: Long,
    val distanceMiles: Double?,
    val state: String,
    val county: String?,
    val city: String,
    val address: String,
    val alertType: String,
    val alertMessage: String,
    val departmentCode: String?,
    val alertId: String?,
    val severityLabel: String?,
    val isImportant: Boolean
)

@Composable
fun NFAIncidentCard(
    data: NFAIncidentCardData,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val timeString = rememberSavedTime(data.savedAtMillis)
    val bodyLines = buildList {
        add(data.state)
        data.county?.takeIf { it.isNotBlank() }?.let(::add)
        data.city.takeIf { it.isNotBlank() }?.let(::add)
        data.address.takeIf { it.isNotBlank() }?.let(::add)
        add(data.alertType)
        data.alertMessage.takeIf { it.isNotBlank() }?.let(::add)
        data.departmentCode?.takeIf { it.isNotBlank() }?.let(::add)
        data.alertId?.takeIf { it.isNotBlank() }?.let { add(it) }
    }.joinToString(separator = "\n")

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
                        .width(NFATheme.spacing.xxs)
                        .background(
                            if (data.isImportant) {
                                NFATheme.colors.accentBlue
                            } else {
                                NFATheme.colors.divider
                            }
                        )
                )

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(
                            horizontal = NFATheme.spacing.cardHorizontal,
                            vertical = NFATheme.spacing.cardVertical
                        ),
                    verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.metadataGap)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = timeString,
                            style = MaterialTheme.typography.bodySmall,
                            color = NFATheme.colors.textSecondary,
                            fontWeight = FontWeight.SemiBold
                        )
                        NFADistanceLabel(
                            distanceMiles = data.distanceMiles,
                            modifier = Modifier.width(58.dp)
                        )
                    }

                    Text(
                        text = bodyLines,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            lineHeight = 19.sp
                        ),
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 7,
                        overflow = TextOverflow.Ellipsis
                    )

                    if (!data.severityLabel.isNullOrBlank()) {
                        NFASeverityBadge(label = data.severityLabel)
                    }
                }

                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .padding(
                            end = NFATheme.spacing.md,
                            top = NFATheme.spacing.cardVertical,
                            bottom = NFATheme.spacing.cardVertical
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    NFAIconButton(
                        icon = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                        contentDescription = "View incident details",
                        onClick = onClick,
                        tint = NFATheme.colors.textSecondary,
                        containerColor = NFATheme.colors.mutedSurface,
                        borderColor = NFATheme.colors.cardBorder,
                        size = 40
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

@Composable
private fun rememberSavedTime(savedAtMillis: Long): String {
    val formatter = SimpleDateFormat("MM/dd/yy hh:mm a", Locale.getDefault())
    return formatter.format(Date(savedAtMillis))
}
