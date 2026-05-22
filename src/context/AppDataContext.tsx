import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { storage } from '../lib/storage'
import type { EventFolder } from '../types'

type AppDataContextType = {
  events: EventFolder[]
  unlockedEventIds: string[]
  isAdmin: boolean
  unlockEvent: (eventId: string, password: string) => boolean
  lockAllEvents: () => void
  setAdminSession: (value: boolean) => void
  createEvent: (payload: Omit<EventFolder, 'id' | 'createdAt'>) => void
  updateEvent: (eventId: string, patch: Partial<Omit<EventFolder, 'id' | 'createdAt'>>) => void
  deleteEvent: (eventId: string) => void
  addImagesToEvent: (eventId: string, images: string[]) => void
  removeImageFromEvent: (eventId: string, imageUrl: string) => void
}

const AppDataContext = createContext<AppDataContextType | null>(null)

export const AppDataProvider = ({ children }: PropsWithChildren) => {
  const [events, setEvents] = useState<EventFolder[]>(() => storage.loadEvents())
  // Unlocked IDs are intentionally session-only (not persisted).
  // HomePage wipes them on mount so leaving a gallery always requires re-entry.
  const [unlockedEventIds, setUnlockedEventIds] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = useState<boolean>(() => storage.loadAdminSession())

  const updateEvents = useCallback((updater: (current: EventFolder[]) => EventFolder[]) => {
    setEvents((current) => {
      const updated = updater(current)
      storage.saveEvents(updated)
      return updated
    })
  }, [])

  const unlockEvent = useCallback(
    (eventId: string, password: string) => {
      const event = events.find((item) => item.id === eventId)
      if (!event || event.password !== password) {
        return false
      }

      setUnlockedEventIds((current) =>
        current.includes(eventId) ? current : [...current, eventId]
      )

      return true
    },
    [events],
  )

  const lockAllEvents = useCallback(() => {
    setUnlockedEventIds([])
  }, [])

  const setAdminSession = useCallback((value: boolean) => {
    setIsAdmin(value)
    storage.saveAdminSession(value)
  }, [])

  const createEvent = useCallback(
    (payload: Omit<EventFolder, 'id' | 'createdAt'>) => {
      updateEvents((current) => [
        {
          ...payload,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
        ...current,
      ])
    },
    [updateEvents],
  )

  const updateEvent = useCallback(
    (eventId: string, patch: Partial<Omit<EventFolder, 'id' | 'createdAt'>>) => {
      updateEvents((current) =>
        current.map((event) => (event.id === eventId ? { ...event, ...patch } : event)),
      )
    },
    [updateEvents],
  )

  const deleteEvent = useCallback(
    (eventId: string) => {
      updateEvents((current) => current.filter((event) => event.id !== eventId))
      setUnlockedEventIds((current) => {
        const updated = current.filter((id) => id !== eventId)
        storage.saveUnlocked(updated)
        return updated
      })
    },
    [updateEvents],
  )

  const addImagesToEvent = useCallback(
    (eventId: string, images: string[]) => {
      if (images.length === 0) {
        return
      }

      updateEvents((current) =>
        current.map((event) =>
          event.id === eventId
            ? {
                ...event,
                images: [...event.images, ...images],
              }
            : event,
        ),
      )
    },
    [updateEvents],
  )

  const removeImageFromEvent = useCallback(
    (eventId: string, imageUrl: string) => {
      updateEvents((current) =>
        current.map((event) =>
          event.id === eventId
            ? {
                ...event,
                images: event.images.filter((url) => url !== imageUrl),
              }
            : event,
        ),
      )
    },
    [updateEvents],
  )

  const value = useMemo(
    () => ({
      events,
      unlockedEventIds,
      isAdmin,
      unlockEvent,
      lockAllEvents,
      setAdminSession,
      createEvent,
      updateEvent,
      deleteEvent,
      addImagesToEvent,
      removeImageFromEvent,
    }),
    [
      events,
      unlockedEventIds,
      isAdmin,
      unlockEvent,
      lockAllEvents,
      setAdminSession,
      createEvent,
      updateEvent,
      deleteEvent,
      addImagesToEvent,
      removeImageFromEvent,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export const useAppData = () => {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider')
  }

  return context
}
