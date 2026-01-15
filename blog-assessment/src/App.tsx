import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Register from './pages/register'
import Login from './pages/login'
import Logout from './pages/logout'
import Blogs from './pages/Blogs'
import CreateBlog from './pages/CreateBlog'
import ProtectedRoute from './components/ProtectedRoute'
import EditBlog from './pages/EditBlog'


function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/blogs" element={<Blogs />} />


        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <Blogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blogs/create"
          element={
            <ProtectedRoute>
              <CreateBlog />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blogs/edit/:id"
          element={
            <ProtectedRoute>
              <EditBlog />
            </ProtectedRoute>
          }
        />


        <Route path="*" element={<h1 style={{ padding: 16 }}>Not Found</h1>} />
      </Routes>
    </>
  )
}

export default App
