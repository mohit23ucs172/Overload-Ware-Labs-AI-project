import React, { useState } from 'react'
import axios from 'axios'

export default function MentorChat() {
  const [advice, setAdvice] = useState('')

  const fetchAdvice = async () => {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://127.0.0.1:5000/mentor/advice', {
      headers: { Authorization: `Bearer ${token}` }
    })
    setAdvice(res.data.advice)
  }

  return (
    <div style={{ border: '1px solid #aaa', padding: '10px', marginTop: '20px', borderRadius: '5px' }}>
      <h3>🦉 Mentor Chat</h3>
      <button onClick={fetchAdvice}>Get Mentor Advice</button>
      {advice && <p><b>Mentor:</b> {advice}</p>}
    </div>
  )
}
