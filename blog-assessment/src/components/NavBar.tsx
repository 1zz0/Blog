import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'

const styles = {
  shell: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 20,
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
  },
  container: {
    maxWidth: 980,
    margin: '0 auto',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: {
    fontWeight: 700,
    letterSpacing: 0.2,
    color: '#111827',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap' as const,
  },
  link: {
    padding: '8px 10px',
    borderRadius: 10,
    textDecoration: 'none',
    fontSize: 14,
    border: '1px solid transparent',
  },
  linkActive: {
    background: '#111827',
    color: '#fff',
  },
  linkInactive: {
    color: '#111827',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
  },
  pill: {
    fontSize: 12,
    color: '#374151',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    padding: '6px 10px',
    borderRadius: 999,
    whiteSpace: 'nowrap' as const,
  },
}

function NavBar() {
  const user = useSelector((state: RootState) => state.auth.user)

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    ...styles.link,
    ...(isActive ? styles.linkActive : styles.linkInactive),
  })

  return (
    <header style={styles.shell}>
      <div style={styles.container}>
        <NavLink to="/" style={styles.brand}>
          <h1>BLOG</h1>
        </NavLink>

        <nav style={styles.nav}>
          <NavLink to="/blogs" style={navLinkStyle}>
            Blogs
          </NavLink>

          {user ? (
            <>
              <NavLink to="/blogs/create" style={navLinkStyle}>
                Create
              </NavLink>
              <NavLink to="/logout" style={navLinkStyle}>
                Logout
              </NavLink>
              <span style={styles.pill}>
                Signed in: <b>{user.email}</b>
              </span>
            </>
          ) : (
            <>
              <NavLink to="/register" style={navLinkStyle}>
                Register
              </NavLink>
              <NavLink to="/login" style={navLinkStyle}>
                Login
              </NavLink>
              <span style={styles.pill}>Not signed in</span>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default NavBar
