import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f5f5f5' }}>
      <div>
        <Link to="/dashboard">🏠 Dashboard</Link>
      </div>
      <div>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}
