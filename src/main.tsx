import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { routers } from '@/routes'
import './index.css'
import 'virtual:uno.css'
import { initializeStores } from './store';

document.addEventListener("drop", (e) => e.preventDefault());
document.addEventListener("dragover", (e) => e.preventDefault(),);
document.addEventListener('contextmenu', (e) => e.preventDefault())
document.addEventListener('keydown', (e) => {
  if (['F3', 'F5', 'F7'].includes(e.key.toUpperCase())) {
    e.preventDefault()
  }

  if (e.ctrlKey && ['r', 'u', 'p', 'l', 'j', 'g', 'f', 's', 'a'].includes(e.key.toLowerCase())) {
    e.preventDefault()
  }
})

initializeStores().then(() => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <RouterProvider router={routers} />
    </StrictMode>,
  )
})
