import MatrixInput from '@components/blog/shared/MatrixInput'
import { useCallback, useEffect, useState } from 'react'

const SingleNeuron = () => {
  // Gate UI until PythonModule exposes its API
  const [uiReady, setUiReady] = useState(false)
  useEffect(() => {
    let alive = true
    const until = Date.now() + 15000
    const tick = () => {
      if (!alive) return
      const hasAPI =
        typeof window !== 'undefined' &&
        (typeof window.setPythonCode === 'function' ||
          typeof window.executePython === 'function')
      if (hasAPI) setUiReady(true)
      else if (Date.now() < until) requestAnimationFrame(tick)
    }
    tick()
    return () => {
      alive = false
    }
  }, [])

  // -------- state --------
  const [matrixWB, setMatrixWB] = useState([[1, -1, 1, -5]]) // [w1,w2,w3,b]
  const [matrixX, setMatrixX] = useState([[2], [1], [3]]) // 3x1 UI
  const [matrixZ, setMatrixZ] = useState([[0]]) // 1x1
  const [matrixA, setMatrixA] = useState([[0]]) // 1x1

  // -------- helpers: python code I/O --------
  const getBaseCode = () =>
    (typeof window.getPythonCode === 'function' && window.getPythonCode()) || ''

  const setAndRun = useCallback((next) => {
    if (typeof window.setPythonCode === 'function') {
      window.setPythonCode(next, { run: true })
    } else if (typeof window.executePython === 'function') {
      window.executePython(next)
    }
  }, [])

  // -------- precise patchers (surgical replacements) --------
  // Replace ONLY the inside of np.array(...) for a given variable name.
  const patchArrayLiteral = (src, varName, jsValue /* 1D or 2D */) => {
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const assignRe = new RegExp(
      `\\b${esc(varName)}\\s*=\\s*np\\.array\\s*\\(`,
      'm',
    )
    const m = assignRe.exec(src)
    if (!m) return src

    // Walk to matching ')'
    const i = m.index + m[0].length - 1 // at '('
    let depth = 0
    let end = -1
    for (let k = i; k < src.length; k++) {
      const ch = src[k]
      if (ch === '(') depth++
      else if (ch === ')') {
        depth--
        if (depth === 0) {
          end = k
          break
        }
      }
    }
    if (end === -1) return src

    // Preserve any trailing same-line comment after ')'
    let lineEnd = src.indexOf('\n', end)
    if (lineEnd === -1) lineEnd = src.length
    const afterParen = src.slice(end + 1, lineEnd)

    const buildNp = (val) => {
      if (Array.isArray(val[0])) {
        const rows = val.map((row) => `[${row.join(', ')}]`).join(', ')
        return `[${rows}]`
      } else {
        return `[${val.join(', ')}]`
      }
    }

    const newInner = buildNp(jsValue)
    const before = src.slice(0, i + 1)
    const after = src.slice(end)
    const replaced = `${before}${newInner}${after}`

    return replaced.slice(0, end + 1) + afterParen + src.slice(lineEnd)
  }

  // Replace ONLY the numeric literal in a scalar assignment: e.g. "bias = -5  # ...".
  const patchScalarLiteral = (src, varName, numValue) => {
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const lineRe = new RegExp(
      `^(\\s*${esc(
        varName,
      )}\\s*=\\s*)([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)(.*)$`,
      'm',
    )
    const m = lineRe.exec(src)
    if (!m) return src
    const start = m.index
    const end = start + m[0].length
    const newLine = `${m[1]}${String(numValue)}${m[3]}`
    return src.slice(0, start) + newLine + src.slice(end)
  }

  // -------- output parsing --------
  useEffect(() => {
    const handler = (event) => {
      const text = String(event.detail ?? '')

      // Z (pre-activation) from "... = <number>" on the w*x+b line
      const zMatch = text.match(
        /w\*x \+ b = [^\n=]*=\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)/,
      )
      // A (post-activation) from "ReLU: <z> → <a> ..."
      const reluMatch = text.match(
        /ReLU:\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*→\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)/u,
      )

      const zVal = zMatch
        ? Number(zMatch[1])
        : reluMatch
          ? Number(reluMatch[1])
          : null
      const aVal = reluMatch ? Number(reluMatch[2]) : null

      if (zVal !== null && Number.isFinite(zVal)) setMatrixZ([[zVal]])
      if (aVal !== null && Number.isFinite(aVal)) setMatrixA([[aVal]])
    }

    window.addEventListener('pythonOutputChanged', handler)
    return () => window.removeEventListener('pythonOutputChanged', handler)
  }, [])

  // -------- handlers: patch code precisely & run --------
  const handleMatrixWBChange = (newWB) => {
    setMatrixWB(newWB)
    const base = getBaseCode()
    if (!base) return

    const weights = newWB[0].slice(0, 3) // [w1,w2,w3]
    const bias = newWB[0][3] // scalar

    let updated = patchArrayLiteral(base, 'weights', weights)
    updated = patchScalarLiteral(updated, 'bias', bias)
    setAndRun(updated)
  }

  const handleMatrixXChange = (newX) => {
    setMatrixX(newX)
    const base = getBaseCode()
    if (!base) return
    const flat = newX.flat() // 3x1 -> [2,1,3]
    const updated = patchArrayLiteral(base, 'inputs', flat)
    setAndRun(updated)
  }

  return (
    <div
      id="singleNeuronInteractiveInputs"
      className={
        (uiReady ? '' : 'hidden ') +
        'mb-4 grid grid-cols-[2fr_3fr] grid-rows-[2fr_1fr] gap-2 rounded-md bg-[#e9e9e9] pt-4 pr-2 pb-4 pl-2 text-[#d0d0d0] sm:gap-4 sm:pr-0 sm:pl-12 lg:pl-28 dark:bg-[#292929] dark:text-[#f5f2f0]'
      }
    >
      <div className="bg-transparent"></div>

      {/* Input (3x1 UI; python 1D) */}
      <div className="flex flex-col items-center justify-center pr-28 pl-6 sm:pl-4 md:pr-52">
        <span className="text-center text-lg font-bold text-black dark:text-white">
          Input
        </span>
        <MatrixInput
          columns={1}
          idPrefix="x"
          defaultValues={matrixX}
          onMatrixChange={handleMatrixXChange}
        />
        <span className="p-2 text-black opacity-40 dark:text-white">1</span>
      </div>

      {/* Weights + Bias */}
      <div className="flex flex-col items-center justify-center">
        <span className="text-center text-lg font-bold text-black dark:text-white">
          Weight and Bias
        </span>
        <MatrixInput
          columns={4}
          idPrefix="w"
          defaultValues={matrixWB}
          onMatrixChange={handleMatrixWBChange}
        />
      </div>

      {/* Outputs Z & A (1x1) */}
      <div className="flex flex-row items-center justify-center gap-4 px-4 pt-8 xs:pt-0">
        <div className="flex flex-col items-center justify-center">
          <span className="text-center text-lg font-bold text-black dark:text-white">
            Z
          </span>
          <MatrixInput
            columns={1}
            idPrefix="z"
            defaultValues={matrixZ}
            onMatrixChange={setMatrixZ}
            disabled
          />
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-center text-lg font-bold text-black dark:text-white">
            A
          </span>
          <MatrixInput
            columns={1}
            idPrefix="A"
            defaultValues={matrixA}
            onMatrixChange={setMatrixA}
            disabled
          />
        </div>
      </div>
    </div>
  )
}

export default SingleNeuron
