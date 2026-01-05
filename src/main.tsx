import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './i18n';
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </GoogleOAuthProvider>
    </AuthProvider>
  </StrictMode>,
)
