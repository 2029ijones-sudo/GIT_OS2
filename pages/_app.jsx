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
      <Toaster position="top-right" richColors />
    </>
  )
}
