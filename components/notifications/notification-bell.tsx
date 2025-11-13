"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { WebSocketService } from "@/lib/websocket"
import type { NotificationDto } from "@/lib/types"
import Link from "next/link"
import styles from "./notification-bell.module.css"

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load stored notifications
    loadNotifications()

    // Connect to WebSocket
    if (user) {
      const ws = WebSocketService.getInstance()
      const companyId = user.company?.id
      ws.connect(user.email, companyId)

      // Request notification permission
      WebSocketService.requestNotificationPermission()

      // Listen for new notifications
      const handleNotification = (event: CustomEvent<NotificationDto>) => {
        loadNotifications()
      }

      window.addEventListener("websocket-notification", handleNotification as EventListener)

      return () => {
        window.removeEventListener("websocket-notification", handleNotification as EventListener)
      }
    }
  }, [user])

  const loadNotifications = () => {
    const stored = WebSocketService.getStoredNotifications()
    setNotifications(stored)
    setUnreadCount(stored.filter((n) => !n.read).length)
  }

  const handleMarkAsRead = (id: string) => {
    WebSocketService.markAsRead(id)
    loadNotifications()
  }

  const handleMarkAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) {
        WebSocketService.markAsRead(n.id)
      }
    })
    loadNotifications()
  }

  const handleClearAll = () => {
    if (confirm("Clear all notifications?")) {
      WebSocketService.clearAll()
      loadNotifications()
      setIsOpen(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      APPLICATION_SUBMITTED: "📨",
      STATUS_CHANGED: "🔄",
      SHORTLISTED: "⭐",
      INTERVIEW_SCHEDULED: "📅",
      OFFER_RECEIVED: "💼",
      APPLICATION_ACCEPTED: "✅",
      APPLICATION_REJECTED: "❌",
      NEW_APPLICATION: "📨",
      COMPANY_APPROVED: "✅",
      COMPANY_REJECTED: "❌",
      VACANCY_APPROVED: "✅",
      VACANCY_REJECTED: "❌",
    }
    return icons[type] || "🔔"
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown}>
            {/* Header */}
            <div className={styles.header}>
              <h3 className={styles.title}>Notifications</h3>
              <div className={styles.headerActions}>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} className={styles.actionLink}>
                    Mark all read
                  </button>
                )}
                <button onClick={handleClearAll} className={styles.actionLink}>
                  Clear all
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className={styles.notificationsList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyIcon}>🔔</p>
                  <p className={styles.emptyText}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${styles.notificationItem} ${!notification.read ? styles.unread : ""}`}
                    onClick={() => {
                      handleMarkAsRead(notification.id)
                      if (notification.link) {
                        setIsOpen(false)
                      }
                    }}
                  >
                    {!notification.read && <div className={styles.unreadDot} />}
                    <div className={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className={styles.notificationContent}>
                      <p className={styles.notificationTitle}>{notification.title}</p>
                      <p className={styles.notificationMessage}>{notification.message}</p>
                      <p className={styles.notificationTime}>{formatTime(notification.timestamp)}</p>
                    </div>
                    {notification.link && (
                      <Link href={notification.link} className={styles.viewLink}>
                        View
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={styles.footer}>
                <Link href="/notifications" className={styles.viewAllLink} onClick={() => setIsOpen(false)}>
                  View All Notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
