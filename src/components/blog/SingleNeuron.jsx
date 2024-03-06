
import{ useState } from 'react';
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
      console.log("🚀 ~ handleMatrixXChange ~ updatedCode:", updatedCode)
    }
};

  return (
    <div id="interactiveInputs" className="flex flex-col sm:flex-row gap-2 sm:gap-5 items-center justify-center text-center mb-8 hidden">
      <span className="text-lg font-bold">Weight and Bias</span>
      <MatrixInput
        columns={4}
        idPrefix="w"
        defaultValues={matrixWB}
        onMatrixChange={handleMatrixWBChange}
      />
      
      <span className="text-lg font-bold">Input</span>
      <MatrixInput
        columns={1}
        idPrefix="x"
        defaultValues={matrixX}
        onMatrixChange={handleMatrixXChange}
      />
    </div>
  );
};

export default SingleNeuron;
