import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useAppData } from '../context/AppDataContext'

type EventFormState = {
  name: string
  slug: string
  description: string
  thumbnail: string
  password: string
  imagesRaw: string
}

const initialState: EventFormState = {
  name: '',
  slug: '',
  description: '',
  thumbnail: '',
  password: '',
  imagesRaw: '',
}

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export const AdminPage = () => {
  const {
    events,
    isAdmin,
    setAdminSession,
    createEvent,
    updateEvent,
    deleteEvent,
    addImagesToEvent,
    removeImageFromEvent,
  } = useAppData()

  const [form, setForm] = useState<EventFormState>(initialState)

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [events],
  )

  const login = () => {
    const username = window.prompt('Admin username')
    const password = window.prompt('Admin password')

    if (username === 'admin' && password === 'admin') {
      setAdminSession(true)
      window.alert('Welcome admin.')
      return
    }

    window.alert('Invalid credentials.')
  }

  const logout = () => {
    setAdminSession(false)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const slug = form.slug ? toSlug(form.slug) : toSlug(form.name)
    if (!slug) {
      window.alert('Please provide a valid event name or slug.')
      return
    }

    const images = form.imagesRaw
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    createEvent({
      name: form.name,
      slug,
      description: form.description,
      thumbnail: form.thumbnail,
      password: form.password,
      images,
    })

    setForm(initialState)
  }

  const uploadThumbnail = async (eventId: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return
    }

    const dataUrl = await fileToDataUrl(fileList[0])
    updateEvent(eventId, { thumbnail: dataUrl })
  }

  const uploadGalleryImages = async (eventId: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return
    }

    const encoded = await Promise.all(Array.from(fileList).map((file) => fileToDataUrl(file)))
    addImagesToEvent(eventId, encoded)
  }

  if (!isAdmin) {
    return (
      <section className="page-shell">
        <div className="locked-card">
          <p className="eyebrow">Admin access</p>
          <h2>Restricted panel</h2>
          <p>Use temporary credentials for now: username `admin`, password `admin`.</p>
          <button type="button" className="btn-primary" onClick={login}>
            Open admin panel
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-page">
      <div className="section-header admin-header">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h2>Manage event folders</h2>
        </div>
        <button type="button" className="btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <form className="admin-form" onSubmit={onSubmit}>
        <label>
          Event name
          <input
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </label>

        <label>
          Event slug (optional)
          <input
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
          />
        </label>

        <label>
          Description
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </label>

        <label>
          Thumbnail URL
          <input
            required
            value={form.thumbnail}
            onChange={(e) => setForm((prev) => ({ ...prev, thumbnail: e.target.value }))}
          />
        </label>

        <label>
          Event password
          <input
            required
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
        </label>

        <label>
          Image URLs (one per line)
          <textarea
            rows={4}
            value={form.imagesRaw}
            onChange={(e) => setForm((prev) => ({ ...prev, imagesRaw: e.target.value }))}
          />
        </label>

        <button type="submit" className="btn-primary">
          Create event folder
        </button>
      </form>

      <div className="admin-events">
        {sortedEvents.map((event) => (
          <article key={event.id} className="admin-event-card">
            <div className="admin-event-top">
              <img src={event.thumbnail} alt={event.name} />
              <div>
                <h3>{event.name}</h3>
                <p>{event.slug}</p>
                <p>{event.images.length} images</p>
              </div>
            </div>

            <div className="admin-actions">
              <label>
                Rename event
                <input
                  value={event.name}
                  onChange={(e) => updateEvent(event.id, { name: e.target.value })}
                />
              </label>

              <label>
                Update password
                <input
                  value={event.password}
                  onChange={(e) => updateEvent(event.id, { password: e.target.value })}
                />
              </label>

              <label>
                Replace thumbnail URL
                <input
                  value={event.thumbnail}
                  onChange={(e) => updateEvent(event.id, { thumbnail: e.target.value })}
                />
              </label>

              <label>
                Upload thumbnail file
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    uploadThumbnail(event.id, e.target.files)
                  }
                />
              </label>

              <label>
                Upload gallery images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    uploadGalleryImages(event.id, e.target.files)
                  }
                />
              </label>

              <label>
                Add image URL
                <input
                  placeholder="https://..."
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') {
                      return
                    }

                    e.preventDefault()
                    const target = e.currentTarget
                    if (!target.value.trim()) {
                      return
                    }

                    addImagesToEvent(event.id, [target.value.trim()])
                    target.value = ''
                  }}
                />
              </label>

              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  const confirmed = window.confirm(`Delete ${event.name}?`)
                  if (confirmed) {
                    deleteEvent(event.id)
                  }
                }}
              >
                Delete event
              </button>
            </div>

            <div className="mini-gallery">
              {event.images.map((image, index) => (
                <div key={`${event.id}-${index}`} className="mini-image-wrap">
                  <img src={image} alt={`${event.name} ${index + 1}`} />
                  <button
                    type="button"
                    className="mini-remove"
                    onClick={() => removeImageFromEvent(event.id, image)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
