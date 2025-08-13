import { useState, useRef, useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import MatrixInput from "@components/blog/MatrixInput";
import CodeBlock from "@components/blog/CodeBlock";

const SingleNeuron = () => {
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

  const [matrixWB, setMatrixWB] = useState([[1, -1, 1, -5]]);

  const [matrixX, setMatrixX] = useState([[2], [1], [3]]);

  const [matrixZ, setMatrixZ] = useState([[0]]);

  const [matrixA, setMatrixA] = useState([[0]]);

  useEffect(() => {
    // Define the event listener function
    const handlePythonOutputChange = (event) => {
      const matrixString = event.detail;

      // Extract values from the string
      const { matrixZValue, matrixAValue } = extractReLUValues(matrixString);

      // Update your states accordingly
      if (matrixZValue !== null) setMatrixZ([[matrixZValue]]);
      if (matrixAValue !== null) setMatrixA([[matrixAValue]]);
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
    const codeElement = document.querySelector("#codeDisplay pre code");
    if (codeElement) {
      const existingCode = codeElement.textContent;

      // Update weights in the code
      const updatedWeightsCode = existingCode.replace(
        /weights = np.array\(\[.*?\]\)/,
        `weights = np.array([${weights.join(", ")}])`,
      );

      // Update bias in the code
      const updatedCode = updatedWeightsCode.replace(
        /bias = .*?  # bias should be a scalar, not an array/,
        `bias = ${bias}  # bias should be a scalar, not an array`,
      );

      // Set the updated code to the code element
      // codeElement.textContent = updatedCode;

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
      className="mb-4 grid hidden grid-cols-[2fr_3fr] grid-rows-[2fr_1fr] gap-2 rounded-md bg-[#e9e9e9] pt-4 pr-2 pb-4 pl-2 text-[#d0d0d0] sm:gap-4 sm:pr-0 sm:pl-12 lg:pl-28 dark:bg-[#292929] dark:text-[#f5f2f0]">
      <div className="bg-transparent"></div>
      <div className="flex flex-col items-center justify-center pr-28 pl-6 sm:pl-4 md:pr-52">
        <span className="text-center text-lg font-bold text-black dark:text-white">
          Input
        </span>
        <MatrixInput
          columns={1}
          idPrefix="x"
          defaultValues={matrixX}
          onMatrixChange={handleMatrixXChange}
        />
        <span className="p-2 text-black opacity-40 dark:text-white">1</span>
      </div>

      <div className="flex flex-col items-center justify-center">
        <span className="text-center text-lg font-bold text-black dark:text-white">
          Weight and Bias
        </span>
        <MatrixInput
          columns={4}
          idPrefix="w"
          defaultValues={matrixWB}
          onMatrixChange={handleMatrixWBChange}
        />
      </div>

      <div className="flex flex-row items-center justify-center gap-4 px-4 pt-8 xs:pt-0">
        <div className="flex flex-col items-center justify-center">
          <span className="text-center text-lg font-bold text-black dark:text-white">
            Z
          </span>
          <MatrixInput
            columns={1}
            idPrefix="z"
            defaultValues={matrixZ}
            onMatrixChange={setMatrixZ}
            disabled
          />
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-center text-lg font-bold text-black dark:text-white">
            A
          </span>
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
