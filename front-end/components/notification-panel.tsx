'use client'

import { Notification } from '@/lib/types'
import { X, Check, Calendar, Bell, ExternalLink, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import {
  deleteNotification as deleteNotificationRequest,
  getNotificationsData,
  markNotificationAsRead as markNotificationAsReadRequest,
} from '@/lib/backend-api'

interface NotificationPanelProps {
  userId: string
  onClose: () => void
}

export function NotificationPanel({ userId, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch notifications
    fetchNotifications()
  }, [userId])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await getNotificationsData()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsReadRequest(notificationId)
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      ))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationRequest(notificationId)
      setNotifications(notifications.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading notifications...
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No notifications yet</p>
      </div>
    )
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">TrackIt Notifications</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="divide-y divide-border">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-4 ${!notification.read_at ? 'bg-muted/30' : ''
              } ${getPriorityColor(notification.priority)}`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 whitespace-pre-line">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {notification.type.replace('_', ' ')}
                    </Badge>
                    {notification.category && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {notification.category}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {notification.event && (
                    <div className="mt-2">
                      <Link href={`/opportunities/${notification.event}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          View Opportunity
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!notification.read_at && (
                  <div className="w-2 h-2 bg-chart-1 rounded-full flex-shrink-0" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border text-center">
        <Link href="/notifications">
          <Button variant="outline" size="sm" className="w-full">
            View All Notifications
          </Button>
        </Link>
      </div>
    </div>
  )
}
