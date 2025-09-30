import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function ModuleView() {
  const { id } = useParams()
  const [tasks, setTasks] = useState([])
  const [advice, setAdvice] = useState('')

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('token')
      const res = await axios.get(`https://owl-task3.onrender.com/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTasks(res.data)
    }
    fetchTasks()
  }, [id])

  const completeTask = async (taskId) => {
    const token = localStorage.getItem('token')
    await axios.post(`https://owl-task3.onrender.com/progress/${taskId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const adviceRes = await axios.get('https://owl-task3.onrender.com/mentor/advice', {
      headers: { Authorization: `Bearer ${token}` }
    })
    setAdvice(adviceRes.data.advice)
  }

  return (
    <div>
      <h2>Module Tasks</h2>
      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            {t.title} - {t.description}
            <button onClick={() => completeTask(t.id)}>Complete</button>
          </li>
        ))}
      </ul>
      {advice && <p><b>Mentor says:</b> {advice}</p>}
    </div>
  )
}
