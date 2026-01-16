import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

const PAGE_SIZE = 5

export const fetchBlogs = createAsyncThunk(
  'blogs/fetch',
  async (page: number = 1) => {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error } = await supabase
    .from('blogs')
    .select('id,user_id,title,content,created_at,image_url')
    .order('created_at', { ascending: false, nullsFirst: false })
    .order('id', { ascending: false })
    .range(from, to)


    if (error) throw error
    return data
  }
)

export interface Blog {
  image_url?: string | null
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
