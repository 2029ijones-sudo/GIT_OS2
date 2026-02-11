import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import { 
  Code2, 
  Plus, 
  Play, 
  Trash2, 
  Edit, 
  Terminal, 
  Moon, 
  Sun,
  Github,
  Box,
  Cpu,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  User,
  LogOut,
  Share2,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  ExternalLink,
  MoreVertical,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'

export default function Page() {
  const [user, setUser] = useState(null)
  const [programs, setPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await fetchPrograms()
      setIsLoading(false)
    }
    getUser()
  }, [])

  const fetchPrograms = async () => {
    const { data } = await supabase
      .from('GIT_PROGRAMS')
      .select('*')
      .order('created_at', { ascending: false })
    setPrograms(data || [])
  }

  const runProgram = async (program) => {
    setIsRunning(true)
    setOutput('🚀 Initializing secure execution environment...\n')
    
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: program.code,
          type: program.type,
          entryPoint: program.entry_point
        })
      })
      const result = await response.json()
      
      if (result.error) {
        setOutput(prev => prev + `❌ Error: ${result.error}\n${result.output || ''}`)
        toast.error('Execution failed', {
          description: result.error
        })
      } else {
        setOutput(prev => prev + result.output || '✅ Program executed successfully')
        toast.success('Program executed successfully')
      }
    } catch (error) {
      setOutput(prev => prev + `❌ Execution error: ${error.message}`)
      toast.error('Execution failed', {
        description: error.message
      })
    } finally {
      setIsRunning(false)
    }
  }

  const deleteProgram = async (id) => {
    try {
      const { error } = await supabase
        .from('GIT_PROGRAMS')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      
      setPrograms(programs.filter(p => p.id !== id))
      if (selectedProgram?.id === id) {
        setSelectedProgram(null)
        setOutput('')
      }
      toast.success('Program deleted successfully')
    } catch (error) {
      toast.error('Failed to delete program', {
        description: error.message
      })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
  }

  const handleClone = async (program) => {
    if (!user) {
      toast.error('Please sign in to clone programs')
      return
    }

    const newProgram = {
      name: `${program.name} (Clone)`,
      description: program.description,
      type: program.type,
      code: program.code,
      entryPoint: program.entry_point,
      userId: user.id,
      userEmail: user.email,
      published: false
    }

    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProgram)
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Program cloned successfully')
        fetchPrograms()
      }
    } catch (error) {
      toast.error('Failed to clone program')
    }
  }

  const filteredPrograms = programs.filter(prog => {
    const matchesSearch = prog.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prog.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || prog.type === filterType
    return matchesSearch && matchesType
  })

  const getProgramIcon = (type) => {
    switch (type) {
      case 'electron': return Box
      case 'cs': return Cpu
      case 'node': return Terminal
      default: return Code2
    }
  }

  const getProgramColor = (type) => {
    switch (type) {
      case 'electron': return 'blue'
      case 'cs': return 'purple'
      case 'node': return 'emerald'
      default: return 'slate'
    }
  }

  const formatDate = (date) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now - then
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return then.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Code2 className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-400 mt-6 animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className={clsx(
      "min-h-screen transition-colors duration-300",
      isDarkMode ? "dark bg-slate-950" : "bg-slate-50"
    )}>
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-96 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-600/25">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  GIT-OS
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cloud Development Platform</p>
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>

          <button
            onClick={() => router.push('/editor')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/25"
          >
            <Plus className="w-5 h-5" />
            Create New Program
          </button>
        </div>

        {/* User profile */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user.email}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Developer • {programs.filter(p => p.user_id === user.id).length} programs
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="p-6 space-y-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search programs by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Filter by type
              </span>
              {filterType !== 'all' && (
                <button
                  onClick={() => setFilterType('all')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All', icon: Filter },
                { id: 'electron', label: 'Electron', icon: Box, color: 'blue' },
                { id: 'cs', label: 'C#', icon: Cpu, color: 'purple' },
                { id: 'node', label: 'Node.js', icon: Terminal, color: 'emerald' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    filterType === type.id
                      ? type.id === 'all'
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        : `bg-${type.color}-600 text-white`
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  <type.icon className="w-3.5 h-3.5" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {filteredPrograms.length}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {filteredPrograms.length === 1 ? 'program' : 'programs'}
              </span>
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'grid' 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'list'
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Programs list */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {filteredPrograms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <Code2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No programs found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first program'}
              </p>
              {!searchQuery && filterType === 'all' && (
                <button
                  onClick={() => router.push('/editor')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Program
                </button>
              )}
            </div>
          ) : (
            <div className={clsx(
              viewMode === 'grid' 
                ? "grid grid-cols-1 gap-3" 
                : "space-y-2"
            )}>
              {filteredPrograms.map((prog) => {
                const Icon = getProgramIcon(prog.type)
                const color = getProgramColor(prog.type)
                const isOwner = user.id === prog.user_id
                
                return (
                  <div
                    key={prog.id}
                    className={clsx(
                      "group relative rounded-xl transition-all cursor-pointer",
                      viewMode === 'grid' ? "p-5" : "p-4",
                      selectedProgram?.id === prog.id
                        ? "bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-500/20 dark:to-purple-500/20 border-2 border-blue-500 dark:border-blue-400"
                        : "bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 border-2 border-transparent"
                    )}
                    onClick={() => setSelectedProgram(prog)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={clsx(
                        "p-2.5 rounded-xl",
                        `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                              {prog.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {prog.description || 'No description'}
                            </p>
                          </div>
                          
                          {prog.published && (
                            <div className="flex-shrink-0">
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-md">
                                <Github className="w-3 h-3 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                  Published
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {prog.creator_email?.split('@')[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDate(prog.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isOwner && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/editor?id=${prog.id}`)
                            }}
                            className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 shadow-sm"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteProgram(prog.id)
                            }}
                            className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm group/delete"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400 group-hover/delete:scale-110 transition-transform" />
                          </button>
                        </div>
                      )}

                      {!isOwner && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleClone(prog)
                            }}
                            className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 shadow-sm"
                            title="Clone"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="ml-96 min-h-screen">
        {selectedProgram ? (
          <div className="p-8">
            {/* Program header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5",
                      selectedProgram.type === 'electron' 
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
                        : selectedProgram.type === 'cs'
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                    )}>
                      {(() => {
                        const Icon = getProgramIcon(selectedProgram.type)
                        return <Icon className="w-3.5 h-3.5" />
                      })()}
                      {selectedProgram.type.toUpperCase()}
                    </span>
                    
                    {selectedProgram.published && (
                      <a
                        href={selectedProgram.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium flex items-center gap-1.5 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                        View on GitHub
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {selectedProgram.user_id === user.id && (
                      <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Owner
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                    {selectedProgram.name}
                  </h1>
                  
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                    {selectedProgram.description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {selectedProgram.creator_email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Author</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {selectedProgram.creator_email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                    
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Created</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(selectedProgram.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    {selectedProgram.updated_at && (
                      <>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Last updated</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatDate(selectedProgram.updated_at)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => runProgram(selectedProgram)}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-600/25"
                  >
                    {isRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Program
                      </>
                    )}
                  </button>
                  
                  {selectedProgram.user_id === user.id && (
                    <button
                      onClick={() => router.push(`/editor?id=${selectedProgram.id}`)}
                      className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleClone(selectedProgram)}
                    className="p-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    title="Clone this program"
                  >
                    <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  
                  <button
                    className="p-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Code and Output */}
            <div className="grid grid-cols-2 gap-8">
              {/* Code Viewer */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {selectedProgram.entry_point || 'main.js'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {selectedProgram.code.split('\n').length} lines
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <pre className="p-6 text-sm font-mono overflow-auto max-h-[600px] bg-slate-950 text-slate-50">
                    <code>{selectedProgram.code}</code>
                  </pre>
                </div>
              </div>

              {/* Output Terminal */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Terminal Output
                    </span>
                  </div>
                  {isRunning && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Executing...
                      </span>
                    </div>
                  )}
                  {output && !isRunning && (
                    <button
                      onClick={() => setOutput('')}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex-1 bg-slate-950 p-6 font-mono text-sm overflow-auto max-h-[600px]">
                  {output ? (
                    <pre className="text-slate-300 whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Terminal className="w-12 h-12 text-slate-700 mb-4" />
                      <p className="text-slate-600 text-sm">
                        Click the <span className="text-green-500 font-medium">Run Program</span> button to execute this code
                      </p>
                      <p className="text-slate-700 text-xs mt-2">
                        Output will appear here in real-time
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-4 gap-6 mt-8">
              {[
                { label: 'Total Views', value: '1.2k', icon: Star, color: 'yellow' },
                { label: 'Runs', value: '856', icon: Play, color: 'green' },
                { label: 'Clones', value: '234', icon: Download, color: 'blue' },
                { label: 'Contributors', value: '3', icon: User, color: 'purple' }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={clsx(
                      "p-3 rounded-xl",
                      `bg-${stat.color}-100 dark:bg-${stat.color}-900/30`
                    )}>
                      <stat.icon className={clsx(
                        "w-5 h-5",
                        `text-${stat.color}-600 dark:text-${stat.color}-400`
                      )} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center max-w-md mx-auto">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/30">
                  <Code2 className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Welcome to GIT-OS
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Select a program from the sidebar to get started, or create your first project to begin building.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/editor')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/25"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Program
                </button>
                
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Need inspiration? Check out our{' '}
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                    example projects
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
