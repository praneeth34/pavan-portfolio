import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

const Lightbox = ({
  images,
  index,
  onClose,
}: {
  images: string[]
  index: number
  onClose: () => void
}) => {
  const [current, setCurrent] = useState(index)

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + images.length) % images.length),
    [images.length],
  )
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % images.length),
    [images.length],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  return (
    <div className="lightbox" onClick={onClose}>
      <img
        src={images[current]}
        alt={`Image ${current + 1}`}
        onClick={(e) => e.stopPropagation()}
      />
      <button type="button" className="lightbox-close" onClick={onClose}>
        ✕
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox-nav lightbox-prev"
            onClick={(e) => { e.stopPropagation(); prev() }}
          >
            ←
          </button>
          <button
            type="button"
            className="lightbox-nav lightbox-next"
            onClick={(e) => { e.stopPropagation(); next() }}
          >
            →
          </button>
          <span className="lightbox-counter">
            {current + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  )
}

export const EventPage = () => {
  const { slug } = useParams()
  const { events, unlockedEventIds, unlockEvent, isAdmin } = useAppData()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const event = events.find((e) => e.slug === slug)
  const isUnlocked = event
    ? unlockedEventIds.includes(event.id) || isAdmin
    : false

  useEffect(() => {
    if (!event || isUnlocked) return
    const pw = window.prompt(`Enter password for "${event.name}"`)
    if (!pw) return
    if (!unlockEvent(event.id, pw)) {
      window.alert('Incorrect password. Please try again.')
    }
  }, [event, isUnlocked, unlockEvent])

  const tryUnlock = () => {
    if (!event) return
    const pw = window.prompt(`Enter password for "${event.name}"`)
    if (!pw) return
    if (!unlockEvent(event.id, pw)) {
      window.alert('Incorrect password. Please try again.')
    }
  }

  if (!event) {
    return (
      <div className="page-shell">
        <div className="locked-card">
          <span className="eyebrow">Error</span>
          <h2>Event not found</h2>
          <Link to="/" className="btn-primary">Back to portfolio</Link>
        </div>
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <div className="page-shell">
        <div className="locked-card">
          <span className="eyebrow">Protected gallery</span>
          <h2>{event.name}</h2>
          {event.description ? <p>{event.description}</p> : null}
          <button type="button" className="btn-primary" onClick={tryUnlock}>
            Enter password
          </button>
          <Link to="/" className="btn-secondary">← Back to all events</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox
          images={event.images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <div className="gallery-page">
        <div className="gallery-page-header">
          <div>
            <span className="eyebrow">Gallery · {event.images.length} images</span>
            <h2>{event.name}</h2>
            {event.description ? <p>{event.description}</p> : null}
          </div>
          <Link to="/" className="btn-secondary">← All events</Link>
        </div>

        <div className="gallery-grid">
          {event.images.map((src, i) => (
            <figure
              key={`${event.id}-${i}`}
              className="gallery-item"
              onClick={() => setLightboxIndex(i)}
            >
              <img src={src} alt={`${event.name} ${i + 1}`} loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
    </>
  )
}
