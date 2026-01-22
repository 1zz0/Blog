import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
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
  btnPrimaryDisabled: { opacity: 0.65, cursor: 'not-allowed' },
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
  hint: { marginTop: 6, color: '#6b7280', fontSize: 12 },
}

function getFileExt(name: string) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : 'png'
}

export default function EditBlog() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // existing image from DB
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)

  // new selected image
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!id) return

      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('blogs')
        .select('title,content,image_url')
        .eq('id', id)
        .single()

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      setTitle(data.title ?? '')
      setContent(data.content ?? '')
      setExistingImageUrl(data.image_url ?? null)
      setLoading(false)
    }

    load()
  }, [id])

  const handleFileChange = (file: File | null) => {
    setImageFile(file)
    if (!file) {
      setImagePreview(null)
      return
    }
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async (userId: string, file: File) => {
    const ext = getFileExt(file.name)
    const fileName = `${crypto.randomUUID()}.${ext}`
    const filePath = `${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file, { upsert: false })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
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
        setError('You must be logged in to edit a blog.')
        return
      }

      // keep existing image unless user selected a new one
      let image_url = existingImageUrl

      if (imageFile) {
        image_url = await uploadImage(userId, imageFile)
      }

      const { error: updateError } = await supabase
        .from('blogs')
        .update({ title, content, image_url })
        .eq('id', id)

      if (updateError) {
        setError(updateError.message)
        return
      }

      navigate('/blogs')
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={styles.page}><p>Loading…</p></div>

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Edit Blog</h1>
            <p style={styles.subtitle}>Update title/content, and optionally replace the image.</p>
          </div>

          <Link to="/blogs" style={styles.btnSecondary}>Back to Blogs</Link>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
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
              required
              disabled={saving}
            />
          </div>

          <div>
            <label style={styles.label}>Current image</label>
            {existingImageUrl ? (
              <img src={existingImageUrl} alt="Current" style={styles.preview} />
            ) : (
              <p style={styles.hint}>No image uploaded for this post.</p>
            )}
          </div>

          <div>
            <label style={styles.label}>Replace image (optional)</label>
            <input
              style={styles.input}
              type="file"
              accept="image/*"
              disabled={saving}
              onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
            />
            <div style={styles.hint}>If you select a new image, it will replace the current one.</div>

            {imagePreview && (
              <div style={{ marginTop: 10 }}>
                <label style={styles.label}>New image preview</label>
                <img src={imagePreview} alt="New preview" style={styles.preview} />
              </div>
            )}
          </div>

          <div style={styles.btnRow}>
            <button
              type="submit"
              style={{ ...styles.btnPrimary, ...(saving ? styles.btnPrimaryDisabled : {}) }}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>

            <Link to="/" style={styles.btnSecondary}>Home</Link>
          </div>

          {error && <div style={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  )
}
