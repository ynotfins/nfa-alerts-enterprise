package com.emergency.alerts.domain.repository

import com.emergency.alerts.core.result.Result
import com.emergency.alerts.domain.model.Incident
import com.emergency.alerts.domain.model.IncidentActivity
import com.emergency.alerts.domain.model.Note
import com.emergency.alerts.domain.model.UserIncidentFlag
import kotlinx.coroutines.flow.Flow

interface IncidentRepository {
    fun observeHomeIncidents(activeOnly: Boolean = true): Flow<Result<List<Incident>>>
    fun observeIncident(incidentId: String): Flow<Result<Incident?>>
    fun observeUserFlags(userId: String): Flow<Result<List<UserIncidentFlag>>>
    fun observeIncidentNotes(incidentId: String): Flow<Result<List<Note>>>
    fun observeIncidentActivities(incidentId: String): Flow<Result<List<IncidentActivity>>>
    suspend fun respondToIncident(incidentId: String): Result<Unit>
    suspend fun addNote(incidentId: String, text: String): Result<Unit>
    suspend fun toggleUserIncidentAction(incidentId: String, action: String): Result<Unit>
}
