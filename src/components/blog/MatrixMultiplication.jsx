
import{ useState, useEffect } from 'react';
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

  const [matrixC, setMatrixC] = useState([
    [0, 0, 0],
    [0, 0, 0]
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

  useEffect(() => {
    // Define the event listener function
    const handlePythonOutputChange = (event) => {
      const matrixString = event.detail;

      // Extract the matrix values from the string
      const extractedMatrix = extractMatrixFromString(matrixString);

      // Update matrixC state with the extracted matrix
      setMatrixC(extractedMatrix);
    };

    // Add event listener when the component mounts
    window.addEventListener('pythonOutputChanged', handlePythonOutputChange);

    // Return a cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('pythonOutputChanged', handlePythonOutputChange);
    };
  }, []); // The empty array ensures this effect runs only once after the initial render

  // Function to extract matrix from the string
  function extractMatrixFromString(str) {
    // First, isolate the matrix portion of the string using a more targeted regex
    const matrixMatch = str.match(/Matrix A \* Matrix B:\n \[\[(.*?)\]\]/s);
    if (matrixMatch && matrixMatch[1]) {
      // Extract the matrix numbers as a single string
      const matrixNumbers = matrixMatch[1];
      // Split the string into rows based on ']\n [' pattern
      const matrixRows = matrixNumbers.split(']\n [');
      // Map each row string to an array of numbers
      const matrix = matrixRows.map(row =>
        row
          .trim() // Trim whitespace
          .split(/\s+/) // Split by one or more spaces
          .map(Number) // Convert each element to a number
      );
      return matrix;
    }
    return []; // Return an empty array if the pattern is not matched
  }
  
  
  return (
    <div id="interactiveInputs" className="hidden grid grid-rows-[2fr_1fr] grid-cols-[2fr_3fr] gap-2 sm:gap-4 mb-4 pt-4 pr-2 sm:pr-0 pl-2 sm:pl-4 pb-8 rounded-md bg-[#e9e9e9] dark:bg-[#292929] text-[#d0d0d0] dark:text-[#f5f2f0]" >
    
      <div className="bg-transparent"></div> 

      <div className="flex flex-col items-center justify-center px-4">
        <span className="text-lg font-bold text-black dark:text-white text-center">Matrix B (2x3)</span>
        <MatrixInput
          columns={3}
          idPrefix="b"
          defaultValues={matrixB}
          onMatrixChange={handleMatrixBChange}
        />
      </div>

      <div className="flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-black dark:text-white text-center">Matrix A (2x2)</span>
        <MatrixInput
          columns={2}
          idPrefix="a"
          defaultValues={matrixA}
          onMatrixChange={handleMatrixAChange}
        />
      </div>

      <div className="flex flex-col items-center justify-center px-4">
        <span className="text-lg font-bold text-black dark:text-white text-center">Matrix C (2x3)</span>
          <MatrixInput
            columns={3}
            idPrefix="C"
            defaultValues={matrixC}
            disabled
          />
      </div>
    </div>

  );
};

export default MatrixMultiplication;
