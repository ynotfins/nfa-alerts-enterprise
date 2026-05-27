@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class, androidx.compose.foundation.layout.ExperimentalLayoutApi::class)

package com.emergency.alerts.feature.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import com.emergency.alerts.core.designsystem.theme.NFATheme
import com.emergency.alerts.domain.model.HighAlertConfig
import com.emergency.alerts.domain.model.HomeDistanceFilterOption
import com.emergency.alerts.domain.model.HomeFeedFilters
import com.emergency.alerts.domain.model.HomeUpdateFilterOption

@Composable
fun HomeFeedFilterSheet(
    filters: HomeFeedFilters,
    highAlertConfig: HighAlertConfig,
    options: HomeFeedFilterOptions,
    onDismiss: () -> Unit,
    onFiltersChange: (HomeFeedFilters) -> Unit,
    onHighAlertConfigChange: (HighAlertConfig) -> Unit
) {
    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = NFATheme.spacing.screenHorizontal)
                .padding(bottom = NFATheme.spacing.xxl),
            verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.md)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Home filters",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.Bold
                )
                TextButton(onClick = {
                    onFiltersChange(HomeFeedFilters())
                    onHighAlertConfigChange(HighAlertConfig())
                }) {
                    Text("Clear all")
                }
            }

            OutlinedTextField(
                value = filters.keywordQuery,
                onValueChange = { onFiltersChange(filters.copy(keywordQuery = it)) },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Keyword search") },
                supportingText = {
                    Text("Searches state, county, city, address, type, message, department code, and alert ID.")
                },
                singleLine = true
            )

            FilterSection(title = "Alert type") {
                SelectableChipGroup(
                    options = options.alertTypes,
                    selected = filters.selectedAlertTypes,
                    onToggle = { alertType ->
                        onFiltersChange(
                            filters.copy(
                                selectedAlertTypes = filters.selectedAlertTypes.toggle(alertType)
                            )
                        )
                    }
                )
            }

            FilterSection(title = "Distance") {
                SingleSelectChipGroup(
                    options = HomeDistanceFilterOption.entries,
                    selected = filters.distanceFilter,
                    label = { it.label },
                    onSelected = { onFiltersChange(filters.copy(distanceFilter = it)) }
                )
            }

            FilterSection(title = "Updates") {
                SingleSelectChipGroup(
                    options = HomeUpdateFilterOption.entries,
                    selected = filters.updateFilter,
                    label = { it.label },
                    onSelected = { onFiltersChange(filters.copy(updateFilter = it)) }
                )
            }

            FilterSection(title = "Department code") {
                SelectableChipGroup(
                    options = options.departmentCodes,
                    selected = filters.selectedDepartmentCodes,
                    onToggle = { department ->
                        onFiltersChange(
                            filters.copy(
                                selectedDepartmentCodes = filters.selectedDepartmentCodes.toggle(department)
                            )
                        )
                    }
                )
            }

            FilterSection(title = "High Alert") {
                ToggleRow(
                    title = "High Alert enabled",
                    subtitle = "Scaffolds future high-priority alert behavior without bypassing OS restrictions.",
                    checked = highAlertConfig.enabled,
                    onCheckedChange = { onHighAlertConfigChange(highAlertConfig.copy(enabled = it)) }
                )
                ToggleRow(
                    title = "Show only High Alert matches",
                    subtitle = "Uses the High Alert criteria below as a local Home filter.",
                    checked = filters.highAlertOnly,
                    onCheckedChange = { onFiltersChange(filters.copy(highAlertOnly = it)) }
                )
                ToggleRow(
                    title = "Vibration",
                    subtitle = "Planning scaffold for future notification pattern handling.",
                    checked = highAlertConfig.vibrationEnabled,
                    onCheckedChange = {
                        onHighAlertConfigChange(highAlertConfig.copy(vibrationEnabled = it))
                    }
                )
                ToggleRow(
                    title = "Siren",
                    subtitle = "Scaffold only. Android volume and DND limitations still apply.",
                    checked = highAlertConfig.sirenEnabled,
                    onCheckedChange = {
                        onHighAlertConfigChange(highAlertConfig.copy(sirenEnabled = it))
                    }
                )
                ToggleRow(
                    title = "Flashlight / strobe",
                    subtitle = "Scaffold only. Requires hardware support and foreground-safe execution later.",
                    checked = highAlertConfig.flashlightStrobeEnabled,
                    onCheckedChange = {
                        onHighAlertConfigChange(highAlertConfig.copy(flashlightStrobeEnabled = it))
                    }
                )
                OutlinedTextField(
                    value = highAlertConfig.selectedKeywords.joinToString(", "),
                    onValueChange = {
                        onHighAlertConfigChange(
                            highAlertConfig.copy(
                                selectedKeywords = it.csvTokens()
                            )
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("High Alert keywords") },
                    supportingText = {
                        Text("Comma-separated planning keywords for future notification matching.")
                    }
                )
                Row(
                    horizontalArrangement = Arrangement.spacedBy(NFATheme.spacing.sm)
                ) {
                    OutlinedTextField(
                        value = highAlertConfig.maxDistanceMiles?.toString().orEmpty(),
                        onValueChange = {
                            onHighAlertConfigChange(
                                highAlertConfig.copy(
                                    maxDistanceMiles = it.toIntOrNull()
                                )
                            )
                        },
                        modifier = Modifier.weight(1f),
                        label = { Text("Max distance") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = highAlertConfig.minUpdateCount.toString(),
                        onValueChange = {
                            onHighAlertConfigChange(
                                highAlertConfig.copy(
                                    minUpdateCount = it.toIntOrNull()?.coerceAtLeast(0) ?: 0
                                )
                            )
                        },
                        modifier = Modifier.weight(1f),
                        label = { Text("Min updates") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true
                    )
                }
                Text(
                    text = "High Alert type match",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.SemiBold
                )
                SelectableChipGroup(
                    options = options.alertTypes,
                    selected = highAlertConfig.selectedAlertTypes,
                    onToggle = { alertType ->
                        onHighAlertConfigChange(
                            highAlertConfig.copy(
                                selectedAlertTypes = highAlertConfig.selectedAlertTypes.toggle(alertType)
                            )
                        )
                    }
                )
                Text(
                    text = "High Alert department match",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.SemiBold
                )
                SelectableChipGroup(
                    options = options.departmentCodes,
                    selected = highAlertConfig.selectedDepartments,
                    onToggle = { department ->
                        onHighAlertConfigChange(
                            highAlertConfig.copy(
                                selectedDepartments = highAlertConfig.selectedDepartments.toggle(department)
                            )
                        )
                    }
                )
            }
        }
    }
}

