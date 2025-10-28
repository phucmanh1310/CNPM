import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store, persistor } from './redux/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import axios from 'axios'

// Axios global configuration
const rawBaseURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL
  : '/'
// Remove trailing slash from production URL, but keep it if it's just '/' for local proxy
axios.defaults.baseURL =
  rawBaseURL.length > 1 && rawBaseURL.endsWith('/')
    ? rawBaseURL.slice(0, -1)
    : rawBaseURL
axios.defaults.withCredentials = true

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </BrowserRouter>
)
