import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'
import type { User } from '@supabase/supabase-js'


interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
}

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return rejectWithValue(error.message)
    return data.user
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) return rejectWithValue(error.message)
    return data.user
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await supabase.auth.signOut()
})

export const initAuth = createAsyncThunk(
  'auth/init',
  async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.user ?? null
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(loginUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logoutUser.fulfilled, state => {
        state.user = null
      })
      .addCase(initAuth.pending, state => {
        state.loading = true
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })

  },
})

export default authSlice.reducer
