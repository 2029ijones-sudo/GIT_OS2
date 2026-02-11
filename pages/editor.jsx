import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { 
  Code2, 
  Save, 
  Github, 
  Play, 
  ArrowLeft,
  Settings,
  FileCode,
  Package,
  Terminal,
  Box,
  Cpu,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export default function ProgramEditor() {
  const [user, setUser] = useState(null)
  const [program, setProgram] = useState({
    name: '',
    description: '',
    type: 'electron',
    code: `// Welcome to GIT-OS
// Write your Electron app here

const { app, BrowserWindow } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadURL('https://github.com')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})`,
    entryPoint: 'main.js'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      if (id) {
        const { data } = await supabase
          .from('GIT_PROGRAMS')
          .select('*')
          .eq('id', id)
          .single()
        
        if (data && data.user_id === user.id) {
          setProgram({
            name: data.name,
            description: data.description,
            type: data.type,
            code: data.code,
            entryPoint: data.entry_point
          })
        } else {
          router.push('/page')
        }
      }
    }
    init()
  }, [id])

  const handleSave = async () => {
    if (!program.name.trim()) {
      toast.error('Program name is required')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/programs', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...program,
          id,
          userId: user.id,
          userEmail: user.email
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(id ? 'Program updated!' : 'Program created!')
        if (!id) {
          router.push(`/editor?id=${result.program?.id || id}`)
        }
      }
    } catch (error) {
      toast.error('Failed to save program')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!program.name.trim()) {
      toast.error('Program name is required')
      return
    }

    setIsPublishing(true)
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...program,
          userId: user.id,
          userEmail: user.email,
          published: true
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Published to GitHub!', {
          description: 'Your repository has been created',
          icon: <Github className="w-4 h-4" />
        })
      }
    } catch (error) {
      toast.error('Failed to publish to GitHub')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('🚀 Initializing execution environment...')
    setShowPreview(true)
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: program.code,
          type: program.type,
          entryPoint: program.entryPoint
        })
      })
      const result = await response.json()
      
      if (result.error) {
        setOutput(`❌ Error: ${result.error}\n${result.output || ''}`)
        toast.error('Execution failed')
      } else {
        setOutput(result.output || '✅ Program executed successfully')
        toast.success('Program executed')
      }
    } catch (error) {
      setOutput(`❌ Execution error: ${error.message}`)
      toast.error('Execution failed')
    } finally {
      setIsRunning(false)
    }
  }

  const getLanguageFromType = () => {
    switch (program.type) {
      case 'electron': return 'javascript'
      case 'cs': return 'csharp'
      case 'node': return 'javascript'
      default: return 'javascript'
    }
  }

  const getTemplate = (type) => {
    switch (type) {
      case 'electron':
        return `// Electron App
const { app, BrowserWindow } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadURL('https://github.com')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})`
      case 'cs':
        return `using System;

namespace GitOSApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello from GIT-OS!");
            
            for (int i = 0; i < 5; i++)
            {
                Console.WriteLine($"Count: {i}");
            }
        }
    }
}`
      case 'node':
        return `// Node.js Script
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from GIT-OS!\\n');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});`
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/page')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                GIT-OS Editor
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2">
              <span className={clsx(
                "px-2.5 py-1 rounded-md text-xs font-medium",
                program.type === 'electron' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                program.type === 'cs' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" :
                "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
              )}>
                {program.type.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run
                </>
              )}
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Left Sidebar - Program Info */}
        <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Program Settings
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Program Name
                </label>
                <input
                  type="text"
                  value={program.name}
                  onChange={(e) => setProgram({ ...program, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Awesome App"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={program.description}
                  onChange={(e) => setProgram({ ...program, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="What does your program do?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Program Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'electron', label: 'Electron', icon: Box, color: 'blue' },
                    { id: 'cs', label: 'C#', icon: Cpu, color: 'purple' },
                    { id: 'node', label: 'Node.js', icon: Terminal, color: 'emerald' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setProgram({ 
                          ...program, 
                          type: type.id,
                          code: getTemplate(type.id),
                          entryPoint: type.id === 'cs' ? 'Program.cs' : 'main.js'
                        })
                      }}
                      className={clsx(
                        "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                        program.type === type.id
                          ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                          : "border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      <type.icon className={clsx(
                        "w-5 h-5",
                        program.type === type.id ? `text-${type.color}-600 dark:text-${type.color}-400` : "text-slate-600 dark:text-slate-400"
                      )} />
                      <span className={clsx(
                        "text-xs font-medium",
                        program.type === type.id ? `text-${type.color}-600 dark:text-${type.color}-400` : "text-slate-600 dark:text-slate-400"
                      )}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Entry Point
                </label>
                <input
                  type="text"
                  value={program.entryPoint}
                  onChange={(e) => setProgram({ ...program, entryPoint: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="main.js"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Author</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Code Editor */}
        <div className="flex-1 flex flex-col bg-slate-950">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">
                {program.entryPoint || 'main.js'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {program.code.split('\n').length} lines
              </span>
            </div>
          </div>
          
          <MonacoEditor
            height="100%"
            language={getLanguageFromType()}
            value={program.code}
            onChange={(value) => setProgram({ ...program, code: value })}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              wordWrap: 'on'
            }}
          />
        </div>

        {/* Right Sidebar - Output/Preview */}
        {showPreview && (
          <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Output
                </span>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-950">
              <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap">
                {output || '▶️ Click "Run" to execute your program'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
