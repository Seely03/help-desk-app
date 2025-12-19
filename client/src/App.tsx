// client/src/App.tsx
import { useState, useEffect } from 'react'

// Define the shape of our API response (Type Safety!)
interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

function App() {
  const [status, setStatus] = useState<string>('Loading...')

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then((data: HealthResponse) => setStatus(data.message))
      .catch(err => {
        console.error(err); // <--- Now we are using it!
        setStatus('API Error: Is server running?');
    })})

  return (
    <div style={{ padding: '20px' }}>
      <h1>Help Desk Portal (TS)</h1>
      <p>Backend Status: <strong>{status}</strong></p>
    </div>
  )
}

export default App