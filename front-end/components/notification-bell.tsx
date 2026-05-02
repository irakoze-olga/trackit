'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { NotificationPanel } from './notification-panel'
import { getNotificationsData } from '@/lib/backend-api'

interface NotificationBellProps {
  userId?: string
  unreadCount?: number
}

export function NotificationBell({ userId, unreadCount = 0 }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(unreadCount)

  useEffect(() => {
    setCount(unreadCount)
  }, [unreadCount])

  useEffect(() => {
    if (!userId) return

    const loadCount = async () => {
      try {
        const notifications = await getNotificationsData()
        setCount(notifications.filter((notification) => !notification.read_at).length)
      } catch (error) {
        console.error('Failed to load notification count:', error)
      }
    }

    loadCount()
  }, [userId])

  if (!userId) {
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-background border border-border rounded-lg shadow-lg z-50">
          <NotificationPanel userId={userId} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
