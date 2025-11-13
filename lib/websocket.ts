import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"
import type { NotificationDto } from "./types"

export class WebSocketService {
  private static instance: WebSocketService
  private client: Client | null = null
  private connected: boolean = false
  private userEmail: string | null = null
  private companyId: number | null = null

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  connect(userEmail: string, companyId?: number) {
    if (this.connected && this.userEmail === userEmail) {
      console.log("WebSocket already connected for user:", userEmail)
      return
    }

    this.userEmail = userEmail
    this.companyId = companyId || null

    // Create SockJS connection
    const socket = new SockJS("http://localhost:8083/ws")

    // Create STOMP client
    this.client = new Client({
      webSocketFactory: () => socket as any,
      debug: (str) => {
        console.log("STOMP:", str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    this.client.onConnect = () => {
      console.log("WebSocket connected for:", userEmail)
      this.connected = true

      // Subscribe to user-specific notifications
      this.client?.subscribe(`/queue/user/${userEmail}`, (message) => {
        const notification: NotificationDto = JSON.parse(message.body)
        this.handleNotification(notification)
      })

      // Subscribe to company-specific notifications if applicable
      if (companyId) {
        this.client?.subscribe(`/queue/company/${companyId}`, (message) => {
          const notification: NotificationDto = JSON.parse(message.body)
          this.handleNotification(notification)
        })
      }

      // Subscribe to public notifications
      this.client?.subscribe("/topic/notifications", (message) => {
        const notification: NotificationDto = JSON.parse(message.body)
        this.handleNotification(notification)
      })
    }

    this.client.onStompError = (frame) => {
      console.error("STOMP error:", frame)
      this.connected = false
    }

    this.client.onWebSocketClose = () => {
      console.log("WebSocket disconnected")
      this.connected = false
    }

    this.client.activate()
  }

  private handleNotification(notification: NotificationDto) {
    console.log("Received notification:", notification)

    // Store notification
    this.storeNotification(notification)

    // Show browser notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      })
    }

    // Play notification sound (optional)
    this.playNotificationSound()

    // Trigger custom event for React components to listen
    window.dispatchEvent(
      new CustomEvent("websocket-notification", {
        detail: notification,
      })
    )
  }

  private storeNotification(notification: NotificationDto) {
    try {
      const stored = localStorage.getItem("notifications")
      const notifications: NotificationDto[] = stored ? JSON.parse(stored) : []
      notifications.unshift(notification)

      // Keep only last 50 notifications
      const trimmed = notifications.slice(0, 50)
      localStorage.setItem("notifications", JSON.stringify(trimmed))
    } catch (error) {
      console.error("Failed to store notification:", error)
    }
  }

  private playNotificationSound() {
    try {
      const audio = new Audio("/notification.mp3")
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore audio play errors
      })
    } catch (error) {
      // Ignore sound errors
    }
  }

  disconnect() {
    if (this.client && this.connected) {
      this.client.deactivate()
      this.connected = false
      this.userEmail = null
      this.companyId = null
      console.log("WebSocket disconnected")
    }
  }

  isConnected(): boolean {
    return this.connected
  }

  static requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission)
      })
    }
  }

  static getStoredNotifications(): NotificationDto[] {
    try {
      const stored = localStorage.getItem("notifications")
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      return []
    }
  }

  static markAsRead(notificationId: string) {
    try {
      const stored = localStorage.getItem("notifications")
      if (stored) {
        const notifications: NotificationDto[] = JSON.parse(stored)
        const updated = notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
        localStorage.setItem("notifications", JSON.stringify(updated))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  static clearAll() {
    localStorage.removeItem("notifications")
  }
}
