// client/src/App.jsx
import { useState, useEffect } from 'react'

function App() {
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    // Fetch data from our Node API
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setStatus(data.message))
      .catch(err => setStatus('API Error: Is server running?'))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Help Desk Portal</h1>
      <p>Backend Status: <strong>{status}</strong></p>
    </div>
  )
}

export default App