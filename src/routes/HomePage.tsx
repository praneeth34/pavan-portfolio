import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import type { EventFolder } from '../types'

type SortOption = 'newest' | 'oldest' | 'az' | 'za'

const EventCard = ({ event }: { event: EventFolder }) => (
  <Link to={`/event/${event.slug}`} className="event-card">
    <img src={event.thumbnail} alt={event.name} loading="lazy" />
    <div className="event-card-label">
      <h3>{event.name}</h3>
      {event.description ? <p>{event.description}</p> : null}
    </div>
    <span className="event-lock">Locked</span>
  </Link>
)

export const HomePage = () => {
  const { events, lockAllEvents } = useAppData()
  const heroRef = useRef<HTMLDivElement>(null)

  // Lock all event galleries whenever the user returns to the home page
  useEffect(() => {
    lockAllEvents()
  }, [lockAllEvents])

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Scale 1 → 10: large enough to fill viewport, small enough to avoid SVG distortion
  const cameraScale   = useTransform(scrollYProgress, [0, 1], [1, 10])
  // Fade out between 50% and 80% of scroll so camera disappears before max scale
  const cameraOpacity = useTransform(scrollYProgress, [0.48, 0.78], [1, 0])
  // Lens inner rings rotate as zoom progresses — outer ring CW, inner CCW
  const lensRotateOuter = useTransform(scrollYProgress, [0, 1], [0, 540])
  const lensRotateInner = useTransform(scrollYProgress, [0, 1], [0, -360])

  const [query, setQuery] = useState('')
  const [sort, setSort]   = useState<SortOption>('newest')

  const filtered = useMemo(() => {
    let list = [...events]
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      )
    }
    switch (sort) {
      case 'newest': list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break
      case 'oldest': list.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); break
      case 'az':     list.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'za':     list.sort((a, b) => b.name.localeCompare(a.name)); break
    }
    return list
  }, [events, query, sort])

  return (
    <>
      {/* ── Lens hero: 280vh sticky scroll section ─────── */}
      <div className="lens-hero" ref={heroRef}>
        <div className="lens-sticky">
          <motion.div
            className="camera-stage"
            style={{ scale: cameraScale, opacity: cameraOpacity }}
          >
            <img src="/camera-hero.svg" alt="Camera" className="camera-img" />
            {/* Rotating lens elements overlay — matches camera SVG 800×800 viewBox */}
            <svg
              className="lens-rotate-overlay"
              viewBox="0 0 800 800"
              fill="none"
              aria-hidden="true"
            >
              {/* Clip to lens glass circle so rings stay inside */}
              <defs>
                <clipPath id="lensClip">
                  <circle cx="400" cy="400" r="118" />
                </clipPath>
              </defs>

              {/* Outer rotating group: dashed ring + asymmetric arc (clockwise) */}
              <motion.g
                style={{ rotate: lensRotateOuter, transformOrigin: '400px 400px' }}
                clipPath="url(#lensClip)"
              >
                {/* Segmented ring — 9 segments, creates pinwheel feel */}
                <circle cx="400" cy="400" r="96" fill="none"
                  stroke="rgba(0,229,255,0.28)" stroke-width="8"
                  stroke-dasharray="20 47" stroke-linecap="round"/>
                {/* Offset arc for asymmetry */}
                <path d="M 400 304 A 96 96 0 0 1 496 400"
                  stroke="rgba(0,229,255,0.2)" stroke-width="3"
                  stroke-linecap="round" fill="none"/>
              </motion.g>

              {/* Inner rotating group: tighter ring (counter-clockwise) */}
              <motion.g
                style={{ rotate: lensRotateInner, transformOrigin: '400px 400px' }}
                clipPath="url(#lensClip)"
              >
                {/* 6-segment inner ring */}
                <circle cx="400" cy="400" r="68" fill="none"
                  stroke="rgba(0,229,255,0.22)" stroke-width="6"
                  stroke-dasharray="18 53" stroke-linecap="round"/>
                {/* Cross-hair tick marks to make rotation obvious */}
                <line x1="400" y1="332" x2="400" y2="344"
                  stroke="rgba(0,229,255,0.4)" stroke-width="2" stroke-linecap="round"/>
                <line x1="400" y1="456" x2="400" y2="468"
                  stroke="rgba(0,229,255,0.4)" stroke-width="2" stroke-linecap="round"/>
                <line x1="332" y1="400" x2="344" y2="400"
                  stroke="rgba(0,229,255,0.4)" stroke-width="2" stroke-linecap="round"/>
                <line x1="456" y1="400" x2="468" y2="400"
                  stroke="rgba(0,229,255,0.4)" stroke-width="2" stroke-linecap="round"/>
              </motion.g>

              {/* Innermost slow ring — aperture blades suggestion */}
              <motion.g
                style={{ rotate: lensRotateOuter, transformOrigin: '400px 400px' }}
                clipPath="url(#lensClip)"
              >
                <circle cx="400" cy="400" r="34" fill="none"
                  stroke="rgba(0,229,255,0.45)" stroke-width="4"
                  stroke-dasharray="8 18" stroke-linecap="round"/>
              </motion.g>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* ── Events section – appears naturally below hero ─ */}
      <section className="events-section">
        <div className="events-header">
          <div>
            <span className="eyebrow">Portfolio</span>
            <h2>Event galleries</h2>
          </div>

          <div className="events-filters">
            <input
              type="search"
              className="search-input"
              placeholder="Search events…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="no-results">No events match your search.</p>
        ) : (
          <div className="events-grid">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
