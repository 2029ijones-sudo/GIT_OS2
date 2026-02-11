import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import { Code2, Github, Zap, Shield, Cpu } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        toast.success('Successfully logged in!')
        router.push('/page')
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/page`
        }
      })
      if (error) throw error
    } catch (error) {
      toast.error('Failed to login: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)"/%3E%3C/svg%3E')] opacity-20" />
      
      <div className="relative flex min-h-screen">
        {/* Left side - Hero */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                <Code2 className="w-8 h-8 text-blue-400" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                GIT-OS
              </span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Build, Run & Share
              <span className="block text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                Real Programs
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              The first platform that lets you create and execute real Electron apps, 
              C# programs, and Node.js scripts directly in the browser.
            </p>

            <div className="space-y-4">
              {[
                { icon: Zap, text: 'Execute real code, not simulations' },
                { icon: Shield, text: 'Secure sandboxed execution' },
                { icon: Cpu, text: 'Full Electron & .NET support' },
                { icon: Github, text: 'Auto-publish to GitHub' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <feature.icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-400">
            © 2024 GIT-OS. The future of cloud development.
          </div>
        </div>

        {/* Right side - Login */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-2 mb-8">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Code2 className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xl font-bold text-white">GIT-OS</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back
              </h2>
              <p className="text-gray-400 mb-8">
                Sign in to start building and running real programs
              </p>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
