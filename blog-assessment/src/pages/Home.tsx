import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type BlogPreview = {
  id: string
  title: string
  content: string
  created_at: string
  image_url?: string | null
}

const styles = {
  page: { maxWidth: 980, margin: '0 auto', padding: '24px 16px' },
  header: {
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 20,
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  title: { margin: 0, fontSize: 28, color: '#111827' },
  subtitle: { marginTop: 8, marginBottom: 0, color: '#6b7280', fontSize: 13, lineHeight: 1.4 },

  sectionRow: {
    marginTop: 18,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  sectionTitle: { margin: 0, fontSize: 18, color: '#111827' },

  grid: {
    marginTop: 12,
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  },

  card: {
    textDecoration: 'none',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 14,
    background: '#fff',
    color: '#111827',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    minHeight: 220,
  },

  image: {
    width: '100%',
    height: 160,
    objectFit: 'cover' as const,
    borderRadius: 12,
  },

  cardTitle: {
    margin: 0,
    fontSize: 16,
    overflowWrap: 'anywhere' as const,
    wordBreak: 'break-word' as const,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },

  cardContent: {
    margin: 0,
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 1.4,
    overflowWrap: 'anywhere' as const,
    wordBreak: 'break-word' as const,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },

  link: { textDecoration: 'none' },
  empty: { marginTop: 12, color: '#6b7280' },
}

function Home() {
  const [blogs, setBlogs] = useState<BlogPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('blogs')
        .select('id,title,content,created_at,image_url')
        .order('created_at', { ascending: false })
        .range(0, 4)

      if (!error && data) setBlogs(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Home</h1>
        <p style={styles.subtitle}>
          Latest posts are shown below. You can browse all blogs or sign in to create your own.
        </p>
      </div>

      <div style={styles.sectionRow}>
        <h2 style={styles.sectionTitle}>Latest Blogs</h2>
        <Link to="/blogs" style={styles.link}>View all blogs →</Link>
      </div>

      {loading ? (
        <p style={styles.empty}>Loading…</p>
      ) : blogs.length === 0 ? (
        <p style={styles.empty}>No blogs yet.</p>
      ) : (
        <div style={styles.grid}>
          {blogs.map(b => (
            <Link
              key={b.id}
              to="/blogs"
              style={styles.card}
              title={b.title}
            >
              {b.image_url ? <img src={b.image_url} alt={b.title} style={styles.image} /> : null}
              <h3 style={styles.cardTitle}>{b.title}</h3>
              <p style={styles.cardContent}>
                {b.content}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
