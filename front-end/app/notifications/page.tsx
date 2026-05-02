'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Notification } from '@/lib/types'
import { Trash2, CheckCircle } from 'lucide-react'
import {
  deleteNotification,
  getNotificationsData,
  markNotificationAsRead,
} from '@/lib/backend-api'

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotificationsData()
      .then(setNotifications)
      .finally(() => setLoading(false))
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      )
    )
  }

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId)
    setNotifications((current) => current.filter((notification) => notification.id !== notificationId))
  }

  if (loading) {
    return <div className="p-6 text-center">Loading notifications...</div>
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with application deadlines and status changes
          </p>
        </div>

        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No notifications yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-colors ${
                  notification.read_at ? 'bg-muted/30' : 'bg-primary/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {notification.title}
                      {!notification.read_at && (
                        <span className="inline-block w-2 h-2 bg-primary rounded-full ml-2" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.created_at).toLocaleDateString()} at{' '}
                      {new Date(notification.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read_at && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(notification.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
