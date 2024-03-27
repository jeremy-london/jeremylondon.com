
import{ useState, useRef, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import MatrixInput from './MatrixInput';
import CodeBlock from '@components/blog/CodeBlock';

const BatchProcessing = () => {
  const codeDisplayRootRef = useRef(null);
  
  useEffect(() => {
    // Cleanup function to reset the ref
    return () => {
      codeDisplayRootRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Ensure re-initialization runs every time the component is rendered
    if (!codeDisplayRootRef.current) {
      const container = document.getElementById('codeDisplay');
      if (container) {
        codeDisplayRootRef.current = ReactDOM.createRoot(container);
      }
    }
  });

  const [matrixW1, setMatrixW1] = useState([
    [1, -1, 1, -5],
    [1, 1, 0, 0],
    [0, 1, 1, 1],
    [1, 0, 1, -2]
  ]);

  const [matrixW2, setMatrixW2] = useState([
    [1, 1, -1, 0, 0],
    [0, 0, 1, -1, 1]
  ]);

  const [matrixX, setMatrixX] = useState([
    [2, 1, 0],
    [1, 1, 1],
    [3, 0, 1]
  ]);

  const [matrixHZ, setMatrixHZ] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);

  const [matrixHA, setMatrixHA] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);

  const [matrixYZ, setMatrixYZ] = useState([
    [0, 0, 0],
    [0, 0, 0],
  ]);

  const [matrixYA, setMatrixYA] = useState([
    [0, 0, 0],
    [0, 0, 0],
  ]);

  useEffect(() => {
    // Define the event listener function
    const handlePythonOutputChange = (event) => {
      const matrixString = event.detail;

      // Extract values from the string
      const { outputMatrixHZ, outputMatrixHA, outputMatrixYZ, outputMatrixYA } = extractValues(matrixString);
      // console.log("🚀 ~ handlePythonOutputChange ~ outputMatrixYA:", outputMatrixYA)
      // console.log("🚀 ~ handlePythonOutputChange ~ outputMatrixYZ:", outputMatrixYZ)
      // console.log("🚀 ~ handlePythonOutputChange ~ outputMatrixHA:", outputMatrixHA)
      // console.log("🚀 ~ handlePythonOutputChange ~ outputMatrixHZ:", outputMatrixHZ)
      
      // Update your states accordingly
      if (outputMatrixHZ.length > 0) setMatrixHZ(outputMatrixHZ);
      if (outputMatrixHA.length > 0) setMatrixHA(outputMatrixHA);
      if (outputMatrixYZ.length > 0) setMatrixYZ(outputMatrixYZ);
      if (outputMatrixYA.length > 0) setMatrixYA(outputMatrixYA);
    };

    // Add event listener when the component mounts
    window.addEventListener('pythonOutputChanged', handlePythonOutputChange);

    // Return a cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('pythonOutputChanged', handlePythonOutputChange);
    };
  }, []); // The empty array ensures this effect runs only once after the initial render

  // Helper function to parse matched values into an array of arrays of numbers
  function parseMultiDimensionalValues(match) {
    if (!match || match.length < 2) return [];
    
    // Split the matched string into lines
    const lines = match[1].trim().split('\n');
  
    // Process each line to extract numbers
    return lines.map(line => 
      line.trim() // Trim leading and trailing whitespace
        .replace(/\s+/g, ' ') // Normalize whitespace between numbers to a single space
        .replace(/\[/g, '') // Remove opening brackets
        .replace(/\]/g, '') // Remove closing brackets
        .trim() // Trim again in case of leading/trailing spaces after removing brackets
        .split(' ') // Split by space to get individual numbers
        .map(Number) // Convert each string to a Number
    );
  }

  function extractValues(str) {
    // Update regular expressions to match multi-line arrays
    const hzRegex = /Hidden layer:\n\s*\[\s*\[([\s\S]*?)\]\]/m;
    const haRegex = /ReLU Activated Hidden layer:\n\s*\[\s*\[([\s\S]*?)\]\]/m;
    const yzRegex = /Output Layer:\n\s*\[\s*\[([\s\S]*?)\]\]/m;
    const yaRegex = /ReLU Activated Output Layer:\n\s*\[\s*\[([\s\S]*?)\]\]/m;
  
    // Extract and parse for each matrix
    const outputMatrixHZ = parseMultiDimensionalValues(str.match(hzRegex));
    const outputMatrixHA = parseMultiDimensionalValues(str.match(haRegex));
    const outputMatrixYZ = parseMultiDimensionalValues(str.match(yzRegex));
    const outputMatrixYA = parseMultiDimensionalValues(str.match(yaRegex));
  
    return { outputMatrixHZ, outputMatrixHA, outputMatrixYZ, outputMatrixYA };
  }
  
  // Function to handle changes in Matrix W1
  const handleMatrixW1Change = (newMatrixW1) => {
    setMatrixW1(newMatrixW1);
  
    // Construct the new weights array
    const newWeights = newMatrixW1.map(row => row.slice(0, 3));
    console.log("🚀 ~ handleMatrixW1Change ~ newWeights:", newWeights)
    const newBiases = newMatrixW1.map(row => row[3]);
    console.log("🚀 ~ handleMatrixW1Change ~ newBiases:", newBiases)
  
    // Construct the weights string for numpy
    let weightsString = "W1 = np.array([";
    newWeights.forEach((weight, index) => {
      // Join elements with a comma and a space, and wrap with brackets
      let weightString = `[${weight.join(', ')}]`;
      weightsString += (index === 0 ? weightString : ' ' + weightString); // Add a space before the weightString if it's not the first weight array
      if (index < newWeights.length - 1) {
        weightsString += ','; // Only add a comma if it's not the last weight array
      }
    });
    weightsString += "])";

    // Construct the biases string for numpy
    let biasesString = `b1 = np.array([${newBiases.join(', ')}])`;

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the W1 and b1 lines
      // For W1, match the whole multi-line declaration
      updatedCode = updatedCode.replace(
        /W1 = np\.array\(\[.*?\]\)/gs, // 's' flag for matching across lines
        weightsString
      );

      // For b1, a simple single-line replacement works
      updatedCode = updatedCode.replace(
        /b1 = np\.array\(\[.*?\]\)/gs,
        biasesString
      );

      // Render the updated code
      if (codeDisplayRootRef.current) {
        const syntaxHighlighterElement = (
          <CodeBlock code={updatedCode} />
        );
        codeDisplayRootRef.current.render(syntaxHighlighterElement);
      }
      window.executePython && window.executePython(updatedCode);
    }
  };
  
 const handleMatrixW2Change = (newMatrixW2) => {
    setMatrixW2(newMatrixW2);
  
    // Construct the new weights array
    const newWeights = newMatrixW2.map(row => row.slice(0, 4));
    const newBiases = newMatrixW2.map(row => row[4]);
  
    // Construct the weights string for numpy
    let weightsString = "W2 = np.array([";
    newWeights.forEach((weight, index) => {
      // Join elements with a comma and a space, and wrap with brackets
      let weightString = `[${weight.join(', ')}]`;
      weightsString += (index === 0 ? weightString : ' ' + weightString); // Add a space before the weightString if it's not the first weight array
      if (index < newWeights.length - 1) {
        weightsString += ','; // Only add a comma if it's not the last weight array
      }
    });
    weightsString += "])";
    
    // Construct the biases string for numpy
    let biasesString = `b2 = np.array([${newBiases.join(', ')}])`;

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the W2 and b2 lines
      // For W2, match the whole multi-line declaration
      updatedCode = updatedCode.replace(
        /W2 = np\.array\(\[.*?\]\)/gs, // 's' flag for matching across lines
        weightsString
      );

      // For b2, a simple single-line replacement works
      updatedCode = updatedCode.replace(
        /b2 = np\.array\(\[.*?\]\)/gs,
        biasesString
      );

      // Render the updated code
      if (codeDisplayRootRef.current) {
        const syntaxHighlighterElement = (
          <CodeBlock code={updatedCode} />
        );
        codeDisplayRootRef.current.render(syntaxHighlighterElement);
      }
      window.executePython && window.executePython(updatedCode);
      
    }
  };

  const handleMatrixXChange = (newMatrixX) => {
    setMatrixX(newMatrixX);

    // Select the codeDisplay element and set its child pre code to string with inputs updated
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      // Convert newMatrixX to a string in the numpy array format with proper spacing and structure
      const inputsString = `np.array([${newMatrixX.map(row => '[' + row.join(', ') + ']').join(', ')}])`;

      // Replace the inputs in the existing code
      const existingCode = codeElement.textContent;
      const updatedCode = existingCode.replace(
        /x_batch = np\.array\(\[.*?\]\)/s,  // Use 's' flag to match across multiple lines
        `x_batch = ${inputsString}`
      );

      // Render the updated code using the stored root
      if (codeDisplayRootRef.current) {
        const syntaxHighlighterElement = (
          <CodeBlock code={updatedCode} />
        );
        codeDisplayRootRef.current.render(syntaxHighlighterElement);
      } 
      window.executePython && window.executePython(updatedCode);
    }
  };

  return (
    
    <div id="interactiveInputs" className="hidden grid grid-rows-[1fr_1fr_1fr] grid-cols-[2fr_1fr_1fr] place-items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 mb-4 p-1 sm:p-6 rounded-md bg-[#e9e9e9] dark:bg-[#292929] text-[#d0d0d0] dark:text-[#f5f2f0]">
    
      <div className="sm:bg-transparent"></div> 
      <div className="text-center"> 
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Input</span>
        <MatrixInput
          columns={3}
          idPrefix="x"
          defaultValues={matrixX}
          onMatrixChange={handleMatrixXChange}
          width='w-full sm:w-auto'
        />
        <span className="p-2 text-black dark:text-white opacity-40">1</span>
      </div>
      <div className="bg-transparent"></div> 

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 1 W/B</span>
        <MatrixInput
          columns={4}
          idPrefix="w1"
          defaultValues={matrixW1}
          onMatrixChange={handleMatrixW1Change}
          width='w-full sm:w-auto'
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Z</span>
        <MatrixInput
          columns={3}
          idPrefix="z"
          defaultValues={matrixHZ}
          onMatrixChange={setMatrixHZ}
          disabled
          width='w-full sm:w-auto'
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">A</span>
        <MatrixInput
          columns={3}
          idPrefix="A"
          defaultValues={matrixHA}
          onMatrixChange={setMatrixHA}
          disabled
          width='w-full sm:w-auto'
        />
        <span className="p-2 text-black dark:text-white opacity-40">1</span>
      </div>

      <div className="text-center">
        <span className="w-full text-base sm:text-lg font-bold text-black dark:text-white">Layer 2 W/B</span>
        <MatrixInput
          columns={5}
          idPrefix="w2"
          defaultValues={matrixW2}
          onMatrixChange={handleMatrixW2Change}
          width='w-full sm:w-auto'
        />
      </div>

      <div className="text-center">
        <span className="text-base  sm:text-lg font-bold text-black dark:text-white">Z</span>
        <MatrixInput
          columns={3}
          idPrefix="y_z"
          defaultValues={matrixYZ}
          onMatrixChange={setMatrixYZ}
          disabled
          width='w-full sm:w-auto'
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">A</span>
        <MatrixInput
          columns={3}
          idPrefix="y_a"
          defaultValues={matrixYA}
          onMatrixChange={setMatrixYA}
          disabled
          width='w-full sm:w-auto'
        />
      </div>

    </div>

  );
};

export default BatchProcessing;
