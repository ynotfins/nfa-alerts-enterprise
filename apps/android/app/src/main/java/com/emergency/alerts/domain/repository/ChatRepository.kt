package com.emergency.alerts.domain.repository

import com.emergency.alerts.core.result.Result
import com.emergency.alerts.domain.model.Message
import com.emergency.alerts.domain.model.Thread
import kotlinx.coroutines.flow.Flow

interface ChatRepository {
    fun observeUserThreads(userId: String): Flow<Result<List<Thread>>>
    fun observeThreadMessages(threadId: String, limit: Long = 50): Flow<Result<List<Message>>>
    suspend fun sendMessage(threadId: String, text: String): Result<Unit>
    suspend fun markAsRead(threadId: String): Result<Unit>
}
