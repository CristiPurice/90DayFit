import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonturile temelor, împachetate local (fără cereri externe).
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/600.css'
import '@fontsource/archivo/700.css'
import '@fontsource/archivo/900.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/700.css'
import '@fontsource/manrope/800.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/public-sans/400.css'
import '@fontsource/public-sans/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/600.css'
import './themes/base.css'
import { App } from './app/App'

const root = document.getElementById('root')
if (!root) throw new Error('Elementul #root lipsește din index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
