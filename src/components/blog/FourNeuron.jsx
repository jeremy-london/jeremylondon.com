import MatrixInput from '@components/blog/shared/MatrixInput'
import { useEffect, useState } from 'react'

const FourNeuron = () => {
  // WB is 4x4: first 3 columns = weights; last col = bias
  const [matrixWB, setMatrixWB] = useState([
    [1, -1, 1, -1],
    [1, 1, 0, 0],
    [0, 1, 1, 1],
    [1, 0, 1, -2],
  ])

  // X is 3x1
  const [matrixX, setMatrixX] = useState([[2], [1], [3]])

  // Z and A are 4x1
  const [matrixZ, setMatrixZ] = useState([[0], [0], [0], [0]])
  const [matrixA, setMatrixA] = useState([[0], [0], [0], [0]])

  // ---------- helpers ----------
  const toNpArray1D = (arr /* [a,b,c] */) => `np.array([${arr.join(', ')}])`
  const toNpArray2D = (m /* [[...],[...]] */) =>
    'np.array([\n' +
    m.map((row) => `  [${row.join(', ')}]`).join(',\n') +
    '\n])'

  // Replace weights/biases in a code string (tolerant patterns)
  const replaceWeightsBiases = (src, wb /* 4x4 */) => {
    const weights = wb.map((row) => row.slice(0, 3)) // 4x3
    const biases = wb.map((row) => row[3]) // 4

    const weightsPattern =
      /weights\s*=\s*np\.array\(\s*\[\s*(?:\[[^\]]*]\s*,?\s*)+]\s*\)/gms
    const biasesPattern = /biases\s*=\s*np\.array\(\s*\[[^\]]*]\s*\)/gms

    const weightsString = `weights = ${toNpArray2D(weights)}`
    const biasesString = `biases = ${toNpArray1D(biases)}`

    let out = src.replace(weightsPattern, weightsString)
    out = out.replace(biasesPattern, biasesString)
    return out
  }

  // Replace inputs in a code string
  const replaceInputs = (src, x /* [[2],[1],[3]] */) => {
    const flat = x.flat() // -> [2,1,3]
    const inputsPattern = /inputs\s*=\s*np\.array\(\s*\[[^\]]*]\s*\)/gms
    const inputsString = `inputs = ${toNpArray1D(flat)}`
    return src.replace(inputsPattern, inputsString)
  }

  // Push updated code into PythonModule & run it
  const updateCodeAndRun = (nextCode) => {
    if (typeof window.setPythonCode === 'function') {
      window.setPythonCode(nextCode, { run: true })
    } else if (typeof window.executePython === 'function') {
      window.executePython(nextCode)
    }
  }

  // ---------- output parsing ----------
  // Accepts outputs like:
  // Outputs before ReLU activation:
  //  [np.int32(-1), np.int32(3), np.int32(5), np.int32(3)]
  // Outputs after ReLU activation: ...
  //  [np.float64(0), 3, 5, 3]
  function extractReLUValues(text) {
    // Grab the inner list text (between the first '[' and matching ']')
    const beforeMatch = text.match(
      /Outputs before ReLU activation:\s*\[([\s\S]*?)\]/m,
    )
    const afterMatch = text.match(
      /Outputs after ReLU activation:[\s\S]*?\[([\s\S]*?)\]/m,
    )

    const parseNumericList = (listStr) => {
      if (!listStr) return []
      const vals = []
      // Matches either np.dtype(NUM) or a bare number (int/float, optional exponent), with optional signs
      const re =
        /np\.\w+\s*\(\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*\)|([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)/g
      let m
      while ((m = re.exec(listStr)) !== null) {
        const s = m[1] ?? m[2]
        if (s != null && s !== '') {
          const n = Number(s)
          if (Number.isFinite(n)) vals.push(n)
        }
      }
      return vals
    }

    const zVals = parseNumericList(beforeMatch?.[1])
    const aVals = parseNumericList(afterMatch?.[1])

    return {
      matrixZ: zVals.length ? zVals.map((v) => [v]) : [],
      matrixA: aVals.length ? aVals.map((v) => [v]) : [],
    }
  }

  // listen for python output events → populate Z and A
  useEffect(() => {
    const handler = (event) => {
      const txt = typeof event.detail === 'string' ? event.detail : ''
      const { matrixZ: z, matrixA: a } = extractReLUValues(txt)
      if (z.length === 4) setMatrixZ(z)
      if (a.length === 4) setMatrixA(a)
    }
    window.addEventListener('pythonOutputChanged', handler)
    return () => window.removeEventListener('pythonOutputChanged', handler)
  }, [extractReLUValues])

  // ---------- handlers ----------
  const handleMatrixWBChange = (newWB) => {
    setMatrixWB(newWB)

    // read current code from PythonModule
    const base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return

    const updated = replaceWeightsBiases(base, newWB)
    updateCodeAndRun(updated)
  }

  const handleMatrixXChange = (newX) => {
    setMatrixX(newX)

    const base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return

    const updated = replaceInputs(base, newX)
    updateCodeAndRun(updated)
  }

  return (
    <div
      id="interactiveInputs"
      className="mb-4 grid hidden grid-cols-[2fr_1fr_1fr] grid-rows-[1fr_1fr] place-items-center gap-2 rounded-md bg-[#e9e9e9] p-1 text-[#d0d0d0] sm:gap-4 sm:p-2 md:gap-6 lg:gap-8 dark:bg-[#292929] dark:text-[#f5f2f0]"
    >
      <div className="bg-transparent"></div>

      {/* Input X (3x1) */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Input
        </span>
        <MatrixInput
          columns={1}
          idPrefix="x"
          defaultValues={matrixX}
          onMatrixChange={handleMatrixXChange}
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-40 dark:text-white">3</span>
      </div>

      <div className="bg-transparent"></div>

      {/* Weights & Bias (4x4) */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Weight and Bias
        </span>
        <MatrixInput
          columns={4}
          idPrefix="w"
          defaultValues={matrixWB}
          onMatrixChange={handleMatrixWBChange}
          width="w-full sm:w-auto"
        />
      </div>

      {/* Z (4x1) */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Z
        </span>
        <MatrixInput
          columns={1}
          idPrefix="z"
          defaultValues={matrixZ}
          onMatrixChange={setMatrixZ}
          disabled
          width="w-full sm:w-auto"
        />
      </div>

      {/* A (4x1) */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          A
        </span>
        <MatrixInput
          columns={1}
          idPrefix="A"
          defaultValues={matrixA}
          onMatrixChange={setMatrixA}
          disabled
          width="w-full sm:w-auto"
        />
      </div>
    </div>
  )
}

export default FourNeuron
