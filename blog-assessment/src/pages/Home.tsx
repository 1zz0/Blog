import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'

const styles = {
  page: {
    maxWidth: 980,
    margin: '0 auto',
    padding: '24px 16px',
  },
  hero: {
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 20,
    background: '#ffffff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  title: { margin: 0, fontSize: 28, color: '#111827' },
  subtitle: { marginTop: 8, marginBottom: 0, color: '#4b5563', lineHeight: 1.5 },
  grid: {
    marginTop: 16,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: 16,
    background: '#f9fafb',
  },
  cardTitle: { margin: 0, fontSize: 16, color: '#111827' },
  cardDesc: { marginTop: 6, marginBottom: 12, color: '#6b7280', fontSize: 13, lineHeight: 1.4 },
  btnRow: { display: 'flex', gap: 10, flexWrap: 'wrap' as const },
  btn: {
    display: 'inline-block',
    padding: '10px 12px',
    borderRadius: 12,
    textDecoration: 'none',
    fontSize: 14,
    border: '1px solid #e5e7eb',
    background: '#111827',
    color: '#fff',
  },
  btnSecondary: {
    display: 'inline-block',
    padding: '10px 12px',
    borderRadius: 12,
    textDecoration: 'none',
    fontSize: 14,
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#111827',
  },
  footerNote: { marginTop: 12, color: '#6b7280', fontSize: 12 },
  badge: {
    display: 'inline-block',
    marginTop: 10,
    padding: '6px 10px',
    borderRadius: 999,
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#374151',
    fontSize: 12,
  },
}

function Home() {
  const user = useSelector((state: RootState) => state.auth.user)

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Dashboard</h1>

        <div style={styles.badge}>
          Status: <b>{user ? `Signed in as ${user.email}` : 'Not signed in'}</b>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Blogs</h3>
            <p style={styles.cardDesc}>View the list of blogs with pagination.</p>
            <div style={styles.btnRow}>
              <Link to="/blogs" style={styles.btn}>Open Blogs</Link>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Create Blog</h3>
            <p style={styles.cardDesc}>Create a new blog post (requires login).</p>
            <div style={styles.btnRow}>
              <Link to="/blogs/create" style={styles.btn}>Create</Link>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Authentication</h3>
            <p style={styles.cardDesc}>Register a new account or log into an existing one.</p>
            <div style={styles.btnRow}>
              <Link to="/register" style={styles.btnSecondary}>Register</Link>
              <Link to="/login" style={styles.btnSecondary}>Login</Link>
              <Link to="/logout" style={styles.btnSecondary}>Logout</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
