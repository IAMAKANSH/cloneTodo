import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { authActions } from './stores/authStore'

// One-time DB reset to fix schema migration from v1 → v3
const DB_VERSION_KEY = 'todo_db_v3_ready';
if (!localStorage.getItem(DB_VERSION_KEY)) {
  const req = indexedDB.deleteDatabase('TodoApp');
  req.onsuccess = () => {
    localStorage.setItem(DB_VERSION_KEY, '1');
    window.location.reload();
  };
  req.onerror = () => {
    localStorage.setItem(DB_VERSION_KEY, '1');
    window.location.reload();
  };
} else {
  // Normal startup
  authActions.initialize().then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
}
