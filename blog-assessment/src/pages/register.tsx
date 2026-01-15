import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../app/store'
import { registerUser } from '../features/auth/authSlice'

const styles = {
  page: { maxWidth: 520, margin: '0 auto', padding: '24px 16px' },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 20,
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  title: { margin: 0, fontSize: 24, color: '#111827' },
  subtitle: { marginTop: 6, color: '#6b7280', fontSize: 13 },
  form: { display: 'grid', gap: 12, marginTop: 14 },
  label: { fontSize: 13, color: '#374151', marginBottom: 6, display: 'block' },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    fontSize: 14,
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

function Register() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const { user, loading, error } = useSelector((state: RootState) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(registerUser({ email, password }))

    if (registerUser.fulfilled.match(result)) {
      navigate('/', { replace: true })
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register</h1>
        <p style={styles.subtitle}>Create an account to start blogging.</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <div>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.btnRow}>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Creating…' : 'Register'}
            </button>
            <Link to="/login" style={styles.btnSecondary}>Login</Link>
            <Link to="/" style={styles.btnSecondary}>Home</Link>
          </div>

          {error && <div style={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  )
}

export default Register
