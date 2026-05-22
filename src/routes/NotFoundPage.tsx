import { Link } from 'react-router-dom'

export const NotFoundPage = () => {
  return (
    <section className="page-shell">
      <div className="locked-card">
        <p className="eyebrow">404</p>
        <h2>Page not found</h2>
        <Link to="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </section>
  )
}
