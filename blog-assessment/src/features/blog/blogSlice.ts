import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

export interface Blog {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
}


interface BlogState {
  blogs: Blog[]
  loading: boolean
}

const initialState: BlogState = {
  blogs: [],
  loading: false,
}

export const fetchBlogs = createAsyncThunk(
  'blogs/fetch',
  async (page: number = 1) => {
    const pageSize = 5
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
)

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBlogs.pending, state => {
        state.loading = true
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false
        state.blogs = action.payload
      })
  },
})

export default blogSlice.reducer
