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

function Home() {
  const [blogs, setBlogs] = useState<BlogPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
      .from('blogs')
      .select('id,title,content,created_at,image_url')
      .order('created_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false })
      .range(0, 4)

      if (!error && data) setBlogs(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: '0 auto' }}>
      <h1>Home</h1>

      <h2 style={{ marginTop: 18 }}>Latest Blogs</h2>
      {loading ? (
        <p>Loading…</p>
      ) : blogs.length === 0 ? (
        <p>No blogs yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {blogs.map(b => (
            <Link
              key={b.id}
              to="/blogs"
              style={{
                textDecoration: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                padding: 14,
                background: '#fff',
                color: '#111827',
              }}
            >
              {b.image_url ? (
                <img
                  src={b.image_url}
                  alt={b.title}
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, marginBottom: 10 }}
                />
              ) : null}

              <h3 style={{ margin: 0, fontSize: 16 }}>{b.title}</h3>
              <p style={{ color: '#6b7280', fontSize: 13, marginTop: 6 }}>
                {b.content.length > 120 ? b.content.slice(0, 120) + '…' : b.content}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Link to="/blogs">View all blogs →</Link>
      </div>
    </div>
  )
}

export default Home
