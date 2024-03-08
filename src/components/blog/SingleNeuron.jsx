
import{ useState, useEffect } from 'react';
import MatrixInput from './MatrixInput';


const SingleNeuron = () => {
  const [matrixWB, setMatrixWB] = useState([
    [1, -1, 1, -5],
  ]);

  const [matrixX, setMatrixX] = useState([
    [2],
    [1],
    [3]
  ]);

  const [matrixZ, setMatrixZ] = useState([
    [0],
  ]);

  const [matrixA, setMatrixA] = useState([
    [0]
  ]);

  useEffect(() => {
    // Define the event listener function
    const handlePythonOutputChange = (event) => {
      const matrixString = event.detail;

      // Extract values from the string
      const { matrixZValue, matrixAValue } = extractReLUValues(event.detail);
      
      // Update your states accordingly
      if (matrixZValue !== null) setMatrixZ([[matrixZValue]]);
      if (matrixAValue !== null) setMatrixA([[matrixAValue]]);
    };

    // Add event listener when the component mounts
    window.addEventListener('pythonOutputChanged', handlePythonOutputChange);

    // Return a cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('pythonOutputChanged', handlePythonOutputChange);
    };
  }, []); // The empty array ensures this effect runs only once after the initial render

  function extractReLUValues(str) {
    // Regular expression to match the pattern "ReLU: [value] → [value]"
    const reluMatch = str.match(/ReLU: ([\-\d]+) → ([\-\d]+)/);
    if (reluMatch) {
      // Extracted values from the matched groups
      const matrixZValue = Number(reluMatch[1]); // Convert to number
      const matrixAValue = Number(reluMatch[2]); // Convert to number
      return { matrixZValue, matrixAValue };
    }
    // Return null or some default values if the pattern is not matched
    return { matrixZValue: null, matrixAValue: null };
  }
  
  // Function to handle changes in Matrix A
  const handleMatrixWBChange = (newMatrixWB) => {
    setMatrixWB(newMatrixWB);
  
    const weights = newMatrixWB[0].slice(0, 3); // Extracts the first 3 values as weights
    const bias = newMatrixWB[0][3]; // Extracts the 4th value as bias
  
    // select id codeDisplay and set its child pre code to string with weights and bias updated
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      const existingCode = codeElement.textContent;
  
      // Update weights in the code
      const updatedWeightsCode = existingCode.replace(
        /weights = np.array\(\[.*?\]\)/,
        `weights = np.array([${weights.join(', ')}])`
      );
  
      // Update bias in the code
      const updatedCode = updatedWeightsCode.replace(
        /bias = .*?  # bias should be a scalar, not an array/,
        `bias = ${bias}  # bias should be a scalar, not an array`
      );
  
      // Set the updated code to the code element
      codeElement.textContent = updatedCode;
      console.log("🚀 ~ handleMatrixWBChange ~ updatedCode:", updatedCode);
    }
  };

  // Function to handle changes in Matrix B
  const handleMatrixXChange = (newMatrixX) => {
    setMatrixX(newMatrixX);

    // Select the codeDisplay element and set its child pre code to string with inputs updated
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      // Flatten newMatrixX if it's a 2D array to make it compatible with the inputs format
      const inputs = newMatrixX.flat(); // This will handle multi-dimensional array to a flat array if necessary

      // Convert inputs to a string in the numpy array format with spacing
      const inputsString = 'np.array([' + inputs.join(', ') + '])';

      // Replace the inputs in the existing code
      const existingCode = codeElement.textContent;
      const updatedCode = existingCode.replace(
        /inputs = np.array\(\[.*?\]\)/,
        `inputs = ${inputsString}`
      );

      // Set the updated code to the code element
      codeElement.textContent = updatedCode;
    }
  };

  return (
    
    <div id="interactiveInputs" className="hidden grid grid-rows-[2fr_1fr] grid-cols-[2fr_3fr] gap-2 sm:gap-4 mb-4 pt-4 pr-2 sm:pr-0 pl-2 sm:pl-4 pb-4 rounded-md bg-[#e9e9e9] dark:bg-[#292929] text-[#d0d0d0] dark:text-[#f5f2f0]" >
    
      <div className="bg-transparent"></div> 
      <div className="flex flex-col items-center justify-center px-4">
        <span className="text-lg font-bold text-black dark:text-white text-center">Input</span>
        <MatrixInput
          columns={1}
          idPrefix="x"
          defaultValues={matrixX}
          onMatrixChange={handleMatrixXChange}
        />
        <span className="p-2 text-black dark:text-white opacity-40">1</span>
      </div>

      <div className="flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-black dark:text-white text-center">Weight and Bias</span>
        <MatrixInput
          columns={4}
          idPrefix="w"
          defaultValues={matrixWB}
          onMatrixChange={handleMatrixWBChange}
        />
      </div>

      <div className="flex flex-row items-center justify-center gap-4 px-4">
        <div className="flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-black dark:text-white text-center">Z</span>
          <MatrixInput
            columns={1}
            idPrefix="z"
            defaultValues={matrixZ}
            onMatrixChange={setMatrixZ}
            disabled
          />
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-black dark:text-white text-center">A</span>
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
  );
};

export default SingleNeuron;
