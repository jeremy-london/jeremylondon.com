import MatrixInput from '@components/blog/shared/MatrixInput'
import { useCallback, useEffect, useState } from 'react'

const BatchProcessing = () => {
  // ------ state ------
  const [matrixW1, setMatrixW1] = useState([
    [1, -1, 1, -5],
    [1, 1, 0, 0],
    [0, 1, 1, 1],
    [1, 0, 1, -2],
  ])

  const [matrixW2, setMatrixW2] = useState([
    [1, 1, -1, 0, 0],
    [0, 0, 1, -1, 1],
  ])

  const [matrixX, setMatrixX] = useState([
    [2, 1, 0],
    [1, 1, 1],
    [3, 0, 1],
  ])

  const [matrixHZ, setMatrixHZ] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ])
  const [matrixHA, setMatrixHA] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ])
  const [matrixYZ, setMatrixYZ] = useState([
    [0, 0, 0],
    [0, 0, 0],
  ])
  const [matrixYA, setMatrixYA] = useState([
    [0, 0, 0],
    [0, 0, 0],
  ])

  // ------ helpers ------
  const toNpArray2DInline = (m /* [[...],[...]] */) =>
    `np.array([${m
      .map((row, i) => `${i ? ' ' : ''}[${row.join(', ')}]`)
      .join(', ')}])`

  const toNpArray1D = (arr /* [a,b,c] */) => `np.array([${arr.join(', ')}])`

  const setAndRun = useCallback((nextCode) => {
    if (typeof window.setPythonCode === 'function') {
      window.setPythonCode(nextCode, { run: true })
    } else if (typeof window.executePython === 'function') {
      window.executePython(nextCode)
    }
  }, [])

  const getBaseCode = () =>
    (typeof window.getPythonCode === 'function' && window.getPythonCode()) || ''

  // Replace W1/b1 in code (W1 is 4x3, b1 is 4)
  const replaceLayer1 = (src, w1 /* 4x4 */) => {
    const weights = w1.map((row) => row.slice(0, 3))
    const biases = w1.map((row) => row[3])
    const W1_PAT = /W1\s*=\s*np\.array\(\s*\[\s*(?:\[[^\]]*]\s*,?\s*)+]\s*\)/gms
    const B1_PAT = /b1\s*=\s*np\.array\(\s*\[[^\]]*]\s*\)/gms
    const W1_STR = `W1 = ${toNpArray2DInline(weights)}`
    const B1_STR = `b1 = ${toNpArray1D(biases)}`
    return src.replace(W1_PAT, W1_STR).replace(B1_PAT, B1_STR)
  }

  // Replace W2/b2 in code (W2 is 2x4, b2 is 2)
  const replaceLayer2 = (src, w2 /* 2x5 */) => {
    const weights = w2.map((row) => row.slice(0, 4))
    const biases = w2.map((row) => row[4])
    const W2_PAT = /W2\s*=\s*np\.array\(\s*\[\s*(?:\[[^\]]*]\s*,?\s*)+]\s*\)/gms
    const B2_PAT = /b2\s*=\s*np\.array\(\s*\[[^\]]*]\s*\)/gms
    const W2_STR = `W2 = ${toNpArray2DInline(weights)}`
    const B2_STR = `b2 = ${toNpArray1D(biases)}`
    return src.replace(W2_PAT, W2_STR).replace(B2_PAT, B2_STR)
  }

  // Replace x1, x2, x3 (each is 3x1 presented as [[a],[b],[c]])
  const replaceInputs = (src, X /* 3x3 */) => {
    // transpose columns into vectors
    const cols = X[0].map((_, c) => X.map((r) => r[c]))
    const toColVec = (col /* [a,b,c] */) =>
      `np.array([${col.map((v) => `[${v}]`).join(', ')}])`
    const X1_PAT = /x1\s*=\s*np\.array\(\s*\[\s*\[(?:.|\n)*?]\s*]\s*\)/gms
    const X2_PAT = /x2\s*=\s*np\.array\(\s*\[\s*\[(?:.|\n)*?]\s*]\s*\)/gms
    const X3_PAT = /x3\s*=\s*np\.array\(\s*\[\s*\[(?:.|\n)*?]\s*]\s*\)/gms
    return src
      .replace(X1_PAT, `x1 = ${toColVec(cols[0] || [])}`)
      .replace(X2_PAT, `x2 = ${toColVec(cols[1] || [])}`)
      .replace(X3_PAT, `x3 = ${toColVec(cols[2] || [])}`)
  }

  // ------ output parsing ------
  const parseMultiDimensionalValues = (match) => {
    if (!match || match.length < 2) return []
    const lines = match[1].trim().split('\n')
    return lines.map((line) =>
      line
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        .trim()
        .split(' ')
        .map(Number),
    )
  }

  const extractValues = useCallback((str) => {
    const hzRegex = /Hidden layer:\n\s*\[\s*\[([\s\S]*?)\]\]/m
    const haRegex = /ReLU Activated Hidden layer:\n\s*\[\s*\[([\s\S]*?)\]\]/m
    const yzRegex = /Output Layer:\n\s*\[\s*\[([\s\S]*?)\]\]/m
    const yaRegex = /ReLU Activated Output Layer:\n\s*\[\s*\[([\s\S]*?)\]\]/m

    const outputMatrixHZ = parseMultiDimensionalValues(str.match(hzRegex))
    const outputMatrixHA = parseMultiDimensionalValues(str.match(haRegex))
    const outputMatrixYZ = parseMultiDimensionalValues(str.match(yzRegex))
    const outputMatrixYA = parseMultiDimensionalValues(str.match(yaRegex))

    return { outputMatrixHZ, outputMatrixHA, outputMatrixYZ, outputMatrixYA }
  }, [])

  // listen for python output
  useEffect(() => {
    const handle = (event) => {
      const matrixString = String(event.detail ?? '')
      const { outputMatrixHZ, outputMatrixHA, outputMatrixYZ, outputMatrixYA } =
        extractValues(matrixString)

      if (outputMatrixHZ.length) setMatrixHZ(outputMatrixHZ)
      if (outputMatrixHA.length) setMatrixHA(outputMatrixHA)
      if (outputMatrixYZ.length) setMatrixYZ(outputMatrixYZ)
      if (outputMatrixYA.length) setMatrixYA(outputMatrixYA)
    }
    window.addEventListener('pythonOutputChanged', handle)
    return () => window.removeEventListener('pythonOutputChanged', handle)
  }, [extractValues])

  // ------ handlers (update code via PythonModule API) ------
  const handleMatrixW1Change = (newW1) => {
    setMatrixW1(newW1)
    const base = getBaseCode()
    if (!base) return
    const updated = replaceLayer1(base, newW1)
    setAndRun(updated)
  }

  const handleMatrixW2Change = (newW2) => {
    setMatrixW2(newW2)
    const base = getBaseCode()
    if (!base) return
    const updated = replaceLayer2(base, newW2)
    setAndRun(updated)
  }

  const handleMatrixXChange = (newX) => {
    setMatrixX(newX)
    const base = getBaseCode()
    if (!base) return
    const updated = replaceInputs(base, newX)
    setAndRun(updated)
  }

  return (
    <div
      id="interactiveInputs"
      className="mb-4 grid grid-cols-[2fr_1fr_1fr] grid-rows-[1fr_1fr_1fr] place-items-center gap-2 rounded-md bg-[#e9e9e9] p-1 text-[#d0d0d0] sm:gap-4 sm:p-6 md:gap-6 lg:gap-8 dark:bg-[#292929] dark:text-[#f5f2f0]"
    >
      <div className="sm:bg-transparent"></div>

      {/* Input */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Input
        </span>
        <MatrixInput
          columns={3}
          idPrefix="x"
          defaultValues={matrixX}
          onMatrixChange={handleMatrixXChange}
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-40 dark:text-white">1</span>
      </div>

      <div className="bg-transparent"></div>

      {/* Layer 1 W/B */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 1 W/B
        </span>
        <MatrixInput
          columns={4}
          idPrefix="w1"
          defaultValues={matrixW1}
          onMatrixChange={handleMatrixW1Change}
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>

      {/* Hidden Z */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Z
        </span>
        <MatrixInput
          columns={3}
          idPrefix="z"
          defaultValues={matrixHZ}
          onMatrixChange={setMatrixHZ}
          disabled
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>

      {/* Hidden A */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          A
        </span>
        <MatrixInput
          columns={3}
          idPrefix="A"
          defaultValues={matrixHA}
          onMatrixChange={setMatrixHA}
          disabled
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-40 dark:text-white">1</span>
      </div>

      {/* Layer 2 W/B */}
      <div className="text-center">
        <span className="w-full text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 2 W/B
        </span>
        <MatrixInput
          columns={5}
          idPrefix="w2"
          defaultValues={matrixW2}
          onMatrixChange={handleMatrixW2Change}
          width="w-full sm:w-auto"
        />
      </div>

      {/* Output Z */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Z
        </span>
        <MatrixInput
          columns={3}
          idPrefix="y_z"
          defaultValues={matrixYZ}
          onMatrixChange={setMatrixYZ}
          disabled
          width="w-full sm:w-auto"
        />
      </div>

      {/* Output A */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          A
        </span>
        <MatrixInput
          columns={3}
          idPrefix="y_a"
          defaultValues={matrixYA}
          onMatrixChange={setMatrixYA}
          disabled
          width="w-full sm:w-auto"
        />
      </div>
    </div>
  )
}

export default BatchProcessing
