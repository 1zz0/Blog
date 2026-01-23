import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fetchBlogs } from '../features/blog/blogSlice'
import type { RootState, AppDispatch } from '../app/store'

const PAGE_SIZE = 5

const styles = {
  page: { maxWidth: 980, margin: '0 auto', padding: '24px 16px' },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap' as const,
    marginBottom: 16,
  },
  title: { margin: 0, fontSize: 26, color: '#111827' },
  actions: { display: 'flex', gap: 10, flexWrap: 'wrap' as const },
  btnPrimary: {
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 12,
  },
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    background: '#fff',
    padding: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    minHeight: 160,
  },
  cardImage: {
    width: '100%',
    height: 160,
    objectFit: 'cover' as const,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    color: '#111827',
    overflowWrap: 'anywhere' as const,
    wordBreak: 'break-word' as const,
  },
  content: {
    margin: 0,
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 1.5,
    overflowWrap: 'anywhere' as const,
    wordBreak: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
  },
  meta: { margin: 0, color: '#9ca3af', fontSize: 12 },
  cardActions: { display: 'flex', gap: 10, marginTop: 'auto', flexWrap: 'wrap' as const },
  btnSmall: {
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    cursor: 'pointer',
    fontSize: 13,
    color: '#111827',
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
  empty: {
    border: '1px dashed #d1d5db',
    borderRadius: 16,
    padding: 18,
    color: '#6b7280',
    background: '#fafafa',
  },
  pagerRow: {
    marginTop: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  pagerBtn: {
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    color: '#111827',
  },
  disabled: { opacity: 0.55, cursor: 'not-allowed' },
}

function formatDate(iso?: string) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function Blogs() {
  const dispatch = useDispatch<AppDispatch>()
  const { blogs, loading } = useSelector((state: RootState) => state.blog)
  const user = useSelector((state: RootState) => state.auth.user)

  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchBlogs(page))
  }, [dispatch, page])

  const canGoPrev = page > 1
  const canGoNext = blogs.length === PAGE_SIZE

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this blog? This action cannot be undone.')
    if (!ok) return

    setDeletingId(id)
    const { error } = await supabase.from('blogs').delete().eq('id', id)
    setDeletingId(null)

    if (error) {
      alert(error.message)
      return
    }

    dispatch(fetchBlogs(page))
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>Blogs</h1>

        <div style={styles.actions}>
          <Link to="/blogs/create" style={styles.btnPrimary}>Create Blog</Link>
          <Link to="/" style={styles.btnSecondary}>Home</Link>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : blogs.length === 0 ? (
        <div style={styles.empty}>
          <b>No blogs yet.</b>
          <div style={{ marginTop: 10 }}>
            <Link to="/blogs/create" style={styles.btnPrimary}>Create your own blog</Link>
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {blogs.map(blog => {
            const isOwner = !!user && blog.user_id === user.id

            return (
              <Link key={blog.id} to={`/blogs/${blog.id}`} style={styles.cardLink}>
                <div style={styles.card}>
                  {blog.image_url ? (
                    <img src={blog.image_url} alt={blog.title} style={styles.cardImage} />
                  ) : null}

                  <div>
                    <h3 style={styles.cardTitle}>{blog.title}</h3>
                    <p style={styles.meta}>{formatDate(blog.created_at)}</p>
                  </div>

                  <p style={styles.content}>
                    {blog.content.length > 220 ? blog.content.slice(0, 220) + '…' : blog.content}
                  </p>

                  {isOwner && (
                    <div style={styles.cardActions}>
                      <Link
                        to={`/blogs/edit/${blog.id}`}
                        style={styles.btnSmall}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        style={styles.btnDanger}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDelete(blog.id)
                        }}
                        disabled={deletingId === blog.id}
                      >
                        {deletingId === blog.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <div style={styles.pagerRow}>
        <div style={{ color: '#6b7280', fontSize: 13 }}>
          Page <b>{page}</b>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            style={{ ...styles.pagerBtn, ...(canGoPrev ? {} : styles.disabled) }}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={!canGoPrev}
          >
            Previous
          </button>

          <button
            type="button"
            style={{ ...styles.pagerBtn, ...(canGoNext ? {} : styles.disabled) }}
            onClick={() => setPage(p => p + 1)}
            disabled={!canGoNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
