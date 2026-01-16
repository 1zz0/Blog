import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  subtitle: { margin: '6px 0 0', color: '#6b7280', fontSize: 13, lineHeight: 1.4 },
  form: { display: 'grid', gap: 12, marginTop: 12 },
  label: { fontSize: 13, color: '#374151', marginBottom: 6, display: 'block' },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    outline: 'none',
    minHeight: 160,
    resize: 'vertical' as const,
  },
  fileHint: { marginTop: 6, color: '#6b7280', fontSize: 12 },
  btnRow: { display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginTop: 8 },
  btnPrimary: {
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
  btnPrimaryDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
  },
  btnSecondary: {
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
    fontSize: 14,
    textDecoration: 'none',
    display: 'inline-block',
  },
  error: { marginTop: 10, color: '#b91c1c', fontSize: 13 },
  preview: {
    width: '100%',
    maxHeight: 240,
    objectFit: 'cover' as const,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
  },
}

function getFileExt(name: string) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : 'png'
}

export default function CreateBlog() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (file: File | null) => {
    setImageFile(file)
    if (!file) {
      setImagePreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (saving) return
    setSaving(true)
    setError(null)

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setError(sessionError.message)
        return
      }

      const userId = sessionData.session?.user.id
      if (!userId) {
        setError('You must be logged in to create a blog.')
        return
      }

      // 1) Upload image (optional)
      let image_url: string | null = null

      if (imageFile) {
        // basic client-side size guard (optional)
        const maxMb = 5
        if (imageFile.size > maxMb * 1024 * 1024) {
          setError(`Image too large. Max ${maxMb}MB.`)
          return
        }

        const ext = getFileExt(imageFile.name)
        const fileName = `${crypto.randomUUID()}.${ext}`
        const filePath = `${userId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(filePath, imageFile, { upsert: false })

        if (uploadError) {
          setError(uploadError.message)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filePath)

        image_url = publicUrlData.publicUrl
      }

      // 2) Insert blog row
      const { error: insertError } = await supabase.from('blogs').insert([
        { title, content, user_id: userId, image_url },
      ])

      if (insertError) {
        setError(insertError.message)
        return
      }

      // Clear form then go back
      setTitle('')
      setContent('')
      setImageFile(null)
      setImagePreview(null)
      navigate('/blogs')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Create Blog</h1>
            <p style={styles.subtitle}>
              Add a title, content, and optionally an image. You can edit or delete later.
            </p>
          </div>

          <Link to="/blogs" style={styles.btnSecondary}>
            Back to Blogs
          </Link>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., My first post"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label style={styles.label}>Content</label>
            <textarea
              style={styles.textarea}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your blog content here..."
              required
              disabled={saving}
            />
          </div>

          <div>
            <label style={styles.label}>Image (optional)</label>
            <input
              style={styles.input}
              type="file"
              accept="image/*"
              disabled={saving}
              onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
            />
            <div style={styles.fileHint}>Recommended: JPG/PNG, up to 5MB.</div>

            {imagePreview && (
              <div style={{ marginTop: 10 }}>
                <img src={imagePreview} alt="Preview" style={styles.preview} />
              </div>
            )}
          </div>

          <div style={styles.btnRow}>
            <button
              type="submit"
              style={{
                ...styles.btnPrimary,
                ...(saving ? styles.btnPrimaryDisabled : {}),
              }}
              disabled={saving}
            >
              {saving ? 'Creating…' : 'Create'}
            </button>

            <Link to="/" style={styles.btnSecondary}>
              Home
            </Link>
          </div>

          {error && <div style={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  )
}
