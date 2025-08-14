import MatrixInput from '@components/blog/shared/MatrixInput'
import { useCallback, useEffect, useState } from 'react'

const BackPropagation = () => {
  // ---------- input / forward-pass state ----------
  const [matrixX, setMatrixX] = useState([[2], [1], [3]])

  const [matrixW1, setMatrixW1] = useState([
    [1, -1, 1, -5],
    [1, 1, 0, 0],
    [0, 1, 1, 1],
    [1, 0, 1, -2],
  ])
  const [matrixZ1, setMatrixZ1] = useState([[-1], [3], [5], [3]])
  const [matrixA1, setMatrixA1] = useState([[0], [3], [5], [3]])

  const [matrixW2, setMatrixW2] = useState([
    [1, 1, -1, 0, 0],
    [0, 1, -1, 1, 3],
  ])
  const [matrixZ2, setMatrixZ2] = useState([[2], [4]])
  const [matrixA2, setMatrixA2] = useState([[2], [4]])

  const [matrixW3, setMatrixW3] = useState([
    [2, 0, -1],
    [0, 2, -5],
    [1, 1, 1],
  ])
  const [matrixZ3, setMatrixZ3] = useState([[3], [3], [-1]])

  const [matrixYp, setMatrixYp] = useState([[0.5], [0.5], [0]])
  const [matrixYt, setMatrixYt] = useState([[0], [1], [0]])

  // ---------- gradients ----------
  const [matrixTargetGradient, setMatrixTargetGradient] = useState([
    [0.5, -0.5, 0],
  ])
  const [matrixL3Gradients, setMatrixL3Gradients] = useState([[1, -1]])
  const [matrixL2Gradients, setMatrixL2Gradients] = useState([[1, -2, 2, -1]])
  const [matrixL1Gradients, setMatrixL1Gradients] = useState([[0, -2, 2, -1]])

  // ---------- “new” weights after applying grads (display only) ----------
  const [newMatrixW3, setNewMatrixW3] = useState([
    [1, -1, 0],
    [2, -2, 0],
    [0.5, -0.5, 0],
  ])
  const [newMatrixW2, setNewMatrixW2] = useState([
    [0, 0],
    [3, -3],
    [5, -5],
    [3, -3],
    [1, -1],
  ])
  const [newMatrixW1, setNewMatrixW1] = useState([
    [0, -4, 4, -2],
    [0, -2, 2, -1],
    [0, -6, 6, -3],
    [0, -2, 2, -1],
  ])

  // MathJax
  useEffect(() => {
    if (typeof window?.MathJax !== 'undefined') {
      window.MathJax.typeset()
    }
  }, [])

  // ---------- helpers: numpy string builders ----------
  const toNpArray1D = (arr) => `np.array([${arr.join(', ')}])`
  const toNpArray2DInline = (m) =>
    `np.array([${m
      .map((row, i) => `${i ? ' ' : ''}[${row.join(', ')}]`)
      .join(', ')}])`

  const getBaseCode = () =>
    (typeof window.getPythonCode === 'function' && window.getPythonCode()) || ''

  const setAndRun = useCallback((nextCode) => {
    if (typeof window.setPythonCode === 'function') {
      window.setPythonCode(nextCode, { run: true })
    } else if (typeof window.executePython === 'function') {
      window.executePython(nextCode)
    }
  }, [])

  // ---------- tolerant code-replacement helpers ----------
  const replaceLayer1 = (src, w1 /* 4x4: 3 weights + bias */) => {
    const W1_PAT = /W1\s*=\s*np\.array\(\s*\[\s*(?:\[[^\]]*]\s*,?\s*)+]\s*\)/gms
    const B1_PAT = /b1\s*=\s*np\.array\(\s*\[[^\]]*]\s*\)/gms
    const weights = w1.map((r) => r.slice(0, 3))
    const biases = w1.map((r) => r[3])
    return src
      .replace(W1_PAT, `W1 = ${toNpArray2DInline(weights)}`)
      .replace(B1_PAT, `b1 = ${toNpArray1D(biases)}`)
  }

  const replaceLayer2 = (src, w2 /* 2x5: 4 weights + bias */) => {
    const W2_PAT = /W2\s*=\s*np\.array\(\s*\[\s*(?:\[[^\]]*]\s*,?\s*)+]\s*\)/gms
    const B2_PAT = /b2\s*=\s*np\.array\(\s*\[[^\]]*]\s*\)/gms
    const weights = w2.map((r) => r.slice(0, 4))
    const biases = w2.map((r) => r[4])
    return src
      .replace(W2_PAT, `W2 = ${toNpArray2DInline(weights)}`)
      .replace(B2_PAT, `b2 = ${toNpArray1D(biases)}`)
  }

  const replaceLayer3 = (src, w3 /* 3x3: 2 weights + bias */) => {
    const W3_PAT = /W3\s*=\s*np\.array\(\s*\[\s*(?:\[[^\]]*]\s*,?\s*)+]\s*\)/gms
    const B3_PAT = /b3\s*=\s*np\.array\(\s*\[[^\]]*]\s*\)/gms
    const weights = w3.map((r) => r.slice(0, 2))
    const biases = w3.map((r) => r[2])
    return src
      .replace(W3_PAT, `W3 = ${toNpArray2DInline(weights)}`)
      .replace(B3_PAT, `b3 = ${toNpArray1D(biases)}`)
  }

  const replaceX = (src, X /* 3x1 */) => {
    // Accept any whitespace/newlines for a 3-row column vector
    const X_PAT =
      /X\s*=\s*np\.array\(\s*\[\s*\[\s*.*?\s*]\s*,\s*\[\s*.*?\s*]\s*,\s*\[\s*.*?\s*]\s*]\s*\)/gms
    const xString = `X = np.array([${X.map((row) => `[${row.join(', ')}]`).join(
      ', ',
    )}])`
    return src.replace(X_PAT, xString)
  }

  const replaceYpred = (src, Yp /* 3x1 */) => {
    const YP_PAT = /Y_pred\s*=\s*np\.array\(\s*\[[^\]]*]\s*\)/gms
    const s = `Y_pred = np.array([${Yp.map((r) => `${r.join(', ')}`).join(
      ', ',
    )}])`
    return src.replace(YP_PAT, s)
  }

  const replaceYtarget = (src, Yt /* 3x1 */) => {
    const YT_PAT = /Y_target\s*=\s*np\.array\(\s*\[[^\]]*]\s*\)/gms
    const s = `Y_target = np.array([${Yt.map((r) => `${r.join(', ')}`).join(
      ', ',
    )}])`
    return src.replace(YT_PAT, s)
  }

  // ---------- parsing helpers ----------
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

  const combineBiasAndWeights = useCallback((biasArray, weightsMatrix) => {
    // Append bias rows after weight rows (matches your display format)
    return [...weightsMatrix, ...biasArray]
  }, [])

  const extractValues = useCallback((str) => {
    // forward activations / pre-activations
    const z3Regex = /z3:\n\s*\[([\s\S]*?)\]/m
    const z2Regex = /z2:\n\s*\[([\s\S]*?)\]/m
    const a2Regex = /a2:\n\s*\[([\s\S]*?)\]/m
    const z1Regex = /z1:\n\s*\[([\s\S]*?)\]/m
    const a1Regex = /a1:\n\s*\[([\s\S]*?)\]/m

    // grads
    const db3Regex = /∂L\/∂b3:\n\s*\[([\s\S]*?)\]/m
    const dW3Regex = /∂L\/∂W3:\n\s*\[\[([\s\S]*?)\]\]/m
    const db2Regex = /∂L\/∂b2:\n\s*\[([\s\S]*?)\]/m
    const dW2Regex = /∂L\/∂W2:\n\s*\[\[([\s\S]*?)\]\]/m
    const db1Regex = /∂L\/∂b1:\n\s*\[([\s\S]*?)\]/m
    const dW1Regex = /∂L\/∂W1:\n\s*\[\[([\s\S]*?)\]\]/m

    const db3Values = parseMultiDimensionalValues(str.match(db3Regex))
    const dW3Matrix = parseMultiDimensionalValues(str.match(dW3Regex))
    const db2Values = parseMultiDimensionalValues(str.match(db2Regex))
    const dW2Matrix = parseMultiDimensionalValues(str.match(dW2Regex))
    const db1Values = parseMultiDimensionalValues(str.match(db1Regex))
    const dW1Matrix = parseMultiDimensionalValues(str.match(dW1Regex))

    const matrixZ3 = parseMultiDimensionalValues(str.match(z3Regex))
    const matrixZ2 = parseMultiDimensionalValues(str.match(z2Regex))
    const matrixA2 = parseMultiDimensionalValues(str.match(a2Regex))
    const matrixZ1 = parseMultiDimensionalValues(str.match(z1Regex))
    const matrixA1 = parseMultiDimensionalValues(str.match(a1Regex))

    return {
      db3Values,
      dW3Matrix,
      db2Values,
      dW2Matrix,
      db1Values,
      dW1Matrix,
      matrixZ3,
      matrixZ2,
      matrixA2,
      matrixZ1,
      matrixA1,
    }
  }, [])

  // Listen for Python output → update UI
  useEffect(() => {
    const handler = (event) => {
      const matrixString = String(event.detail ?? '')
      const {
        db3Values,
        dW3Matrix,
        db2Values,
        dW2Matrix,
        db1Values,
        dW1Matrix,
        matrixZ3,
        matrixZ2,
        matrixA2,
        matrixZ1,
        matrixA1,
      } = extractValues(matrixString)

      // forward values
      if (matrixZ3.length) setMatrixZ3(matrixZ3)
      if (matrixZ2.length) setMatrixZ2(matrixZ2)
      if (matrixA2.length) setMatrixA2(matrixA2)
      if (matrixZ1.length) setMatrixZ1(matrixZ1)
      if (matrixA1.length) setMatrixA1(matrixA1)

      // partial derivatives (kept same mapping as your original)
      if (db1Values.length) {
        setMatrixL1Gradients(db1Values)
        setMatrixL2Gradients(db1Values)
      }
      if (db2Values.length) setMatrixL3Gradients(db2Values)
      if (db3Values.length) setMatrixTargetGradient(db3Values)

      // “new” W’ matrices (bias row(s) appended after weights)
      if (dW3Matrix.length || db3Values.length) {
        setNewMatrixW3(combineBiasAndWeights(db3Values, dW3Matrix))
      }
      if (dW2Matrix.length || db2Values.length) {
        setNewMatrixW2(combineBiasAndWeights(db2Values, dW2Matrix))
      }
      if (dW1Matrix.length || db1Values.length) {
        setNewMatrixW1(combineBiasAndWeights(db1Values, dW1Matrix))
      }
    }

    window.addEventListener('pythonOutputChanged', handler)
    return () => window.removeEventListener('pythonOutputChanged', handler)
  }, [extractValues, combineBiasAndWeights])

  // ---------- matrix change handlers (patch python code & run) ----------
  const handleMatrixW1Change = (newW1) => {
    setMatrixW1(newW1)
    const base = getBaseCode()
    if (!base) return
    setAndRun(replaceLayer1(base, newW1))
  }

  const handleMatrixW2Change = (newW2) => {
    setMatrixW2(newW2)
    const base = getBaseCode()
    if (!base) return
    setAndRun(replaceLayer2(base, newW2))
  }

  const handleMatrixW3Change = (newW3) => {
    setMatrixW3(newW3)
    const base = getBaseCode()
    if (!base) return
    setAndRun(replaceLayer3(base, newW3))
  }

  const handleMatrixYpChange = (newYp) => {
    setMatrixYp(newYp)
    const base = getBaseCode()
    if (!base) return
    setAndRun(replaceYpred(base, newYp))
  }

  const handleMatrixYtChange = (newYt) => {
    setMatrixYt(newYt)
    const base = getBaseCode()
    if (!base) return
    setAndRun(replaceYtarget(base, newYt))
  }

  const handleMatrixXChange = (newX) => {
    setMatrixX(newX)
    const base = getBaseCode()
    if (!base) return
    setAndRun(replaceX(base, newX))
  }

  // ---------- math labels ----------
  const dL_db3 =
    '\\[ \\frac{\\partial L}{\\partial b_3} = \\frac{\\partial L}{\\partial z_3} \\]'
  const dL_dW3 = '\\[ \\frac{\\partial L}{\\partial W_3} \\]'
  const dL_dz3_full =
    '\\[ \\frac{\\partial L}{\\partial z_3} = Y^{\\text{pred}} - Y^{\\text{target}} \\]'
  const dL_dz3 = '\\[ \\frac{\\partial L}{\\partial z_3} \\]'

  const dL_db2 =
    '\\[ \\frac{\\partial L}{\\partial b_2} = \\frac{\\partial L}{\\partial z_2} \\]'
  const dL_dW2 = '\\[ \\frac{\\partial L}{\\partial W_2} \\]'
  const dL_da2 = '\\[ \\frac{\\partial L}{\\partial a_2} \\]'
  const dL_dz2 =
    '\\[ \\frac{\\partial L}{\\partial a_2} = \\frac{\\partial L}{\\partial z_2} \\]'

  const dL_db1 =
    '\\[ \\frac{\\partial L}{\\partial b_1} = \\frac{\\partial L}{\\partial z_1} \\]'
  const dL_dW1 = '\\[ \\frac{\\partial L}{\\partial W_1} \\]'
  const dL_da1 = '\\[ \\frac{\\partial L}{\\partial a_1} \\ ]'
  const dL_dz1_full =
    '\\[ \\frac{\\partial L}{\\partial b_1} = \\frac{\\partial L}{\\partial z_1} \\]'
  const dL_dz1 = '\\[ \\frac{\\partial L}{\\partial z_1} \\]'

  return (
    <div
      id="backpropInteractiveInputs" // unique to avoid collisions
      className="grid-rows-auto mb-4 grid grid-cols-4 place-items-center gap-2 rounded-md bg-[#e9e9e9] p-4 text-[#d0d0d0] sm:gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_0.8fr] dark:bg-[#292929] dark:text-[#f5f2f0]"
    >
      {/* Input Layer */}
      <div className="col-span-4 text-center sm:col-span-2">
        <span className="text-base font-bold text-black lg:text-lg dark:text-white">
          Input
        </span>
        <MatrixInput
          columns={1}
          idPrefix="x"
          defaultValues={matrixX}
          onMatrixChange={handleMatrixXChange}
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-40 dark:text-white">1</span>
      </div>
      <div className="col-span-4 text-center sm:col-span-2">
        <span className="text-base font-bold text-black dark:text-white">
          New Layer 1 W/B
        </span>
        <MatrixInput
          columns={4}
          idPrefix="W'"
          defaultValues={newMatrixW1}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="hidden text-base font-bold text-black md:block lg:text-lg dark:text-white">
        {dL_dW1}
        {dL_db1}
      </div>

      {/* Back Prop 1 */}
      <div className="col-span-1 sm:bg-transparent"></div>
      <div className="col-span-1 sm:bg-transparent"></div>
      <div className="col-span-4 text-center sm:col-span-2">
        <span className="text-base font-bold text-black sm:hidden lg:text-lg dark:text-white">
          {dL_dz1_full}
        </span>
        <span className="hidden text-base font-bold text-black sm:block lg:text-lg dark:text-white">
          {dL_dz1}
        </span>
        <MatrixInput
          columns={4}
          idPrefix="dL_dz1"
          defaultValues={matrixL1Gradients}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="hidden md:col-span-1 md:block md:bg-transparent"></div>

      {/* Layer 1 */}
      <div className="col-span-4 text-center sm:col-span-1">
        <span className="text-base font-bold text-black lg:text-lg dark:text-white">
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
      <div className="col-span-1 text-center sm:col-span-1">
        <span className="text-base font-bold text-black lg:text-lg dark:text-white">
          Z1
        </span>
        <MatrixInput
          columns={1}
          idPrefix="z1"
          defaultValues={matrixZ1}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="col-span-1 text-center sm:col-span-1">
        <span className="text-base font-bold text-black lg:text-lg dark:text-white">
          A1
        </span>
        <MatrixInput
          columns={1}
          idPrefix="a1"
          defaultValues={matrixA1}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-40 dark:text-white">1</span>
      </div>
      <div className="col-span-2 text-center sm:col-span-1">
        <span className="text-base font-bold text-black dark:text-white">
          New Layer 2 W/B
        </span>
        <MatrixInput
          columns={2}
          idPrefix="w2'"
          defaultValues={newMatrixW2}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="hidden text-base font-bold text-black md:block lg:text-lg dark:text-white">
        {dL_dW2}
        {dL_db2}
      </div>

      {/* Back Prop 2 */}
      <div className="col-span-2 text-center md:col-span-1">
        <span className="text-base font-bold text-black lg:text-lg dark:text-white">
          {dL_da1}
        </span>
        <MatrixInput
          columns={4}
          idPrefix="dL_da1"
          defaultValues={matrixL2Gradients}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="hidden sm:col-span-1 sm:block sm:bg-transparent md:col-span-2"></div>
      <div className="col-span-2 text-center sm:col-span-1 md:col-span-1 lg:col-span-1">
        <span className="text-base font-bold text-black lg:text-lg dark:text-white">
          {dL_dz2}
        </span>
        <MatrixInput
          columns={2}
          idPrefix="dL_dz2"
          defaultValues={matrixL3Gradients}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="hidden md:col-span-1 md:block md:bg-transparent"></div>

      {/* Layer 2 */}
      <div className="col-span-4 text-center sm:col-span-1 md:col-span-1">
        <span className="text-base font-bold text-black lg:text-lg dark:text-white">
          Layer 2 W/B
        </span>
        <MatrixInput
          columns={5}
          idPrefix="w2"
          defaultValues={matrixW2}
          onMatrixChange={handleMatrixW2Change}
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="col-span-2 text-center sm:col-span-1">
        <span className="text-base font-bold text-black lg:text-lg dark:text-white">
          Z2
        </span>
        <MatrixInput
          columns={1}
          idPrefix="z2"
          defaultValues={matrixZ2}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="col-span-2 text-center sm:col-span-1">
        <span className="text-base font-bold text-black lg:text-lg dark:text-white">
          A2
        </span>
        <MatrixInput
          columns={1}
          idPrefix="a2"
          defaultValues={matrixA2}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-40 dark:text-white">1</span>
      </div>
      <div className="col-span-4 text-center sm:col-span-1">
        <span className="text-base font-bold text-black dark:text-white">
          New Layer 3 W/B
        </span>
        <MatrixInput
          columns={3}
          idPrefix="w3'"
          defaultValues={newMatrixW3}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="hidden text-base font-bold text-black md:block lg:text-lg dark:text-white">
        {dL_dW3}
        {dL_db3}
      </div>

      {/* Back Prop 3 */}
      <div className="col-span-2 text-center md:col-span-1">
        <span className="text-base font-bold text-black lg:text-lg dark:text-white">
          {dL_da2}
        </span>
        <MatrixInput
          columns={2}
          idPrefix="dl_da2"
          defaultValues={matrixL3Gradients}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="hidden md:col-span-2 md:block md:bg-transparent"></div>
      <div className="col-span-2 text-center md:col-span-1">
        <span className="hidden text-base font-bold text-black sm:block lg:text-lg dark:text-white">
          {dL_dz3_full}
        </span>
        <span className="text-base font-bold text-black sm:hidden lg:text-lg dark:text-white">
          {dL_dz3}
        </span>
        <MatrixInput
          columns={3}
          idPrefix="dL_dz3"
          defaultValues={matrixTargetGradient}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="col-span-1 md:bg-transparent"></div>

      {/* Layer 3 */}
      <div className="col-span-4 text-center md:col-span-1">
        <span className="text-base font-bold text-black md:my-8 md:block lg:text-lg dark:text-white">
          Layer 3 W/B
        </span>
        <MatrixInput
          columns={3}
          idPrefix="w3"
          defaultValues={matrixW3}
          onMatrixChange={handleMatrixW3Change}
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="col-span-2 text-center sm:col-span-1">
        <span className="text-base font-bold text-black md:my-8 md:block lg:text-lg dark:text-white">
          Z3
        </span>
        <MatrixInput
          columns={1}
          idPrefix="z3"
          defaultValues={matrixZ3}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="col-span-1 text-center">
        <span className="text-base font-bold text-black md:my-8 md:block lg:text-lg dark:text-white">
          Y<sup>pred</sup>
        </span>
        <MatrixInput
          columns={1}
          idPrefix="Yp"
          defaultValues={matrixYp}
          onMatrixChange={handleMatrixYpChange}
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
      <div className="col-span-1 text-center">
        <span className="text-base font-bold text-black md:my-8 md:block lg:text-lg dark:text-white">
          Y<sup>target</sup>
        </span>
        <MatrixInput
          columns={1}
          idPrefix="Yt"
          defaultValues={matrixYt}
          onMatrixChange={handleMatrixYtChange}
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>

      <div className="hidden text-center sm:block">
        <span className="hidden text-base font-bold text-black sm:block lg:text-lg dark:text-white">
          {dL_dz3}
        </span>
        <span className="text-base font-bold text-black sm:hidden lg:text-lg dark:text-white">
          {dL_dz3_full}
        </span>
        <MatrixInput
          columns={1}
          idPrefix="dL_dz3_output"
          defaultValues={matrixTargetGradient}
          width="w-full sm:w-auto"
          disabled
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>
    </div>
  )
}

export default BackPropagation
