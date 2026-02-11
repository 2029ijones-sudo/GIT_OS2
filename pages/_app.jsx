import '@/styles/globals.css'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Toaster } from 'sonner'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    supabase.auth.getSession()
  }, [])

  return (
    <>
      <Component {...pageProps} />
      <Toaster 
        position="top-right"
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white'
          }
        }}
      />
    </>
  )
}
