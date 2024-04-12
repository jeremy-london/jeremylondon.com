
import{ useState, useRef, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import MatrixInput from './MatrixInput';
import CodeBlock from '@components/blog/CodeBlock';

const BackPropagation = () => {
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

  // Input data to start forward pass
  const [matrixX, setMatrixX] = useState([
    [2],
    [1],
    [3],
  ]);


  // Layer 1 Weights and Biases
  const [matrixW1, setMatrixW1] = useState([
    [1, -1, 1, -5],
    [1, 1, 0, 0],
    [0, 1, 1, 1],
    [1, 0, 1, -2]
  ]);

  const [matrixZ1, setMatrixZ1] = useState([
    [-1],
    [3],
    [5],
    [3],
  ])

  const [matrixA1, setMatrixA1] = useState([
    [0],
    [3],
    [5],
    [3],
  ])

  // Layer 2 Weights and Biases
  const [matrixW2, setMatrixW2] = useState([
    [1, 1, -1, 0, 0],
    [0, 1, -1, 1, 3]
  ]);

  const [matrixZ2, setMatrixZ2] = useState([
    [2],
    [4],
  ])

  const [matrixA2, setMatrixA2] = useState([
    [2],
    [4],
  ])

  // Layer 3 Weights and Biases
  const [matrixW3, setMatrixW3] = useState([
    [2, 0, -1],
    [0, 2, -5],
    [1, 1, 1],
  ]);

  const [matrixZ3, setMatrixZ3] = useState([
    [3],
    [3],
    [-1],
  ])

  
  // Prediction and target values
  const [matrixYp, setMatrixYp] = useState([
    [0.5],
    [0.5],
    [0],
  ]);
  
  const [matrixYt, setMatrixYt] = useState([
    [0],
    [1],
    [0],
  ]);
  
  // Gradients
  const [matrixTargetGradient, setMatrixTargetGradient] = useState([
    [0.5, -0.5, 0]
  ])

  const [matrixL3Gradients, setMatrixL3Gradients] = useState([
    [1, -1]
  ])

  const [matrixL2Gradients, setMatrixL2Gradients] = useState([
    [1, -2, 2, -1]
  ])

  const [matrixL1Gradients, setMatrixL1Gradients] = useState([
    [0, -2, 2, -1]
  ])

  // Apply gradients to weights and biases

  // Update the weights and biases of Layer 3
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
    [1, -1]
  ])

  const [newMatrixW1, setNewMatrixW1] = useState([
    [0, -4, 4, -2],
    [0, -2, 2, -1],
    [0, -6, 6, -3],
    [0, -2, 2, -1],
  ])

  useEffect(()=>{
    if(typeof window?.MathJax !== "undefined"){
      window.MathJax.typeset()
    }
  },[])

  useEffect(() => {
    // Define the event listener function
    const handlePythonOutputChange = (event) => {
      const matrixString = event.detail;
  
      // Extract values from the string
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
      } = extractValues(matrixString);      
      // Set computed and activated values
      setMatrixZ3(matrixZ3);
      setMatrixZ2(matrixZ2);
      setMatrixA2(matrixA2);
      setMatrixZ1(matrixZ1);
      setMatrixA1(matrixA1);

      // Set partial derivatives
      setMatrixL1Gradients(db1Values)
      setMatrixL2Gradients(db1Values)
      setMatrixL3Gradients(db2Values)
      setMatrixTargetGradient(db3Values);

      // Combine bias and weights for each layer to create new weight matrices
      const newMatrixL3Gradients = combineBiasAndWeights(db3Values, dW3Matrix);
      setNewMatrixW3(newMatrixL3Gradients);
      
      const newMatrixL2Gradients = combineBiasAndWeights(db2Values, dW2Matrix);
      setNewMatrixW2(newMatrixL2Gradients);
      
      const newMatrixL1Gradients = combineBiasAndWeights(db1Values, dW1Matrix);
      setNewMatrixW1(newMatrixL1Gradients);
    };
  
    // Add event listener when the component mounts
    window.addEventListener('pythonOutputChanged', handlePythonOutputChange);
  
    // Return a cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('pythonOutputChanged', handlePythonOutputChange);
    };
  }, []);
  
  function extractValues(str) {
    // Regular expressions to match the output structure
    const z3Regex = /z3:\n\s*\[([\s\S]*?)\]/m;
    const db3Regex = /∂L\/∂b3:\n\s*\[([\s\S]*?)\]/m;
    const dW3Regex = /∂L\/∂W3:\n\s*\[\[([\s\S]*?)\]\]/m;
    const z2Regex = /z2:\n\s*\[([\s\S]*?)\]/m;
    const a2Regex = /a2:\n\s*\[([\s\S]*?)\]/m;
    const db2Regex = /∂L\/∂b2:\n\s*\[([\s\S]*?)\]/m;
    const dW2Regex = /∂L\/∂W2:\n\s*\[\[([\s\S]*?)\]\]/m;
    const z1Regex = /z1:\n\s*\[([\s\S]*?)\]/m;
    const a1Regex = /a1:\n\s*\[([\s\S]*?)\]/m;
    const db1Regex = /∂L\/∂b1:\n\s*\[([\s\S]*?)\]/m;
    const dW1Regex = /∂L\/∂W1:\n\s*\[\[([\s\S]*?)\]\]/m;
  
    // Extract and parse each gradient matrix
    const db3Values = parseMultiDimensionalValues(str.match(db3Regex));
    const dW3Matrix = parseMultiDimensionalValues(str.match(dW3Regex));
  
    // Extract for db2/dW2 and db1/dW1
    const db2Values = parseMultiDimensionalValues(str.match(db2Regex));
    const dW2Matrix = parseMultiDimensionalValues(str.match(dW2Regex));
    const db1Values = parseMultiDimensionalValues(str.match(db1Regex));
    const dW1Matrix = parseMultiDimensionalValues(str.match(dW1Regex));

    // Extract computed and activation values
    const matrixZ3 = parseMultiDimensionalValues(str.match(z3Regex));
    const matrixZ2 = parseMultiDimensionalValues(str.match(z2Regex));
    const matrixA2 = parseMultiDimensionalValues(str.match(a2Regex));
    const matrixZ1 = parseMultiDimensionalValues(str.match(z1Regex));
    const matrixA1 = parseMultiDimensionalValues(str.match(a1Regex));
  
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
    };
  }

  // Combines the bias row with the weights matrix
  function combineBiasAndWeights(biasArray, weightsMatrix) {
    // Append the biasArray as the last row of the weightsMatrix
    return [...weightsMatrix, ...biasArray];
  }

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
  
  // Function to handle changes in Matrix W1
  const handleMatrixW1Change = (newMatrixW1) => {
    setMatrixW1(newMatrixW1);
  
    // Construct the new weights array
    const newWeights = newMatrixW1.map(row => row.slice(0, 3));
    const newBiases = newMatrixW1.map(row => row[3]);
  
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
  
  const handleMatrixW3Change = (newMatrixW3) => {
    setMatrixW3(newMatrixW3);
  
    // Construct the new weights array
    const newWeights = newMatrixW3.map(row => row.slice(0, 2));
    const newBiases = newMatrixW3.map(row => row[2]);
  
    // Construct the weights string for numpy
    let weightsString = "W3 = np.array([";
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
    let biasesString = `b3 = np.array([${newBiases.join(', ')}])`;

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the W3 and b3 lines
      // For W3, match the whole multi-line declaration
      updatedCode = updatedCode.replace(
        /W3 = np\.array\(\[.*?\]\)/gs, // 's' flag for matching across lines
        weightsString
      );

      // For b3, a simple single-line replacement works
      updatedCode = updatedCode.replace(
        /b3 = np\.array\(\[.*?\]\)/gs,
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
  
  const handleMatrixYpChange = (newMatrixYp) => {
    setMatrixYp(newMatrixYp);
  
    // Construct the new weights array
    const newWeights = newMatrixYp
  
    // Construct the weights string for numpy
    let weightsString = "Y_pred = np.array([";
    newWeights.forEach((weight, index) => {
      // Join elements with a comma and a space, and wrap with brackets
      let weightString = `${weight.join(', ')}`;
      weightsString += (index === 0 ? weightString : ' ' + weightString); // Add a space before the weightString if it's not the first weight array
      if (index < newWeights.length - 1) {
        weightsString += ','; // Only add a comma if it's not the last weight array
      }
    });
    weightsString += "])";

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the Y_pred
      // For Y_pred, match the whole multi-line declaration
      updatedCode = updatedCode.replace(
        /Y_pred = np\.array\(\[.*?\]\)/gs, // 's' flag for matching across lines
        weightsString
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
  
  const handleMatrixYtChange = (newMatrixYt) => {
    setMatrixYt(newMatrixYt);
  
    // Construct the new weights array
    const newWeights = newMatrixYt
  
    // Construct the weights string for numpy
    let weightsString = "Y_target = np.array([";
    newWeights.forEach((weight, index) => {
      // Join elements with a comma and a space, and wrap with brackets
      let weightString = `${weight.join(', ')}`;
      weightsString += (index === 0 ? weightString : ' ' + weightString); // Add a space before the weightString if it's not the first weight array
      if (index < newWeights.length - 1) {
        weightsString += ','; // Only add a comma if it's not the last weight array
      }
    });
    weightsString += "])";

    // Select the code display element
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Use regular expression to replace the Y_target
      // For Y_target, match the whole multi-line declaration
      updatedCode = updatedCode.replace(
        /Y_target = np\.array\(\[.*?\]\)/gs, // 's' flag for matching across lines
        weightsString
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
  
    // Assuming newMatrixX is a 2D array representing the new X value
    // Generate the updated Python code string for X
    const xString = `X = np.array([${newMatrixX.map(row => `[${row.join(', ')}]`).join(', ')}])`;
  
    // Select the codeDisplay element and get the existing Python code
    const codeElement = document.querySelector('#codeDisplay pre code');
    if (codeElement) {
      let updatedCode = codeElement.textContent;
  
      // Replace the existing X definition with the new one
      updatedCode = updatedCode.replace(/X = np\.array\(\[\[.*?\]\, \[.*?\]\, \[.*?\]\]\)/s, xString);
  
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

  const dL_db3 = "\\[ \\frac{\\partial L}{\\partial b_3} = \\frac{\\partial L}{\\partial z_3} \\]";
  const dL_dW3 = "\\[ \\frac{\\partial L}{\\partial W_3} \\]";
  const dL_dz3_full = "\\[ \\frac{\\partial L}{\\partial z_3} = Y^{\\text{pred}} - Y^{\\text{target}} \\]";
  const dL_dz3 = "\\[ \\frac{\\partial L}{\\partial z_3} \\]";


  const dL_db2 = "\\[ \\frac{\\partial L}{\\partial b_2} = \\frac{\\partial L}{\\partial z_2} \\]";
  const dL_dW2 = "\\[ \\frac{\\partial L}{\\partial W_2} \\]";
  const dL_da2 = "\\[ \\frac{\\partial L}{\\partial a_2} \\]";
  const dL_dz2 = "\\[ \\frac{\\partial L}{\\partial a_2} = \\frac{\\partial L}{\\partial z_2} \\]";

  const dL_db1 = "\\[ \\frac{\\partial L}{\\partial b_1} = \\frac{\\partial L}{\\partial z_1} \\]";
  const dL_dW1 = "\\[ \\frac{\\partial L}{\\partial W_1} \\]";
  const dL_da1 = "\\[ \\frac{\\partial L}{\\partial a_1} \\]";
  const dL_dz1_full = "\\[ \\frac{\\partial L}{\\partial b_1} = \\frac{\\partial L}{\\partial z_1} \\]";
  const dL_dz1 = "\\[ \\frac{\\partial L}{\\partial z_1} \\]";

  return (
    <div id="interactiveInputs" className="hidden grid grid-rows-auto grid-cols-4 md:grid-cols-[2fr_1fr_1fr_1fr_0.8fr]  place-items-center gap-2 sm:gap-4 mb-4 p-4 rounded-md bg-[#e9e9e9] dark:bg-[#292929] text-[#d0d0d0] dark:text-[#f5f2f0]">
    
      {/* Input Layer */}
      <div className="col-span-4 sm:col-span-2 text-center"> 
        <span className="text-base lg:text-lg font-bold text-black dark:text-white">Input</span>
        <MatrixInput
          columns={1}
          idPrefix="x"
          defaultValues={matrixX}
          onMatrixChange={handleMatrixXChange}
          width='w-full sm:w-auto'
        />
        <span className="p-2 text-black dark:text-white opacity-40">1</span>
      </div>
      <div className="col-span-4 sm:col-span-2 text-center"> 
        <span className="text-base font-bold text-black dark:text-white">New Layer 1 W/B</span>
        <MatrixInput
          columns={4}
          idPrefix="W'"
          defaultValues={newMatrixW1}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="hidden md:block text-base lg:text-lg font-bold text-black dark:text-white">{dL_dW1}{dL_db1}</div>
      

      {/* Back Prop 1 */}
      <div className="col-span-1 sm:bg-transparent"></div> 
      <div className="col-span-1 sm:bg-transparent"></div> 
      <div className="col-span-4 sm:col-span-2 text-center">
        <span className="sm:hidden text-base lg:text-lg font-bold text-black dark:text-white">{dL_dz1_full}</span>
        <span className="hidden sm:block text-base lg:text-lg font-bold text-black dark:text-white">{dL_dz1}</span>
        <MatrixInput
          columns={4}
          idPrefix="dL_dz1"
          defaultValues={matrixL1Gradients}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div> 
      <div className="hidden md:col-span-1 md:block md:bg-transparent"></div> 
      
      {/* Layer 1 */}
      <div className="col-span-4 sm:col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white">Layer 1 W/B</span>
        <MatrixInput
          columns={4}
          idPrefix="w1"
          defaultValues={matrixW1}
          onMatrixChange={handleMatrixW1Change}
          width='w-full sm:w-auto'
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="col-span-1 sm:col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white">Z1</span>
        <MatrixInput
          columns={1}
          idPrefix="z1"
          defaultValues={matrixZ1}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="col-span-1 sm:col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white">A1</span>
        <MatrixInput
          columns={1}
          idPrefix="a1"
          defaultValues={matrixA1}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-40">1</span>
      </div>
      <div className="col-span-2 sm:col-span-1 text-center">
        <span className="text-base font-bold text-black dark:text-white">New Layer 2 W/B</span>
        <MatrixInput
          columns={2}
          idPrefix="w2'"
          defaultValues={newMatrixW2}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="hidden md:block text-base lg:text-lg font-bold text-black dark:text-white">{dL_dW2}{dL_db2}</div>
      
      {/* Back Prop 2 */}
      <div className="col-span-2 md:col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white">{dL_da1}</span>
        <MatrixInput
          columns={4}
          idPrefix="dL_da1"
          defaultValues={matrixL2Gradients}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="hidden sm:block sm:col-span-1 sm:bg-transparent md:col-span-2"></div> 
      <div className="col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white">{dL_dz2}</span>
        <MatrixInput
          columns={2}
          idPrefix="dL_dz2"
          defaultValues={matrixL3Gradients}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="hidden md:block md:col-span-1 md:bg-transparent"></div> 
        

      {/* Layer 2 */}
      <div className="col-span-4 sm:col-span-1 md:col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white">Layer 2 W/B</span>
        <MatrixInput
          columns={5}
          idPrefix="w2"
          defaultValues={matrixW2}
          onMatrixChange={handleMatrixW2Change}
          width='w-full sm:w-auto'
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="col-span-2 sm:col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white">Z2</span>
        <MatrixInput
          columns={1}
          idPrefix="z2"
          defaultValues={matrixZ2}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="col-span-2 sm:col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white">A2</span>
        <MatrixInput
          columns={1}
          idPrefix="a2"
          defaultValues={matrixA2}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-40">1</span>
      </div>
      <div className="col-span-4 sm:col-span-1 text-center">
        <span className="text-base font-bold text-black dark:text-white">New Layer 3 W/B</span>
        <MatrixInput
          columns={3}
          idPrefix="w3'"
          defaultValues={newMatrixW3}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="hidden md:block text-base lg:text-lg font-bold text-black dark:text-white">{dL_dW3}{dL_db3}</div>

      {/* Back Prop 3 */}
      <div className="col-span-2 md:col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white">{dL_da2}</span>
        <MatrixInput
          columns={2}
          idPrefix="dl_da2"
          defaultValues={matrixL3Gradients}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="hidden md:block md:bg-transparent md:col-span-2"></div>
      <div className="col-span-2 md:col-span-1 text-center">
        <span className="hidden sm:block text-base lg:text-lg font-bold text-black dark:text-white">{dL_dz3_full}</span>
        <span className="sm:hidden text-base lg:text-lg font-bold text-black dark:text-white">{dL_dz3}</span>
        <MatrixInput
          columns={3}
          idPrefix="dL_dz3"
          defaultValues={matrixTargetGradient}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="col-span-1 md:bg-transparent"></div>
      
      {/* Layer 3 */}
      <div className="col-span-4 md:col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white md:block md:my-8">Layer 3 W/B</span>
        <MatrixInput
          columns={3}
          idPrefix="w3"
          defaultValues={matrixW3}
          onMatrixChange={handleMatrixW3Change}
          width='w-full sm:w-auto'
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="col-span-2 sm:col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white md:block md:my-8">Z3</span>
        <MatrixInput
          columns={1}
          idPrefix="z3"
          defaultValues={matrixZ3}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white md:block md:my-8">Y<sup>pred</sup></span>
        <MatrixInput
          columns={1}
          idPrefix="Yp"
          defaultValues={matrixYp}
          onMatrixChange={handleMatrixYpChange}
          width='w-full sm:w-auto'
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="col-span-1 text-center">
        <span className="text-base lg:text-lg font-bold text-black dark:text-white md:block md:my-8">Y<sup>target</sup></span>
        <MatrixInput
          columns={1}
          idPrefix="Yt"
          defaultValues={matrixYt}
          onMatrixChange={handleMatrixYtChange}
          width='w-full sm:w-auto'
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>
      <div className="hidden sm:block text-center">
        <span className="hidden sm:block text-base lg:text-lg font-bold text-black dark:text-white">{dL_dz3}</span>
        <span className="sm:hidden text-base lg:text-lg font-bold text-black dark:text-white">{dL_dz3_full}</span>
        <MatrixInput
          columns={1}
          idPrefix="dL_dz3_output"
          defaultValues={matrixTargetGradient}
          width='w-full sm:w-auto'
          disabled
        />
        <span className="p-2 text-black dark:text-white opacity-0">1</span>
      </div>

    </div>
    

  );
};

export default BackPropagation;
