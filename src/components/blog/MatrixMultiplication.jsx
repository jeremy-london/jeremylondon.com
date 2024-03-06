
import{ useState } from 'react';
import MatrixInput from './MatrixInput';


const MatrixMultiplication = () => {
  const [matrixA, setMatrixA] = useState([
    [1, 1],
    [-1, 1]
  ]);

  const [matrixB, setMatrixB] = useState([
    [1, 5, 2],
    [2, 4, 2]
  ]);

  // Function to handle changes in Matrix A
  const handleMatrixAChange = (newMatrixA) => {
    setMatrixA(newMatrixA);

    // select id codeDisplay and set its child pre code to string with A = updated
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      // Convert newMatrixA to a string in the numpy array format with spacing
      const matrixAString = 'np.array(' + JSON.stringify(newMatrixA)
      .replace(/\[/g, '[')
      .replace(/\]/g, ']')
      .replace(/,/g, ', ')
      .replace(/\],\s+\[/g, '], [') + ')';

      // Replace the A matrix in the existing code
      const existingCode = codeElement.textContent;
      const updatedCode = existingCode.replace(
        /A = np.array\(\[\[.*?\]\]\)/gs,
        `A = ${matrixAString}`
      );

      // Set the updated code to the code element
      codeElement.textContent = updatedCode;
    }
  };

  // Function to handle changes in Matrix B
  const handleMatrixBChange = (newMatrixB) => {
    setMatrixB(newMatrixB);
  
    // select id codeDisplay and set its child pre code to string with B = updated
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      // Convert newMatrixB to a string in the numpy array format with spacing
      const matrixBString = 'np.array(' + JSON.stringify(newMatrixB)
      .replace(/\[/g, '[')
      .replace(/\]/g, ']')
      .replace(/,/g, ', ')
      .replace(/\],\s+\[/g, '], [') + ')';
  
      // Replace the B matrix in the existing code
      const existingCode = codeElement.textContent;
      const updatedCode = existingCode.replace(
        /B = np.array\(\[\[.*?\]\]\)/gs,
        `B = ${matrixBString}`
      );
  
      // Set the updated code to the code element
      codeElement.textContent = updatedCode;
    }
  };

  return (
    <div id="interactiveInputs" className="flex flex-col sm:flex-row gap-2 sm:gap-5 items-center justify-center text-center mb-8 hidden">
      <span className="text-lg font-bold">Matrix A (2x2)</span>
      <MatrixInput
        columns={2}
        idPrefix="a"
        defaultValues={matrixA}
        onMatrixChange={handleMatrixAChange}
      />
      
      <span className="text-lg font-bold">Matrix B (2x3)</span>
      <MatrixInput
        columns={3}
        idPrefix="b"
        defaultValues={matrixB}
        onMatrixChange={handleMatrixBChange}
      />
    </div>
  );
};

export default MatrixMultiplication;
