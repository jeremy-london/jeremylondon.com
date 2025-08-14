import MatrixInput from '@components/blog/shared/MatrixInput'
import { useEffect, useState } from 'react'

const MultiLayerPerceptron = () => {
  const [matrixW1, setMatrixW1] = useState([
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 1],
  ])
  const [matrixW1_A, setMatrixW1_A] = useState([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ])

  const [matrixW2, setMatrixW2] = useState([
    [1, 1, -1, 0, 0],
    [0, 0, 1, 1, -1],
  ])
  const [matrixW2_A, setMatrixW2_A] = useState([
    [0, 0],
    [0, 0],
  ])

  const [matrixW3, setMatrixW3] = useState([
    [1, 1],
    [1, -1],
    [1, 2],
  ])
  const [matrixW3_A, setMatrixW3_A] = useState([
    [0, 0],
    [0, 0],
    [0, 0],
  ])

  const [matrixW4, setMatrixW4] = useState([
    [1, -1, 0],
    [0, -1, 1],
  ])
  const [matrixW4_A, setMatrixW4_A] = useState([
    [0, 0],
    [0, 0],
  ])

  const [matrixW5, setMatrixW5] = useState([
    [0, 1],
    [1, 0],
  ])
  const [matrixW5_A, setMatrixW5_A] = useState([
    [0, 0],
    [0, 0],
  ])

  const [matrixW6, setMatrixW6] = useState([
    [1, -1],
    [1, 1],
  ])
  const [matrixW6_A, setMatrixW6_A] = useState([
    [0, 0],
    [0, 0],
  ])

  const [matrixW7, setMatrixW7] = useState([[1, -1]])
  const [matrixW7_A, setMatrixW7_A] = useState([[0, 0]])

  // X is 3x2 (two input vectors stacked as columns)
  const [matrixX, setMatrixX] = useState([
    [3, 5],
    [4, 4],
    [5, 3],
  ])

  // ---------- small helpers ----------
  const toNpArray2D = (m) =>
    'np.array([\n' +
    m.map((row) => `    [${row.join(', ')}]`).join(',\n') +
    '\n])'

  // Push updated code into PythonModule & (optionally) run it
  const updateCodeAndRun = (nextCode) => {
    if (typeof window.setPythonCode === 'function') {
      window.setPythonCode(nextCode, { run: true })
    } else if (typeof window.executePython === 'function') {
      window.executePython(nextCode)
    }
  }

  // Replace a Wk = np.array([...]) block by name
  const replaceWeightsBlock = (src, name, matrix) => {
    // tolerant pattern: matches "Wk = np.array([ ... ])" across lines
    const pattern = new RegExp(
      `${name}\\s*=\\s*np\\.array\\(\\s*\\[([\\s\\S]*?)\\]\\s*\\)`,
      'm',
    )
    const replacement = `${name} = ${toNpArray2D(matrix)}`
    return src.replace(pattern, replacement)
  }

  // Replace x1/x2 definitions: expect np.array([[a], [b], [c]]) column vectors
  const replaceXColumn = (src, name, col /* [a,b,c] */) => {
    const npCol = `np.array([${col.map((v) => `[${v}]`).join(', ')}])`
    const pattern = new RegExp(
      `${name}\\s*=\\s*np\\.array\\(\\s*\\[\\s*\\[[\\s\\S]*?\\]\\s*\\]\\s*\\)`,
      'm',
    )
    return src.replace(pattern, `${name} = ${npCol}`)
  }

  // ---------- parse layer outputs from Python print ----------
  // Accepts rows with plain numbers or numpy scalars (np.int32(2), np.float64(-3.5), etc.)
  const parseMatrixFromSection = (text, label /* e.g., "Layer 1 output" */) => {
    // grab content inside the first [[ ... ]] after the label:
    const re = new RegExp(`${label}:\\s*\\[\\[([\\s\\S]*?)\\]\\]`, 'm')
    const match = text.match(re)
    if (!match) return []

    const inner = match[1]

    // split rows on "], [" variants
    const rows = inner.split(/]\s*,\s*\[|\]\s*\n\s*\[|\]\s*\s*\[/g)

    const numRe =
      /np\.\w+\s*\(\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*\)|([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)/g

    const parseRow = (rowStr) => {
      const vals = []
      let m
      while ((m = numRe.exec(rowStr)) !== null) {
        const s = m[1] ?? m[2]
        if (s !== undefined && s !== '') {
          const n = Number(s)
          if (Number.isFinite(n)) vals.push(n)
        }
      }
      return vals
    }

    const matrix = rows.map(parseRow).filter((r) => r.length > 0)
    return matrix
  }

  // Listen for python output → fill layer outputs
  useEffect(() => {
    const LAYER_LABELS = [
      'Layer 1 output',
      'Layer 2 output',
      'Layer 3 output',
      'Layer 4 output',
      'Layer 5 output',
      'Layer 6 output',
      'Layer 7 output',
    ]

    const handler = (event) => {
      const txt = typeof event.detail === 'string' ? event.detail : ''

      const out1 = parseMatrixFromSection(txt, LAYER_LABELS[0])
      const out2 = parseMatrixFromSection(txt, LAYER_LABELS[1])
      const out3 = parseMatrixFromSection(txt, LAYER_LABELS[2])
      const out4 = parseMatrixFromSection(txt, LAYER_LABELS[3])
      const out5 = parseMatrixFromSection(txt, LAYER_LABELS[4])
      const out6 = parseMatrixFromSection(txt, LAYER_LABELS[5])
      const out7 = parseMatrixFromSection(txt, LAYER_LABELS[6])

      if (out1.length) setMatrixW1_A(out1)
      if (out2.length) setMatrixW2_A(out2)
      if (out3.length) setMatrixW3_A(out3)
      if (out4.length) setMatrixW4_A(out4)
      if (out5.length) setMatrixW5_A(out5)
      if (out6.length) setMatrixW6_A(out6)
      if (out7.length) setMatrixW7_A(out7)
    }

    window.addEventListener('pythonOutputChanged', handler)
    return () => window.removeEventListener('pythonOutputChanged', handler)
  }, [parseMatrixFromSection])

  // ---------- handlers to update code ----------
  const handleMatrixW1Change = (newW) => {
    setMatrixW1(newW)
    const base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return
    updateCodeAndRun(replaceWeightsBlock(base, 'W1', newW))
  }

  const handleMatrixW2Change = (newW) => {
    setMatrixW2(newW)
    const base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return
    updateCodeAndRun(replaceWeightsBlock(base, 'W2', newW))
  }

  const handleMatrixW3Change = (newW) => {
    setMatrixW3(newW)
    const base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return
    updateCodeAndRun(replaceWeightsBlock(base, 'W3', newW))
  }

  const handleMatrixW4Change = (newW) => {
    setMatrixW4(newW)
    const base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return
    updateCodeAndRun(replaceWeightsBlock(base, 'W4', newW))
  }

  const handleMatrixW5Change = (newW) => {
    setMatrixW5(newW)
    const base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return
    updateCodeAndRun(replaceWeightsBlock(base, 'W5', newW))
  }

  const handleMatrixW6Change = (newW) => {
    setMatrixW6(newW)
    const base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return
    updateCodeAndRun(replaceWeightsBlock(base, 'W6', newW))
  }

  const handleMatrixW7Change = (newW) => {
    setMatrixW7(newW)
    const base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return
    updateCodeAndRun(replaceWeightsBlock(base, 'W7', newW))
  }

  const handleMatrixXChange = (newX) => {
    setMatrixX(newX)

    // newX is 3x2 (two column vectors)
    const cols = newX[0].map((_, ci) => newX.map((row) => row[ci])) // [[..],[..]] columns
    const [x1, x2] = cols

    let base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return

    base = replaceXColumn(base, 'x1', x1)
    base = replaceXColumn(base, 'x2', x2)

    updateCodeAndRun(base)
  }

  return (
    <div
      id="interactiveInputs"
      className="mb-4 grid grid-cols-1 grid-rows-16 place-items-center gap-2 rounded-md bg-[#e9e9e9] p-1 text-[#d0d0d0] sm:grid-cols-[2fr_auto] sm:grid-rows-8 sm:gap-8 sm:p-6 dark:bg-[#292929] dark:text-[#f5f2f0]"
    >
      <div className="sm:bg-transparent"></div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Input
        </span>
        <MatrixInput
          columns={2}
          idPrefix="x"
          defaultValues={matrixX}
          onMatrixChange={handleMatrixXChange}
          width="w-full sm:w-auto"
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 1 Weights
        </span>
        <MatrixInput
          columns={3}
          idPrefix="w1"
          defaultValues={matrixW1}
          onMatrixChange={handleMatrixW1Change}
          width="w-full sm:w-auto"
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 1 Output
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w1_a"
          defaultValues={matrixW1_A}
          onMatrixChange={setMatrixW1_A}
          width="w-full sm:w-auto"
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 2 Weights
        </span>
        <MatrixInput
          columns={5}
          idPrefix="w2"
          defaultValues={matrixW2}
          onMatrixChange={handleMatrixW2Change}
          width="w-full sm:w-auto"
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 2 Output
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w2_a"
          defaultValues={matrixW2_A}
          onMatrixChange={setMatrixW2_A}
          width="w-full sm:w-auto"
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 3 Weights
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w3"
          defaultValues={matrixW3}
          onMatrixChange={handleMatrixW3Change}
          width="w-full sm:w-auto"
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 3 Output
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w3_a"
          defaultValues={matrixW3_A}
          onMatrixChange={setMatrixW3_A}
          width="w-full sm:w-auto"
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 4 Weights
        </span>
        <MatrixInput
          columns={3}
          idPrefix="w4"
          defaultValues={matrixW4}
          onMatrixChange={handleMatrixW4Change}
          width="w-full sm:w-auto"
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 4 Output
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w4_a"
          defaultValues={matrixW4_A}
          onMatrixChange={setMatrixW4_A}
          width="w-full sm:w-auto"
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 5 Weights
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w5"
          defaultValues={matrixW5}
          onMatrixChange={handleMatrixW5Change}
          width="w-full sm:w-auto"
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 5 Output
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w5_a"
          defaultValues={matrixW5_A}
          onMatrixChange={setMatrixW5_A}
          width="w-full sm:w-auto"
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 6 Weights
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w6"
          defaultValues={matrixW6}
          onMatrixChange={handleMatrixW6Change}
          width="w-full sm:w-auto"
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 6 Output
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w6_a"
          defaultValues={matrixW6_A}
          onMatrixChange={setMatrixW6_A}
          width="w-full sm:w-auto"
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 7 Weights
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w7"
          defaultValues={matrixW7}
          onMatrixChange={handleMatrixW7Change}
          width="w-full sm:w-auto"
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 7 Output
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w7_a"
          defaultValues={matrixW7_A}
          onMatrixChange={setMatrixW7_A}
          width="w-full sm:w-auto"
          disabled
        />
      </div>
    </div>
  )
}

export default MultiLayerPerceptron
