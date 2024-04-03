
import{ useState, useRef, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import MatrixInput from './MatrixInput';
import CodeBlock from '@components/blog/CodeBlock';

const MultiLayerPerceptron = () => {
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
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 1]
  ]);
  
  const [matrixW1_A, setMatrixW1_A] = useState([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ]);

  const [matrixW2, setMatrixW2] = useState([
    [1, 1, -1, 0, 0],
    [0, 0, 1, 1, -1]
  ]);
 
  const [matrixW2_A, setMatrixW2_A] = useState([
    [0, 0],
    [0, 0]
  ]);
  
  const [matrixW3, setMatrixW3] = useState([
    [1, 1],
    [1, -1],
    [1, 2]
  ]);
  
  const [matrixW3_A, setMatrixW3_A] = useState([
    [0, 0],
    [0, 0],
    [0, 0]
  ]);
  
  const [matrixW4, setMatrixW4] = useState([
    [1, -1, 0],
    [0, -1, 1],
  ]);

  const [matrixW4_A, setMatrixW4_A] = useState([
    [0, 0],
    [0, 0]
  ]);
  
  const [matrixW5, setMatrixW5] = useState([
    [0, 1],
    [1, 0],
  ]);
  
  const [matrixW5_A, setMatrixW5_A] = useState([
    [0, 0],
    [0, 0]
  ]);
  
  const [matrixW6, setMatrixW6] = useState([
    [1, -1],
    [1, 1],
  ]);
  
  const [matrixW6_A, setMatrixW6_A] = useState([
    [0, 0],
    [0, 0]
  ]);
  
  const [matrixW7, setMatrixW7] = useState([
    [1, -1],
  ]);
  
  const [matrixW7_A, setMatrixW7_A] = useState([
    [0, 0]
  ]);
  
  const [matrixX, setMatrixX] = useState([
    [3, 5],
    [4, 4],
    [5, 3]
  ]);

 

  useEffect(() => {
    // Define the event listener function
    const handlePythonOutputChange = (event) => {
      const matrixString = event.detail;

      // Extract values from the string
      const { outputMatrixW1_A, outputMatrixW2_A, outputMatrixW3_A, outputMatrixW4_A, outputMatrixW5_A, outputMatrixW6_A, outputMatrixW7_A } = extractValues(matrixString);
     
      
      // Update your states accordingly
      if (outputMatrixW1_A.length > 0) setMatrixW1_A(outputMatrixW1_A);
      if (outputMatrixW2_A.length > 0) setMatrixW2_A(outputMatrixW2_A);
      if (outputMatrixW3_A.length > 0) setMatrixW3_A(outputMatrixW3_A);
      if (outputMatrixW4_A.length > 0) setMatrixW4_A(outputMatrixW4_A);
      if (outputMatrixW5_A.length > 0) setMatrixW5_A(outputMatrixW5_A);
      if (outputMatrixW6_A.length > 0) setMatrixW6_A(outputMatrixW6_A);
      if (outputMatrixW7_A.length > 0) setMatrixW7_A(outputMatrixW7_A);
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
    const w1_a_Regex = /Layer 1 output:\n\s*\[\s*\[([\s\S]*?)\]\]/m;
    const w2_a_Regex = /Layer 2 output:\n\s*\[\s*\[([\s\S]*?)\]\]/m;
    const w3_a_Regex = /Layer 3 output:\n\s*\[\s*\[([\s\S]*?)\]\]/m;
    const w4_a_Regex = /Layer 4 output:\n\s*\[\s*\[([\s\S]*?)\]\]/m;
    const w5_a_Regex = /Layer 5 output:\n\s*\[\s*\[([\s\S]*?)\]\]/m;
    const w6_a_Regex = /Layer 6 output:\n\s*\[\s*\[([\s\S]*?)\]\]/m;
    const w7_a_Regex = /Layer 7 output:\n\s*\[\s*\[([\s\S]*?)\]\]/m;
  
    // Extract and parse for each matrix
    const outputMatrixW1_A = parseMultiDimensionalValues(str.match(w1_a_Regex));
    const outputMatrixW2_A = parseMultiDimensionalValues(str.match(w2_a_Regex));
    const outputMatrixW3_A = parseMultiDimensionalValues(str.match(w3_a_Regex));
    const outputMatrixW4_A = parseMultiDimensionalValues(str.match(w4_a_Regex));
    const outputMatrixW5_A = parseMultiDimensionalValues(str.match(w5_a_Regex));
    const outputMatrixW6_A = parseMultiDimensionalValues(str.match(w6_a_Regex));
    const outputMatrixW7_A = parseMultiDimensionalValues(str.match(w7_a_Regex));
  
    return { outputMatrixW1_A, outputMatrixW2_A, outputMatrixW3_A, outputMatrixW4_A, outputMatrixW5_A, outputMatrixW6_A, outputMatrixW7_A };
  }


  const handleMatrixW1Change = (newMatrixW1) => {
    setMatrixW1(newMatrixW1);
  
    // Construct the new weights array
    const newWeights = newMatrixW1
  
   // Construct the weights string for numpy
   let weightsString = "W1 = np.array([\n";
   newWeights.forEach((weight, index) => {
     weightsString += `    [${weight.join(', ')}],  # Hidden Neuron ${index + 1} weights\n`;
   });
   weightsString += "])";

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the W1 lines
      updatedCode = updatedCode.replace(/W1 = np.array\([\s\S]*?\]\)/, weightsString);

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
    const newWeights = newMatrixW2
  
   // Construct the weights string for numpy
   let weightsString = "W2 = np.array([\n";
   newWeights.forEach((weight, index) => {
     weightsString += `    [${weight.join(', ')}],  # Hidden Neuron ${index + 1} weights\n`;
   });
   weightsString += "])";

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the W2 lines
      updatedCode = updatedCode.replace(/W2 = np.array\([\s\S]*?\]\)/, weightsString);

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

  const handleMatrixW3Change = (newMatrixW3) => {
    setMatrixW3(newMatrixW3);
  
    // Construct the new weights array
    const newWeights = newMatrixW3
  
   // Construct the weights string for numpy
   let weightsString = "W3 = np.array([\n";
   newWeights.forEach((weight, index) => {
     weightsString += `    [${weight.join(', ')}],  # Hidden Neuron ${index + 1} weights\n`;
   });
   weightsString += "])";

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the W3 lines
      updatedCode = updatedCode.replace(/W3 = np.array\([\s\S]*?\]\)/, weightsString);

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

  const handleMatrixW4Change = (newMatrixW4) => {
    setMatrixW4(newMatrixW4);
  
    // Construct the new weights array
    const newWeights = newMatrixW4
  
   // Construct the weights string for numpy
   let weightsString = "W4 = np.array([\n";
   newWeights.forEach((weight, index) => {
     weightsString += `    [${weight.join(', ')}],  # Hidden Neuron ${index + 1} weights\n`;
   });
   weightsString += "])";

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the W4 lines
      updatedCode = updatedCode.replace(/W4 = np.array\([\s\S]*?\]\)/, weightsString);

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

  const handleMatrixW5Change = (newMatrixW5) => {
    setMatrixW5(newMatrixW5);
  
    // Construct the new weights array
    const newWeights = newMatrixW5
  
   // Construct the weights string for numpy
   let weightsString = "W5 = np.array([\n";
   newWeights.forEach((weight, index) => {
     weightsString += `    [${weight.join(', ')}],  # Hidden Neuron ${index + 1} weights\n`;
   });
   weightsString += "])";

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the W5 lines
      updatedCode = updatedCode.replace(/W5 = np.array\([\s\S]*?\]\)/, weightsString);

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

  const handleMatrixW6Change = (newMatrixW6) => {
    setMatrixW6(newMatrixW6);
  
    // Construct the new weights array
    const newWeights = newMatrixW6
  
   // Construct the weights string for numpy
   let weightsString = "W6 = np.array([\n";
   newWeights.forEach((weight, index) => {
     weightsString += `    [${weight.join(', ')}],  # Hidden Neuron ${index + 1} weights\n`;
   });
   weightsString += "])";

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the W6 lines
      updatedCode = updatedCode.replace(/W6 = np.array\([\s\S]*?\]\)/, weightsString);

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

  const handleMatrixW7Change = (newMatrixW7) => {
    setMatrixW7(newMatrixW7);
  
    // Construct the new weights array
    const newWeights = newMatrixW7
  
   // Construct the weights string for numpy
   let weightsString = "W7 = np.array([\n";
   newWeights.forEach((weight, index) => {
     weightsString += `    [${weight.join(', ')}],  # Output Neuron ${index + 1} weights\n`;
   });
   weightsString += "])";

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the W7 lines
      updatedCode = updatedCode.replace(/W7 = np.array\([\s\S]*?\]\)/, weightsString);

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
  
    // Transpose newMatrixX to get columns as individual input vectors
    const [newX1, newX2] = newMatrixX[0].map((_, colIndex) => newMatrixX.map(row => row[colIndex]));
  
    // Generate the updated Python code strings for x1, x2, and x3
    const x1String = `x1 = np.array([${newX1.map(value => `[${value}]`).join(', ')}])`;
    const x2String = `x2 = np.array([${newX2.map(value => `[${value}]`).join(', ')}])`;
  
    // Select the codeDisplay element and get the existing Python code
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Replace the existing x1, x2, and x3 definitions with the new ones
      updatedCode = updatedCode.replace(/x1 = np\.array\(\[\[.*?\]\]\)/s, x1String);
      updatedCode = updatedCode.replace(/x2 = np\.array\(\[\[.*?\]\]\)/s, x2String);
  
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
    
    <div id="interactiveInputs" className="grid grid-rows-16 sm:grid-rows-8 grid-cols-1 sm:grid-cols-[2fr_auto] place-items-center gap-2 sm:gap-8 mb-4 p-1 sm:p-6 rounded-md bg-[#e9e9e9] dark:bg-[#292929] text-[#d0d0d0] dark:text-[#f5f2f0]">
    
      <div className="sm:bg-transparent"></div> 
      <div className="text-center"> 
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Input</span>
        <MatrixInput
          columns={2}
          idPrefix="x"
          defaultValues={matrixX}
          onMatrixChange={handleMatrixXChange}
          width='w-full sm:w-auto'
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 1 Weights</span>
        <MatrixInput
          columns={3}
          idPrefix="w1"
          defaultValues={matrixW1}
          onMatrixChange={handleMatrixW1Change}
          width='w-full sm:w-auto'
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 1 Output</span>
        <MatrixInput
          columns={2}
          idPrefix="w1_a"
          defaultValues={matrixW1_A}
          onMatrixChange={setMatrixW1_A}
          width='w-full sm:w-auto'
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 2 Weights</span>
        <MatrixInput
          columns={5}
          idPrefix="w2"
          defaultValues={matrixW2}
          onMatrixChange={handleMatrixW2Change}
          width='w-full sm:w-auto'
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 2 Output</span>
        <MatrixInput
          columns={2}
          idPrefix="w2_a"
          defaultValues={matrixW2_A}
          onMatrixChange={setMatrixW2_A}
          width='w-full sm:w-auto'
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 3 Weights</span>
        <MatrixInput
          columns={2}
          idPrefix="w3"
          defaultValues={matrixW3}
          onMatrixChange={handleMatrixW3Change}
          width='w-full sm:w-auto'
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 3 Output</span>
        <MatrixInput
          columns={2}
          idPrefix="w3_a"
          defaultValues={matrixW3_A}
          onMatrixChange={setMatrixW3_A}
          width='w-full sm:w-auto'
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 4 Weights</span>
        <MatrixInput
          columns={3}
          idPrefix="w4"
          defaultValues={matrixW4}
          onMatrixChange={handleMatrixW4Change}
          width='w-full sm:w-auto'
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 4 Output</span>
        <MatrixInput
          columns={2}
          idPrefix="w4_a"
          defaultValues={matrixW4_A}
          onMatrixChange={setMatrixW4_A}
          width='w-full sm:w-auto'
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 5 Weights</span>
        <MatrixInput
          columns={2}
          idPrefix="w5"
          defaultValues={matrixW5}
          onMatrixChange={handleMatrixW5Change}
          width='w-full sm:w-auto'
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 5 Output</span>
        <MatrixInput
          columns={2}
          idPrefix="w5_a"
          defaultValues={matrixW5_A}
          onMatrixChange={setMatrixW5_A}
          width='w-full sm:w-auto'
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 6 Weights</span>
        <MatrixInput
          columns={2}
          idPrefix="w6"
          defaultValues={matrixW6}
          onMatrixChange={handleMatrixW6Change}
          width='w-full sm:w-auto'
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 6 Output</span>
        <MatrixInput
          columns={2}
          idPrefix="w6_a"
          defaultValues={matrixW6_A}
          onMatrixChange={setMatrixW6_A}
          width='w-full sm:w-auto'
          disabled
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 7 Weights</span>
        <MatrixInput
          columns={2}
          idPrefix="w7"
          defaultValues={matrixW7}
          onMatrixChange={handleMatrixW7Change}
          width='w-full sm:w-auto'
        />
      </div>

      <div className="text-center">
        <span className="text-base sm:text-lg font-bold text-black dark:text-white">Layer 7 Output</span>
        <MatrixInput
          columns={2}
          idPrefix="w7_a"
          defaultValues={matrixW7_A}
          onMatrixChange={setMatrixW7_A}
          width='w-full sm:w-auto'
          disabled
        />
      </div>

    </div>

  );
};

export default MultiLayerPerceptron;
