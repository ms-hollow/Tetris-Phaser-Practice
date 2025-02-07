import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App /> {/* Loads the main App component */}
  </React.StrictMode>, 
)


// Notes
// loads App.tsx which is the main react component
