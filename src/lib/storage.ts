import { seedEvents } from '../data/seedEvents'
import type { EventFolder } from '../types'

const EVENTS_KEY = 'portfolio_events_v1'
const UNLOCK_KEY = 'portfolio_unlocked_v1'
const ADMIN_KEY = 'portfolio_admin_v1'

export const storage = {
  loadEvents: (): EventFolder[] => {
    const raw = window.localStorage.getItem(EVENTS_KEY)
    if (!raw) {
      window.localStorage.setItem(EVENTS_KEY, JSON.stringify(seedEvents))
      return [...seedEvents]
    }

    try {
      const parsed = JSON.parse(raw) as EventFolder[]
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid event data')
      }
      return parsed
    } catch {
      window.localStorage.setItem(EVENTS_KEY, JSON.stringify(seedEvents))
      return [...seedEvents]
    }
  },

  saveEvents: (events: EventFolder[]) => {
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  },

  loadUnlocked: (): string[] => {
    const raw = window.localStorage.getItem(UNLOCK_KEY)
    if (!raw) {
      return []
    }

    try {
      const parsed = JSON.parse(raw) as string[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  },

  saveUnlocked: (eventIds: string[]) => {
    window.localStorage.setItem(UNLOCK_KEY, JSON.stringify(eventIds))
  },

  clearUnlocked: () => {
    window.localStorage.removeItem(UNLOCK_KEY)
  },

  loadAdminSession: () => window.localStorage.getItem(ADMIN_KEY) === 'true',

  saveAdminSession: (value: boolean) => {
    window.localStorage.setItem(ADMIN_KEY, value ? 'true' : 'false')
  },
}
