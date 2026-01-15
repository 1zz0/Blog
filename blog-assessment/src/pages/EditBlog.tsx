import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const styles = {
  page: { maxWidth: 720, margin: '0 auto', padding: '24px 16px' },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 20,
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap' as const,
    marginBottom: 16,
  },
  title: { margin: 0, fontSize: 24, color: '#111827' },
  subtitle: { marginTop: 6, color: '#6b7280', fontSize: 13 },
  form: { display: 'grid', gap: 12 },
  label: { fontSize: 13, color: '#374151', marginBottom: 6, display: 'block' },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    fontSize: 14,
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    minHeight: 160,
    resize: 'vertical' as const,
  },
  btnRow: { display: 'flex', gap: 10, flexWrap: 'wrap' as const },
  btnPrimary: {
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#111827',
    textDecoration: 'none',
  },
  error: { marginTop: 10, color: '#b91c1c', fontSize: 13 },
}

function EditBlog() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setTitle(data.title)
        setContent(data.content)
      }
      setLoading(false)
    }

    fetchBlog()
  }, [id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('blogs')
      .update({ title, content })
      .eq('id', id)

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/blogs')
  }

  if (loading) return <p style={{ padding: 16 }}>Loading blog…</p>

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Edit Blog</h1>
            <p style={styles.subtitle}>Update your blog content below.</p>
          </div>

          <Link to="/blogs" style={styles.btnSecondary}>
            Back to Blogs
          </Link>
        </div>

        <form onSubmit={handleUpdate} style={styles.form}>
          <div>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Content</label>
            <textarea
              style={styles.textarea}
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>

          <div style={styles.btnRow}>
            <button type="submit" style={styles.btnPrimary} disabled={saving}>
              {saving ? 'Saving…' : 'Update'}
            </button>
            <Link to="/" style={styles.btnSecondary}>Home</Link>
          </div>

          {error && <div style={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  )
}

export default EditBlog
