'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NotificationPreferences } from '@/lib/types'
import {
  getNotificationPreferencesData,
  updateNotificationPreferencesData,
} from '@/lib/backend-api'

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getNotificationPreferencesData()
      .then(setPreferences)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!preferences) return

    setSaving(true)
    try {
      const updated = await updateNotificationPreferencesData(preferences)
      setPreferences(updated)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading preferences...</div>
  }

  if (!preferences) {
    return <div className="p-6 text-center text-muted-foreground">Failed to load preferences</div>
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground mt-2">
            Customize how you receive notifications about opportunities and applications
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Deadline Reminders</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified about upcoming application deadlines
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.deadline_reminders}
                onChange={(event) =>
                  setPreferences({
                    ...preferences,
                    deadline_reminders: event.target.checked,
                  })
                }
                className="rounded"
              />
            </div>
          </div>

          <div className="border-t" />

          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Status Updates</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified when your application status changes
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.status_updates}
                onChange={(event) =>
                  setPreferences({
                    ...preferences,
                    status_updates: event.target.checked,
                  })
                }
                className="rounded"
              />
            </div>
          </div>

          <div className="border-t" />

          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Marketing Emails</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive emails about new opportunities and features
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(event) =>
                  setPreferences({
                    ...preferences,
                    marketing: event.target.checked,
                  })
                }
                className="rounded"
              />
            </div>
          </div>

          <div className="border-t" />

          <div>
            <h3 className="font-semibold mb-3">Reminder Frequency</h3>
            <div className="space-y-2">
              {['daily', 'weekly', 'never'].map((frequency) => (
                <label key={frequency} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted">
                  <input
                    type="radio"
                    name="frequency"
                    value={frequency}
                    checked={preferences.reminder_frequency === frequency}
                    onChange={(event) =>
                      setPreferences({
                        ...preferences,
                        reminder_frequency: event.target.value as NotificationPreferences['reminder_frequency'],
                      })
                    }
                  />
                  <span className="capitalize">{frequency}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
