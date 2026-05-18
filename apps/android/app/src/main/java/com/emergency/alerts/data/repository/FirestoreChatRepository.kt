package com.emergency.alerts.data.repository

import com.emergency.alerts.core.result.Result
import com.emergency.alerts.data.firestore.dto.MessageDto
import com.emergency.alerts.data.firestore.dto.ThreadDto
import com.emergency.alerts.data.mapper.toDomain
import com.emergency.alerts.domain.model.Message
import com.emergency.alerts.domain.model.Thread
import com.emergency.alerts.domain.repository.AuthRepository
import com.emergency.alerts.domain.repository.ChatRepository
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
@Suppress("TooGenericExceptionCaught")
class FirestoreChatRepository @Inject constructor(
    private val firestore: FirebaseFirestore,
    private val authRepository: AuthRepository,
) : ChatRepository {

    companion object {
        private const val DEFAULT_LIMIT = 50L
    }

    override fun observeUserThreads(userId: String): Flow<Result<List<Thread>>> = callbackFlow {
        val listener = firestore.collection("threads")
            .whereArrayContains("participants", userId)
            .orderBy("lastMessageAt", Query.Direction.DESCENDING)
            .limit(DEFAULT_LIMIT)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Timber.e(error, "Error fetching threads for user $userId")
                    trySend(Result.Error(error))
                    return@addSnapshotListener
                }

                if (snapshot != null) {
                    val threads = snapshot.documents.mapNotNull { doc ->
                        doc.toObject(ThreadDto::class.java)?.toDomain(doc.id)
                    }
                    trySend(Result.Success(threads))
                }
            }

        awaitClose { listener.remove() }
    }

    override fun observeThreadMessages(threadId: String, limit: Long): Flow<Result<List<Message>>> = callbackFlow {
        val listener = firestore.collection("threads").document(threadId).collection("messages")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(limit)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Timber.e(error, "Error fetching messages for thread $threadId")
                    trySend(Result.Error(error))
                    return@addSnapshotListener
                }

                if (snapshot != null) {
                    // Chat messages are typically displayed bottom-up (newest at bottom), so reversing might be needed.
                    val messages = snapshot.documents.mapNotNull { doc ->
                        doc.toObject(MessageDto::class.java)?.toDomain(doc.id)
                    }.reversed()
                    trySend(Result.Success(messages))
                }
            }

        awaitClose { listener.remove() }
    }

    override suspend fun sendMessage(threadId: String, text: String): Result<Unit> {
        return try {
            val userId = authRepository.currentUserId ?: error("Not authenticated")
            val messageRef = firestore.collection("threads").document(threadId).collection("messages").document()
            
            val messageDto = MessageDto(
                senderId = userId,
                text = text,
                readBy = listOf(userId),
                createdAt = System.currentTimeMillis()
            )
            
            // In a real app we'd use a batched write to update the parent thread's lastMessage fields as well
            messageRef.set(messageDto).addOnFailureListener {
                throw it
            }
            Result.Success(Unit)
        } catch (e: Exception) {
            Timber.e(e, "Failed to send message")
            Result.Error(e)
        }
    }

    override suspend fun markAsRead(threadId: String): Result<Unit> {
        return try {
            // Placeholder: Need to batch update unread messages or just use the backend function
            Result.Success(Unit)
        } catch (e: Exception) {
            Timber.e(e, "Failed to mark as read")
            Result.Error(e)
        }
    }
}
