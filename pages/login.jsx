import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import { 
  Code2, 
  Github, 
  Zap, 
  Shield, 
  Cpu, 
  Box, 
  Sparkles,
  ChevronRight,
  Star,
  GitBranch,
  Cloud,
  Terminal
} from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'

export default function Login() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        toast.success('✨ Welcome to GIT-OS!', {
          description: 'Ready to build something amazing?'
        })
        router.push('/page')
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/page`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      if (error) throw error
    } catch (error) {
      toast.error('Failed to login', {
        description: error.message
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(59,130,246,0.1)" stroke-width="1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)"/%3E%3C/svg%3E')] opacity-40" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
      
      <div className="relative flex min-h-screen">
        {/* Left side - Hero */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 text-white">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <Code2 className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                GIT-OS
              </span>
            </div>
            
            <h1 className="text-6xl font-bold mb-8 leading-tight">
              Build. Run. Share.
              <span className="block mt-2 text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text">
                Real Programs.
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-lg">
              The first cloud IDE that executes real Electron apps, C# programs, 
              and Node.js scripts — not simulations. Zero setup, instant deployment.
            </p>

            <div className="space-y-5">
              {[
                { icon: Zap, text: 'Real Electron & Node.js execution', color: 'blue' },
                { icon: Cpu, text: 'Full C# / .NET support', color: 'purple' },
                { icon: Cloud, text: 'One-click GitHub publishing', color: 'green' },
                { icon: Shield, text: 'Secure sandboxed environment', color: 'red' },
                { icon: GitBranch, text: 'Version control built-in', color: 'orange' },
                { icon: Sparkles, text: 'No local setup required', color: 'pink' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className={clsx(
                    "p-2 rounded-lg transition-all duration-300 group-hover:scale-110",
                    `bg-${feature.color}-500/20 group-hover:bg-${feature.color}-500/30`
                  )}>
                    <feature.icon className={clsx(
                      "w-4 h-4",
                      `text-${feature.color}-400`
                    )} />
                  </div>
                  <span className="text-slate-300 group-hover:text-white transition-colors">
                    {feature.text}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-slate-900" />
                ))}
              </div>
              <span className="text-slate-400">
                <span className="text-white font-bold">2,500+</span> developers
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              ))}
              <span className="text-slate-400 ml-2">4.9/5</span>
            </div>
          </div>
        </div>

        {/* Right side - Login Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl relative overflow-hidden">
              {/* Animated border gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
              
              <div className="relative">
                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2 mb-10">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <Code2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    GIT-OS
                  </span>
                </div>

                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Welcome back
                  </h2>
                  <p className="text-slate-400">
                    Sign in to continue to your workspace
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className={clsx(
                    "w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 relative overflow-hidden group",
                    isLoading && "opacity-75 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
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
                    </>
                  )}
                </button>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Terms of Service
                    </a>
                    <span className="text-slate-600">•</span>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                    <span className="text-slate-600">•</span>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      Docs
                    </a>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="mt-8 flex justify-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Shield className="w-3 h-3" />
                    SOC2 Type II
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Terminal className="w-3 h-3" />
                    Sandboxed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
