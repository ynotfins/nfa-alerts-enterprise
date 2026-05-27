package com.emergency.alerts.core.di

import com.emergency.alerts.data.repository.AndroidLocationRepository
import com.emergency.alerts.data.repository.DataStoreHomeFeedPreferencesRepository
import com.emergency.alerts.data.repository.DataStoreHomeFeedReadStateRepository
import com.emergency.alerts.data.repository.FirebaseAuthRepositoryImpl
import com.emergency.alerts.data.repository.FirestoreIncidentRepository
import com.emergency.alerts.domain.repository.AuthRepository
import com.emergency.alerts.domain.repository.HomeFeedPreferencesRepository
import com.emergency.alerts.domain.repository.HomeFeedReadStateRepository
import com.emergency.alerts.domain.repository.IncidentRepository
import com.emergency.alerts.domain.repository.LocationRepository
import com.emergency.alerts.domain.repository.ChatRepository
import com.emergency.alerts.data.repository.FirestoreChatRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        impl: FirebaseAuthRepositoryImpl
    ): AuthRepository

    @Binds
    @Singleton
    abstract fun bindIncidentRepository(
        impl: FirestoreIncidentRepository
    ): IncidentRepository

    @Binds
    @Singleton
    abstract fun bindLocationRepository(
        impl: AndroidLocationRepository
    ): LocationRepository

    @Binds
    @Singleton
    abstract fun bindHomeFeedReadStateRepository(
        impl: DataStoreHomeFeedReadStateRepository
    ): HomeFeedReadStateRepository

    @Binds
    @Singleton
    abstract fun bindHomeFeedPreferencesRepository(
        impl: DataStoreHomeFeedPreferencesRepository
    ): HomeFeedPreferencesRepository

    @Binds
    @Singleton
    abstract fun bindChatRepository(
        impl: FirestoreChatRepository
    ): ChatRepository
}
