import { useState, useRef, useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import MatrixInput from "./MatrixInput";
import CodeBlock from "@components/blog/CodeBlock";

const FourNeuron = () => {
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
      const container = document.getElementById("codeDisplay");
      if (container) {
        codeDisplayRootRef.current = ReactDOM.createRoot(container);
      }
    }
  });

  const [matrixWB, setMatrixWB] = useState([
    [1, -1, 1, -5],
    [1, 1, 0, 0],
    [0, 1, 1, 1],
    [1, 0, 1, -2],
  ]);

  const [matrixX, setMatrixX] = useState([[2], [1], [3]]);

  const [matrixZ, setMatrixZ] = useState([[0], [0], [0], [0]]);

  const [matrixA, setMatrixA] = useState([[0], [0], [0], [0]]);

  useEffect(() => {
    // Define the event listener function
    const handlePythonOutputChange = (event) => {
      const matrixString = event.detail;

      // Extract values from the string
      const { matrixZ, matrixA } = extractReLUValues(matrixString);

      // Update your states accordingly
      if (matrixZ.length > 0) setMatrixZ([matrixZ]);
      if (matrixA.length > 0) setMatrixA([matrixA]);
    };

    // Add event listener when the component mounts
    window.addEventListener("pythonOutputChanged", handlePythonOutputChange);

    // Return a cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener(
        "pythonOutputChanged",
        handlePythonOutputChange,
      );
    };
  }, []); // The empty array ensures this effect runs only once after the initial render

  function extractReLUValues(str) {
    // Define regular expressions to match the outputs before and after ReLU activation
    const beforeReLURegex =
      /Outputs before ReLU activation:\s*\[([-,\d\s]+)\]/m;
    const afterReLURegex =
      /Outputs after ReLU activation:.*?\)\s*\n\s*\[([-,\d\s]+)\]/m;

    // Attempt to match the regular expressions against the input string
    const beforeMatch = str.match(beforeReLURegex);
    const afterMatch = str.match(afterReLURegex);

    let matrixZValues = [];
    let matrixAValues = [];

    // If matches are found, parse them into arrays of numbers
    if (beforeMatch && beforeMatch[1]) {
      matrixZValues = beforeMatch[1].split(",").map((s) => Number(s.trim()));
    }

    if (afterMatch && afterMatch[1]) {
      matrixAValues = afterMatch[1].split(",").map((s) => Number(s.trim()));
    }

    // Format the arrays into the desired structure (e.g., [-1, 3, 5, 3] to [[-1], [3], [5], [3]])
    const formattedMatrixZ = matrixZValues.map((value) => [value]);
    const formattedMatrixA = matrixAValues.map((value) => [value]);

    return { matrixZ: formattedMatrixZ, matrixA: formattedMatrixA };
  }

  // Function to handle changes in Matrix A
  const handleMatrixWBChange = (newMatrixWB) => {
    setMatrixWB(newMatrixWB);

    // Construct the new weights array
    const newWeights = newMatrixWB.map((row) => row.slice(0, 3));
    const newBiases = newMatrixWB.map((row) => row[3]);

    // Construct the weights string for numpy
    let weightsString = "weights = np.array(\n    [\n";
    newWeights.forEach((weight, index) => {
      weightsString += `        [${weight.join(", ")}],  # Neuron ${index + 1} weights\n`;
    });
    weightsString += "    ]\n)";

    // Select the code display element
    const codeElement = document.querySelector("#codeDisplay pre code");
    if (codeElement) {
      let updatedCode = codeElement.textContent;

      // Replace the weights in the code
      updatedCode = updatedCode.replace(
        /weights = np.array\([\s\S]*?\]\n\)/,
        weightsString,
      );

      // Correct the final bracket
      updatedCode = updatedCode.replace(/\],\n\)/, "\n])");

      // Replace the biases in the code
      updatedCode = updatedCode.replace(
        /biases = np\.array\(\[.*?\]\)/,
        `biases = np.array([${newBiases.join(", ")}])`,
      );

      // Render the updated code using the stored root
      if (codeDisplayRootRef.current) {
        const syntaxHighlighterElement = <CodeBlock code={updatedCode} />;
        codeDisplayRootRef.current.render(syntaxHighlighterElement);
      }
      window.executePython && window.executePython(updatedCode);
    }
  };

  // Function to handle changes in Matrix B
  const handleMatrixXChange = (newMatrixX) => {
    setMatrixX(newMatrixX);

    // Select the codeDisplay element and set its child pre code to string with inputs updated
    const codeElement = document.querySelector("#codeDisplay pre code");
    if (codeElement) {
      // Flatten newMatrixX if it's a 2D array to make it compatible with the inputs format
      const inputs = newMatrixX.flat(); // This will handle multi-dimensional array to a flat array if necessary

      // Convert inputs to a string in the numpy array format with spacing
      const inputsString = "np.array([" + inputs.join(", ") + "])";

      // Replace the inputs in the existing code
      const existingCode = codeElement.textContent;
      const updatedCode = existingCode.replace(
        /inputs = np.array\(\[.*?\]\)/,
        `inputs = ${inputsString}`,
      );

      // Render the updated code using the stored root
      if (codeDisplayRootRef.current) {
        const syntaxHighlighterElement = <CodeBlock code={updatedCode} />;
        codeDisplayRootRef.current.render(syntaxHighlighterElement);
      }
      window.executePython && window.executePython(updatedCode);
    }
  };

  return (
    <div
      id="interactiveInputs"
      className="mb-4 grid hidden grid-cols-[2fr_1fr_1fr] grid-rows-[1fr_1fr] place-items-center gap-2 rounded-md bg-[#e9e9e9] p-1 text-[#d0d0d0] sm:gap-4 sm:p-2 md:gap-6 lg:gap-8 dark:bg-[#292929] dark:text-[#f5f2f0]">
      <div className="bg-transparent"></div>
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
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
      <div className="bg-transparent"></div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Weight and Bias
        </span>
        <MatrixInput
          columns={4}
          idPrefix="w"
          defaultValues={matrixWB}
          onMatrixChange={handleMatrixWBChange}
          width="w-full sm:w-auto"
        />
      </div>

      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Z
        </span>
        <MatrixInput
          columns={1}
          idPrefix="z"
          defaultValues={matrixZ}
          onMatrixChange={setMatrixZ}
          disabled
          width="w-full sm:w-auto"
        />
      </div>
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          A
        </span>
        <MatrixInput
          columns={1}
          idPrefix="A"
          defaultValues={matrixA}
          onMatrixChange={setMatrixA}
          disabled
          width="w-full sm:w-auto"
        />
      </div>
    </div>
  );
};

export default FourNeuron;
