import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { initAuth } from '../features/auth/authSlice'
import type { AppDispatch } from './store'

function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(initAuth())
  }, [dispatch])

  return null
}

export default AuthInitializer
