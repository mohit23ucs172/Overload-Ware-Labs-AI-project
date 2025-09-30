import React from 'react'

export default function TaskCard({ task, onComplete }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <button onClick={() => onComplete(task.id)}>Mark Complete</button>
    </div>
  )
}
