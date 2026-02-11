import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { provider } = req.body

    if (provider === 'google') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${req.headers.origin}/page`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) throw error
      
      // Store in GOOGLE_LOGIN table
      const { error: dbError } = await supabase
        .from('GOOGLE_LOGIN')
        .insert([
          { 
            provider: 'google',
            created_at: new Date().toISOString()
          }
        ])

      if (dbError) throw dbError

      return res.status(200).json({ success: true, url: data.url })
    }

    return res.status(400).json({ error: 'Invalid provider' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
