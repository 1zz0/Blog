import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../app/store'
import { logoutUser } from '../features/auth/authSlice'

function Logout() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(logoutUser()).finally(() => {
      navigate('/login', { replace: true })
    })
  }, [dispatch, navigate])

  return <p style={{ padding: 16 }}>Logging out...</p>
}

export default Logout
