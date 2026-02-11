import { supabase } from '../../lib/supabase'
import { Octokit } from 'octokit'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { data: programs } = await supabase
          .from('GIT_PROGRAMS')
          .select('*')
          .order('created_at', { ascending: false })
        return res.status(200).json(programs)

      case 'POST':
        const { name, description, type, code, entryPoint, userId, userEmail, published } = req.body
        
        if (!name || !type || !code || !userId) {
          return res.status(400).json({ error: 'Missing required fields' })
        }

        // Save to Supabase
        const { data: program, error } = await supabase
          .from('GIT_PROGRAMS')
          .insert([
            {
              name,
              description,
              type,
              code,
              entry_point: entryPoint || 'main.js',
              user_id: userId,
              creator_email: userEmail,
              published: published || false,
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (error) throw error

        // Publish to GitHub if requested
        if (published && process.env.GITHUB_TOKEN) {
          const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
          
          try {
            await octokit.rest.repos.createForAuthenticatedUser({
              name: `git-os-${program.id}`,
              description: program.description || 'Created with GIT-OS',
              private: false,
              auto_init: true
            })

            // Wait for repo to initialize
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Create initial files
            await octokit.rest.repos.createOrUpdateFileContents({
              owner: 'git-os',
              repo: `git-os-${program.id}`,
              path: entryPoint || 'main.js',
              message: 'Initial commit from GIT-OS',
              content: Buffer.from(code).toString('base64')
            })

            // Update program with GitHub URL
            await supabase
              .from('GIT_PROGRAMS')
              .update({ 
                github_url: `https://github.com/git-os/git-os-${program.id}`,
                published: true 
              })
              .eq('id', program.id)

          } catch (githubError) {
            console.error('GitHub publish error:', githubError)
          }
        }

        return res.status(201).json({ success: true, program })

      case 'PUT':
        const { id: putId, ...updateData } = req.body
        
        const { error: updateError } = await supabase
          .from('GIT_PROGRAMS')
          .update({
            name: updateData.name,
            description: updateData.description,
            type: updateData.type,
            code: updateData.code,
            entry_point: updateData.entryPoint,
            updated_at: new Date().toISOString()
          })
          .eq('id', putId)
          .eq('user_id', updateData.userId)

        if (updateError) throw updateError
        return res.status(200).json({ success: true })

      case 'DELETE':
        const { id: deleteId, userId: deleteUserId } = req.body
        
        const { error: deleteError } = await supabase
          .from('GIT_PROGRAMS')
          .delete()
          .eq('id', deleteId)
          .eq('user_id', deleteUserId)

        if (deleteError) throw deleteError
        return res.status(200).json({ success: true })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: error.message })
  }
}
