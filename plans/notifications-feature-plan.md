# Notifications Feature — Plan

## Context

This is a follow-up to the **favorites feature** (PR: `feature/favorites`). When a user adds an instructor to favorites, the instructor should receive a notification. Currently, only a toast is shown to the user who clicked the heart — the instructor knows nothing about it.

## Goal

Add a general-purpose notification system, starting with **favorite notifications** as the first use case. The system should be extensible for future notification types (e.g., new booking, new review, booking cancelled).

## Requirements

### Backend

1. **Prisma model `Notification`**:
   - `id` (UUID, PK)
   - `userId` (string, FK → User) — who receives the notification
   - `type` (enum: `FAVORITE`, `NEW_BOOKING`, `NEW_REVIEW`, `BOOKING_CANCELLED`, etc.)
   - `title` (string) — localized or raw title
   - `message` (string) — localized or raw message
   - `data` (JSON, nullable) — payload for deep linking (e.g., `{ instructorProfileId: "..." }`)
   - `read` (boolean, default false)
   - `createdAt` (DateTime)
   - Index on `[userId, read, createdAt]`

2. **`NotificationsModule`** (NestJS):
   - `NotificationsService`:
     - `createNotification(dto: CreateNotificationDto)` — creates a notification
     - `getMyNotifications(userId)` — returns paginated notifications for current user
     - `markAsRead(notificationId, userId)` — marks single notification as read
     - `markAllAsRead(userId)` — marks all as read
     - `getUnreadCount(userId)` — returns count of unread notifications
   - `NotificationsController`:
     - `GET /notifications` — get my notifications (paginated)
     - `GET /notifications/unread-count` — get unread count
     - `PATCH /notifications/:id/read` — mark as read
     - `PATCH /notifications/read-all` — mark all as read

3. **Integration with FavoritesService**:
   - In `FavoritesService.addFavorite()`, after successful upsert, call `NotificationsService.createNotification()` for the instructor profile owner
   - The notification should include: `type: "FAVORITE"`, `title/message` with the user's name, `data: { instructorProfileId, userId }`

### Frontend

1. **`useNotifications` hook** (React Query):
   - `useMyNotifications()` — `GET /notifications`
   - `useUnreadCount()` — `GET /notifications/unread-count`
   - `useMarkAsRead()` — `PATCH /notifications/:id/read`
   - `useMarkAllAsRead()` — `PATCH /notifications/read-all`

2. **Notification bell in `UserMenu`** ([`frontend/src/components/layout/user-menu.tsx`](frontend/src/components/layout/user-menu.tsx)):
   - Currently shows booking and review notifications via `useMyBookings` + `usePendingReviews`
   - Add a new section for system notifications (favorites, etc.)
   - Show unread count badge on the bell icon
   - Clicking a notification should mark it as read and navigate to relevant page

3. **Types**:
   - `Notification` interface in [`frontend/src/types/index.ts`](frontend/src/types/index.ts):
     ```ts
     interface Notification {
       id: string;
       type: NotificationType;
       title: string;
       message: string;
       data?: Record<string, any>;
       read: boolean;
       createdAt: string;
     }
     type NotificationType =
       | "FAVORITE"
       | "NEW_BOOKING"
       | "NEW_REVIEW"
       | "BOOKING_CANCELLED";
     ```

### i18n

- Add `Notifications` namespace in both [`en.json`](frontend/messages/en.json) and [`pl.json`](frontend/messages/pl.json)
- Keys: `favoriteTitle`, `favoriteMessage`, `markAsRead`, `markAllAsRead`, `noNotifications`, `unread`

## Files to Create

- `backend/prisma/migrations/..._add_notifications_model/migration.sql`
- `backend/src/notifications/notifications.module.ts`
- `backend/src/notifications/notifications.controller.ts`
- `backend/src/notifications/notifications.service.ts`
- `backend/src/notifications/dto/create-notification.dto.ts`
- `frontend/src/hooks/useNotifications.ts`
- `frontend/src/components/notifications/NotificationList.tsx` (optional, could be inline in user-menu)

## Files to Modify

- `backend/prisma/schema.prisma` — add Notification model + relation on User
- `backend/src/app.module.ts` — add NotificationsModule
- `backend/src/favorites/favorites.service.ts` — inject NotificationsService, call createNotification on addFavorite
- `frontend/src/components/layout/user-menu.tsx` — integrate notifications
- `frontend/src/types/index.ts` — add Notification types
- `frontend/messages/en.json` — add Notifications namespace
- `frontend/messages/pl.json` — add Notifications namespace

## Notes

- The existing notification bell in `user-menu.tsx` currently uses a polling-like approach with `useMyBookings` and `usePendingReviews`. The new system notifications should be **separate** from booking/review notifications to avoid breaking existing functionality.
- Consider using React Query's `refetchInterval` for polling unread count (e.g., every 30s).
- No email/push notifications for now — only in-app.
