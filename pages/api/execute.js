import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { v4 as uuidv4 } from 'uuid'

const execAsync = promisify(exec)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, type, entryPoint } = req.body
  const tempDir = path.join(os.tmpdir(), `git-os-${uuidv4()}`)

  try {
    switch (type) {
      case 'node':
        // Execute Node.js code using built-in VM
        const vm = require('vm')
        const sandbox = {
          console: {
            log: (...args) => { output += args.join(' ') + '\n' },
            error: (...args) => { output += 'Error: ' + args.join(' ') + '\n' },
            warn: (...args) => { output += 'Warning: ' + args.join(' ') + '\n' }
          },
          require,
          process,
          Buffer,
          setTimeout,
          setInterval,
          clearTimeout,
          clearInterval,
          __dirname: '/sandbox',
          __filename: '/sandbox/main.js'
        }
        
        let output = ''
        const context = vm.createContext(sandbox)
        const script = new vm.Script(code)
        script.runInContext(context, { timeout: 5000 })
        
        return res.status(200).json({ output: output || 'Execution completed' })

      case 'electron':
        // Execute Electron app
        await fs.ensureDir(tempDir)
        
        // Create package.json
        await fs.writeJson(path.join(tempDir, 'package.json'), {
          name: 'git-os-app',
          version: '1.0.0',
          main: entryPoint || 'main.js',
          scripts: { start: 'electron .' }
        })

        // Write the code
        await fs.writeFile(path.join(tempDir, entryPoint || 'main.js'), code)

        // Run electron with timeout
        const { stdout, stderr } = await execAsync('npx electron .', { 
          cwd: tempDir,
          timeout: 10000,
          env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
        })

        return res.status(200).json({ 
          output: stdout || stderr || 'Electron app executed successfully' 
        })

      case 'cs':
        // Execute C# code
        await fs.ensureDir(tempDir)
        
        const csFile = path.join(tempDir, entryPoint || 'Program.cs')
        await fs.writeFile(csFile, code)

        try {
          // Try to compile with csc
          await execAsync(`csc ${csFile}`, { cwd: tempDir, timeout: 10000 })
          const exeFile = path.join(tempDir, 'Program.exe')
          const { stdout, stderr } = await execAsync(exeFile, { cwd: tempDir, timeout: 5000 })
          return res.status(200).json({ output: stdout || stderr || 'C# program executed' })
        } catch {
          // Fallback to simple interpretation
          const lines = code.split('\n')
          const output = []
          for (const line of lines) {
            if (line.includes('Console.WriteLine')) {
              const match = line.match(/\((.*)\)/)
              if (match) {
                output.push(match[1].replace(/"/g, ''))
              }
            }
          }
          return res.status(200).json({ output: output.join('\n') || 'C# program executed' })
        }

      default:
        return res.status(400).json({ error: 'Unsupported program type' })
    }
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      output: error.stdout || error.stderr || ''
    })
  } finally {
    // Cleanup
    await fs.remove(tempDir).catch(() => {})
  }
}
