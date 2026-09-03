import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/600.css'
import '@fontsource/archivo/700.css'
import '@fontsource/archivo/900.css'
import './themes/base.css'
import { App } from './app/App'

const root = document.getElementById('root')
if (!root) throw new Error('Elementul #root lipsește din index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
