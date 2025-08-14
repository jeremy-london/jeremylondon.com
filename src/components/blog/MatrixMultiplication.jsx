import MatrixInput from '@components/blog/shared/MatrixInput'
import { useEffect, useState } from 'react'

const MatrixMultiplication = () => {
  const [matrixA, setMatrixA] = useState([
    [1, 1],
    [-1, 1],
  ])
  const [matrixB, setMatrixB] = useState([
    [1, 5, 2],
    [2, 4, 2],
  ])
  const [matrixC, setMatrixC] = useState([
    [0, 0, 0],
    [0, 0, 0],
  ])

  const toNpArray = (m) =>
    'np.array(' +
    JSON.stringify(m)
      .replace(/\[/g, '[')
      .replace(/\]/g, ']')
      .replace(/,/g, ', ')
      .replace(/\],\s+\[/g, '], [') +
    ')'

  const replaceMatrix = (src, which, matrixString) => {
    const patterns = {
      A: /A\s*=\s*np\.array\(\s*\[\[.*?\]\]\s*\)/gs,
      B: /B\s*=\s*np\.array\(\s*\[\[.*?\]\]\s*\)/gs,
    }
    return src.replace(patterns[which], `${which} = ${matrixString}`)
  }

  const updateCodeAndRun = (nextCode) => {
    if (typeof window.setPythonCode === 'function') {
      window.setPythonCode(nextCode, { run: true })
    } else if (typeof window.executePython === 'function') {
      window.executePython(nextCode)
    }
  }

  const handleMatrixAChange = (newA) => {
    setMatrixA(newA)
    const base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return
    const updated = replaceMatrix(base, 'A', toNpArray(newA))
    updateCodeAndRun(updated)
  }

  const handleMatrixBChange = (newB) => {
    setMatrixB(newB)
    const base =
      (typeof window.getPythonCode === 'function' && window.getPythonCode()) ||
      ''
    if (!base) return
    const updated = replaceMatrix(base, 'B', toNpArray(newB))
    updateCodeAndRun(updated)
  }

  useEffect(() => {
    const handler = (event) => {
      const matrixString = event.detail
      const extracted = extractMatrixFromString(matrixString)
      if (extracted.length) setMatrixC(extracted)
    }
    window.addEventListener('pythonOutputChanged', handler)
    return () => window.removeEventListener('pythonOutputChanged', handler)
  }, [extractMatrixFromString])

  function extractMatrixFromString(str) {
    const match = str.match(/Matrix A \* Matrix B:\n\s*\[\[(.*?)\]\]/s)
    if (!match || !match[1]) return []
    const rows = match[1].split(']\n [')
    return rows.map((row) => row.trim().split(/\s+/).map(Number))
  }

  return (
    <div
      id="interactiveInputs"
      className="mb-4 grid hidden grid-cols-[2fr_3fr] grid-rows-[2fr_1fr] gap-2 rounded-md bg-[#e9e9e9] pt-4 pr-2 pb-8 pl-2 text-[#d0d0d0] sm:gap-4 sm:pr-0 sm:pl-4 dark:bg-[#292929] dark:text-[#f5f2f0]"
    >
      <div className="bg-transparent"></div>

      <div className="flex flex-col items-center justify-center px-4">
        <span className="text-center text-lg font-bold text-black dark:text-white">
          Matrix B (2x3)
        </span>
        <MatrixInput
          columns={3}
          idPrefix="b"
          defaultValues={matrixB}
          onMatrixChange={handleMatrixBChange}
        />
      </div>

      <div className="flex flex-col items-center justify-center">
        <span className="text-center text-lg font-bold text-black dark:text-white">
          Matrix A (2x2)
        </span>
        <MatrixInput
          columns={2}
          idPrefix="a"
          defaultValues={matrixA}
          onMatrixChange={handleMatrixAChange}
        />
      </div>

      <div className="flex flex-col items-center justify-center px-4">
        <span className="text-center text-lg font-bold text-black dark:text-white">
          Matrix C (2x3)
        </span>
        <MatrixInput
          columns={3}
          idPrefix="C"
          defaultValues={matrixC}
          disabled
        />
      </div>
    </div>
  )
}

export default MatrixMultiplication
