import React from 'react'

export default function ProgressBar({ completed, total }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div style={{ width: '100%', background: '#ddd', borderRadius: '5px' }}>
      <div
        style={{
          width: `${percentage}%`,
          background: '#4caf50',
          padding: '5px',
          borderRadius: '5px',
          color: 'white',
          textAlign: 'center'
        }}
      >
        {percentage}%
      </div>
    </div>
  )
}