@Composable
private fun FilterSection(
    title: String,
    content: @Composable () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.sm)) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.SemiBold
        )
        content()
    }
}

@Composable
private fun SelectableChipGroup(
    options: List<String>,
    selected: Set<String>,
    onToggle: (String) -> Unit
) {
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(NFATheme.spacing.xs),
        verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.xs)
    ) {
        options.forEach { option ->
            FilterChip(
                selected = option in selected,
                onClick = { onToggle(option) },
                label = { Text(option) }
            )
        }
    }
}

@Composable
private fun <T> SingleSelectChipGroup(
    options: List<T>,
    selected: T,
    label: (T) -> String,
    onSelected: (T) -> Unit
) {
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(NFATheme.spacing.xs),
        verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.xs)
    ) {
        options.forEach { option ->
            FilterChip(
                selected = option == selected,
                onClick = { onSelected(option) },
                label = { Text(label(option)) }
            )
        }
    }
}

@Composable
private fun ToggleRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier.weight(1f).padding(end = NFATheme.spacing.md),
            verticalArrangement = Arrangement.spacedBy(NFATheme.spacing.xxs)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = NFATheme.colors.textSecondary
            )
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

private fun Set<String>.toggle(value: String): Set<String> {
    return toMutableSet().apply {
        if (!add(value)) remove(value)
    }
}

private fun String.csvTokens(): Set<String> {
    return split(',')
        .map { it.trim() }
        .filter { it.isNotBlank() }
        .toSet()
}
