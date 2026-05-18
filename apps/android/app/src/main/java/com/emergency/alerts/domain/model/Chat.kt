package com.emergency.alerts.domain.model

data class Thread(
    val id: String,
    val type: String,
    val participants: List<String>,
    val chaserIds: List<String>,
    val lastMessage: String?,
    val lastMessageAt: Long?,
    val lastMessageSenderId: String?,
    val typingUsers: List<String>,
    val createdAt: Long,
    val updatedAt: Long
)

data class Message(
    val id: String,
    val senderId: String,
    val text: String,
    val readBy: List<String>,
    val replyTo: String?,
    val createdAt: Long
)
