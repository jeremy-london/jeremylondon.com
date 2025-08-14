import { useEffect, useRef, useState } from 'react'
import CodeBlock from './CodeBlock'

const LOADED_IMPORTS = new Set()

function extractTopLevelImports(src) {
  const lines = src.split(/\r?\n/)
  const mods = new Set()
  for (const line of lines) {
    const l = line.trim()
    if (!l || l.startsWith('#')) continue
    if (
      l.startsWith('def ') ||
      l.startsWith('class ') ||
      l.startsWith('if ') ||
      l.startsWith('for ') ||
      l.startsWith('while ')
    )
      break

    const m1 = l.match(/^import\s+([a-zA-Z0-9_.]+)(\s+as\s+\w+)?/)
    if (m1) {
      mods.add(m1[1].split('.')[0])
      continue
    }
    const m2 = l.match(/^from\s+([a-zA-Z0-9_.]+)\s+import\s+/)
    if (m2) {
      mods.add(m2[1].split('.')[0])
    }
  }
  return Array.from(mods)
}

const PythonModule = ({ filePath }) => {
  const [pythonCode, setPythonCode] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const outputRef = useRef(null)
  const autoRanRef = useRef(false)

  const resizeTextarea = (el) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  // start tiny
  useEffect(() => {
    resizeTextarea(outputRef.current)
  }, [resizeTextarea])

  // expose code getters/setters for sibling controllers (e.g., MatrixMultiplication)
  useEffect(() => {
    window.getPythonCode = () => pythonCode
    window.setPythonCode = (newCode, { run = true } = {}) => {
      setPythonCode(newCode)
      if (run && typeof window.executePython === 'function') {
        window.executePython(newCode)
      }
    }
    return () => {
      delete window.getPythonCode
      delete window.setPythonCode
    }
  }, [pythonCode])

  // init once: wait for loader injected by Layout.astro, init runtime, fetch code
  useEffect(() => {
    let cancelled = false

    const waitFor = (
      predicate,
      { timeoutMs = 12000, intervalMs = 100, errorMessage = 'Timed out' } = {},
    ) =>
      new Promise((resolve, reject) => {
        const start = Date.now()
        const t = setInterval(() => {
          try {
            if (predicate()) {
              clearInterval(t)
              resolve()
            } else if (Date.now() - start > timeoutMs) {
              clearInterval(t)
              reject(new Error(errorMessage))
            }
          } catch (e) {
            clearInterval(t)
            reject(e)
          }
        }, intervalMs)
      })

    const showUI = () => {
      document.getElementById('interactiveInputs')?.classList.remove('hidden')
      document.getElementById('codeDisplay')?.classList.remove('hidden')
      document.getElementById('outputDisplay')?.classList.remove('hidden')
      document.getElementById('loadingDisplay')?.classList.add('hidden')
      resizeTextarea(outputRef.current)
    }

    ;(async () => {
      try {
        setLoading(true)
        await waitFor(
          () =>
            typeof window !== 'undefined' &&
            typeof window.loadPyodide === 'function',
          {
            errorMessage:
              'Pyodide loader not found. Did you pass load_pyodide={true} to Layout.astro on this page?',
          },
        )

        if (!window.pyodide) {
          window.pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.1/full',
          })
        }

        const rawFileUrl = `https://raw.githubusercontent.com/jeremy-london/solve-by-hand/main/${filePath}`
        const resp = await fetch(rawFileUrl, { cache: 'no-store' })
        if (!resp.ok) throw new Error(`Failed to fetch code: ${resp.status}`)
        const code = await resp.text()
        if (cancelled) return

        setPythonCode(code)
        showUI()
        setReady(true)
        setError(null)
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || String(e))
          setReady(false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [filePath, resizeTextarea])

  const executePython = async (code) => {
    const py = window.pyodide
    if (!py) return

    const outputEl = outputRef.current
    if (!outputEl) return

    let firstChunk = true

    try {
      await py.runPythonAsync(`
import io, sys
class _JsTap(io.StringIO):
    def write(self, s):
        try:
            js_write(s)
        except Exception:
            pass
        return super().write(s)
_stdout_capture = _JsTap()
_prev_stdout = sys.stdout
sys.stdout = _stdout_capture
`)

      py.globals.set('js_write', (s) => {
        if (firstChunk) {
          outputEl.value = `>>>\n${s}`
          firstChunk = false
        } else {
          outputEl.value += s
        }
        resizeTextarea(outputEl)
      })

      const inner = code ?? pythonCode ?? ''
      const newImports = extractTopLevelImports(inner).filter(
        (m) => !LOADED_IMPORTS.has(m),
      )
      if (newImports.length > 0) {
        await py.loadPackagesFromImports(inner)
        newImports.forEach((m) => LOADED_IMPORTS.add(m))
      }

      await py.runPythonAsync(inner)

      if (firstChunk) {
        const captured = py.runPython('_stdout_capture.getvalue()') || ''
        outputEl.value = captured
          ? `>>>\n${captured}${captured.endsWith('\n') ? '' : '\n'}`
          : '>>>\n'
        resizeTextarea(outputEl)
      }

      setWindowPythonOutput(py.runPython('_stdout_capture.getvalue()'))
    } catch (err) {
      if (firstChunk && outputEl.value.trim() === '') {
        outputEl.value = '>>>\n'
        firstChunk = false
      }
      outputEl.value += `Error:\n${err?.toString?.() ?? String(err)}\n`
      resizeTextarea(outputEl)
    } finally {
      try {
        await window.pyodide.runPythonAsync(`
import sys
try:
    sys.stdout = _prev_stdout
except Exception:
    sys.stdout = sys.__stdout__
`)
      } catch {
        /* ignore */
      }
    }
  }

  // auto-run once when ready & code loaded
  useEffect(() => {
    if (ready && pythonCode && !autoRanRef.current) {
      autoRanRef.current = true
      executePython(pythonCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pythonCode, executePython])

  const setWindowPythonOutput = (value) => {
    ;(() => {
      let _pythonOutput = ''
      Object.defineProperty(window, 'pythonOutput', {
        configurable: true,
        enumerable: true,
        get: () => _pythonOutput,
        set: (val) => {
          _pythonOutput = val
          window.dispatchEvent(
            new CustomEvent('pythonOutputChanged', { detail: val }),
          )
        },
      })
    })()
    window.pythonOutput = value
  }

  // expose execute for external triggers
  if (typeof window !== 'undefined') {
    window.executePython = executePython
  }

  return (
    <div className="flex">
      <div className="mb-4 flex w-full flex-col">
        {loading && (
          <div
            id="loadingDisplay"
            className="flex flex-col items-center gap-4 py-8 text-center"
          >
            <span>Loading Interactive Coding Environment...</span>
            <div
              className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
            <div className="font-semibold">Pyodide failed to load</div>
            <div className="mt-1 text-sm opacity-90">{error}</div>
          </div>
        )}

        {ready && !loading && (
          <>
            <div id="codeDisplay" className="mb-4 rounded-md">
              <CodeBlock code={pythonCode} />
            </div>

            <div
              id="outputDisplay"
              className="rounded-md bg-[#e9e9e9] p-4 text-black dark:bg-[#333333] dark:text-white"
            >
              <div className="mb-0 text-black dark:text-white">Output:</div>
              <textarea
                id="output"
                ref={outputRef}
                className="h-auto w-full resize-none overflow-hidden bg-[#e9e9e9] p-0 text-black dark:bg-[#333333] dark:text-white"
                rows={1}
                readOnly
              />
            </div>
          </>
        )}

        {/* kept for parity with your show/hide API */}
        <div id="interactiveInputs" className="hidden" />
      </div>
    </div>
  )
}

export default PythonModule
