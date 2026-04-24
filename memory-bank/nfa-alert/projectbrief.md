# Project Brief

## Overview

**National Fire Alerts (NFA)** - Emergency response coordination platform connecting supervisors (Supes) with field responders (Chasers) for organizations like Miami-Dade Fire Rescue.

## Core Requirements

### Business Goals
- Real-time incident management and coordination
- Location tracking for field responders
- Secure communication between Supes and Chasers
- Document management and digital signing
- Push notifications for new incidents

### User Roles
| Role | Responsibilities |
|------|------------------|
| **Chaser** | View/respond to incidents, chat with supes, upload documents |
| **Supe** | Manage chasers, award secured status, view all chats, close incidents |
| **Admin** | User management, location management, system configuration |

### Key Features
1. **Incident Management** - CRUD, filtering, favorites/bookmarks, hide/mute
2. **Real-time Chat** - Direct messaging, chaser-to-supes threads
3. **Document Flow** - Upload photos/PDFs, capture signatures, generate signed docs
4. **Route Planning** - Nearest-neighbor algorithm for responded incidents
5. **Push Notifications** - Web push for new incidents and messages
6. **PWA** - Installable mobile-first web app (max 448px)

## Success Criteria
- Sub-second real-time updates
- 100% mobile-responsive UI
- Offline-capable PWA
- Secure role-based access
- Reliable push notifications

## Constraints
- Mobile-first design (max 448px viewport)
- Web-only (NOT React Native)
- Firebase ecosystem (Firestore, Auth, Storage)
- PWA installation required for full access


