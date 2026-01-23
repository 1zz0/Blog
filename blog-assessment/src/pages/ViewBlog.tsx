import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'

type Blog = {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  image_url?: string | null
}

type Comment = {
  id: string
  blog_id: string
  user_id: string
  content: string
  image_url?: string | null
  created_at: string
}

const styles = {
  page: { maxWidth: 980, margin: '0 auto', padding: '24px 16px' },

  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 18,
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },

  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap' as const,
    marginBottom: 12,
  },

  title: { margin: 0, fontSize: 24, color: '#111827' },
  meta: { margin: 0, color: '#9ca3af', fontSize: 12 },

  image: {
    width: '100%',
    height: 320,
    objectFit: 'cover' as const,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    marginTop: 12,
  },

  content: {
    marginTop: 12,
    color: '#374151',
    lineHeight: 1.6,
    overflowWrap: 'anywhere' as const,
    wordBreak: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
  },

  sectionTitle: { marginTop: 18, marginBottom: 10, fontSize: 16, color: '#111827' },

  form: { display: 'grid', gap: 10, marginTop: 10 },
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
    minHeight: 90,
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
    fontSize: 14,
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
  btnDanger: {
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid #fecaca',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    color: '#b91c1c',
  },

  commentCard: {
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: 12,
    background: '#fff',
    display: 'grid',
    gap: 8,
  },

  commentText: {
    margin: 0,
    color: '#374151',
    overflowWrap: 'anywhere' as const,
    wordBreak: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
  },

  commentImage: {
    width: '100%',
    height: 220,
    objectFit: 'cover' as const,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
  },

  error: { marginTop: 10, color: '#b91c1c', fontSize: 13 },
}

function formatDate(iso?: string) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function getFileExt(name: string) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : 'png'
}

export default function ViewBlog() {
  const { id } = useParams()
  const user = useSelector((state: RootState) => state.auth.user)

  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentFile, setCommentFile] = useState<File | null>(null)
  const [posting, setPosting] = useState(false)

  const load = async () => {
    if (!id) return
    setError(null)
    setLoading(true)

    const { data: blogData, error: blogErr } = await supabase
      .from('blogs')
      .select('id,user_id,title,content,created_at,image_url')
      .eq('id', id)
      .single()

    if (blogErr) {
      setError(blogErr.message)
      setLoading(false)
      return
    }

    setBlog(blogData)

    const { data: commentData, error: cErr } = await supabase
      .from('comments')
      .select('id,blog_id,user_id,content,image_url,created_at')
      .eq('blog_id', id)
      .order('created_at', { ascending: false, nullsFirst: false })

    if (cErr) {
      setError(cErr.message)
      setLoading(false)
      return
    }

    setComments(commentData ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const uploadCommentImage = async (userId: string, file: File) => {
    const ext = getFileExt(file.name)
    const fileName = `${crypto.randomUUID()}.${ext}`
    const filePath = `${userId}/${fileName}`

    const { error: upErr } = await supabase.storage
      .from('comment-images')
      .upload(filePath, file, { upsert: false })

    if (upErr) throw upErr

    const { data } = supabase.storage.from('comment-images').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    if (!user) {
      setError('You must be logged in to comment.')
      return
    }
    if (!commentText.trim()) {
      setError('Comment cannot be empty.')
      return
    }

    setPosting(true)
    setError(null)

    try {
      let image_url: string | null = null
      if (commentFile) {
        image_url = await uploadCommentImage(user.id, commentFile)
      }

      const { error: insErr } = await supabase.from('comments').insert([
        {
          blog_id: id,
          user_id: user.id,
          content: commentText.trim(),
          image_url,
        },
      ])

      if (insErr) {
        setError(insErr.message)
        return
      }

      setCommentText('')
      setCommentFile(null)
      await load()
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const ok = window.confirm('Delete this comment?')
    if (!ok) return

    const { error: delErr } = await supabase.from('comments').delete().eq('id', commentId)
    if (delErr) {
      setError(delErr.message)
      return
    }
    await load()
  }

  if (loading) return <div style={styles.page}><p>Loading…</p></div>
  if (!blog) return <div style={styles.page}><p>Not found.</p></div>

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <Link to="/blogs" style={styles.btnSecondary}>Back to Blogs</Link>
        <Link to="/" style={styles.btnSecondary}>Home</Link>
      </div>

      <div style={styles.card}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>{blog.title}</h1>
          <p style={styles.meta}>{formatDate(blog.created_at)}</p>
        </div>

        {blog.image_url ? <img src={blog.image_url} alt={blog.title} style={styles.image} /> : null}

        <div style={styles.content}>{blog.content}</div>
      </div>

      <h2 style={styles.sectionTitle}>Comments</h2>

      <div style={styles.card}>
        <form onSubmit={handlePostComment} style={styles.form}>
          <textarea
            style={styles.textarea}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder={user ? 'Write a comment…' : 'Login to comment…'}
            disabled={!user || posting}
          />

          <input
            style={styles.input}
            type="file"
            accept="image/*"
            disabled={!user || posting}
            onChange={e => setCommentFile(e.target.files?.[0] ?? null)}
          />

          <div style={styles.btnRow}>
            <button type="submit" style={styles.btnPrimary} disabled={!user || posting}>
              {posting ? 'Posting…' : 'Post comment'}
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}
        </form>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
        {comments.length === 0 ? (
          <div style={{ color: '#6b7280' }}>No comments yet.</div>
        ) : (
          comments.map(c => {
            const isOwner = !!user && c.user_id === user.id
            return (
              <div key={c.id} style={styles.commentCard}>
                <div style={styles.meta}>{formatDate(c.created_at)}</div>
                <p style={styles.commentText}>{c.content}</p>
                {c.image_url ? <img src={c.image_url} alt="Comment image" style={styles.commentImage} /> : null}

                {isOwner && (
                  <div>
                    <button
                      type="button"
                      style={styles.btnDanger}
                      onClick={() => handleDeleteComment(c.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
