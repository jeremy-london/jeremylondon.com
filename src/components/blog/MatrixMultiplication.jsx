import { useState, useRef, useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import MatrixInput from "@components/blog/MatrixInput";
import CodeBlock from "@components/blog/CodeBlock";

const MatrixMultiplication = () => {
  const codeDisplayRootRef = useRef(null);
  const [matrixA, setMatrixA] = useState([
    [1, 1],
    [-1, 1],
  ]);

  const [matrixB, setMatrixB] = useState([
    [1, 5, 2],
    [2, 4, 2],
  ]);

  const [matrixC, setMatrixC] = useState([
    [0, 0, 0],
    [0, 0, 0],
  ]);

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

  // Function to handle changes in Matrix A
  const handleMatrixAChange = (newMatrixA) => {
    setMatrixA(newMatrixA);

    // select id codeDisplay and set its child pre code to string with A = updated
    const codeElement = document.querySelector("#codeDisplay pre code");
    if (codeElement) {
      // Convert newMatrixA to a string in the numpy array format with spacing
      const matrixAString =
        "np.array(" +
        JSON.stringify(newMatrixA)
          .replace(/\[/g, "[")
          .replace(/\]/g, "]")
          .replace(/,/g, ", ")
          .replace(/\],\s+\[/g, "], [") +
        ")";

      // Replace the A matrix in the existing code
      const existingCode = codeElement.textContent;
      const updatedCode = existingCode.replace(
        /A = np.array\(\[\[.*?\]\]\)/gs,
        `A = ${matrixAString}`,
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
  const handleMatrixBChange = (newMatrixB) => {
    setMatrixB(newMatrixB);

    // select id codeDisplay and set its child pre code to string with B = updated
    const codeElement = document.querySelector("#codeDisplay pre code");
    if (codeElement) {
      // Convert newMatrixB to a string in the numpy array format with spacing
      const matrixBString =
        "np.array(" +
        JSON.stringify(newMatrixB)
          .replace(/\[/g, "[")
          .replace(/\]/g, "]")
          .replace(/,/g, ", ")
          .replace(/\],\s+\[/g, "], [") +
        ")";

      // Replace the B matrix in the existing code
      const existingCode = codeElement.textContent;
      const updatedCode = existingCode.replace(
        /B = np.array\(\[\[.*?\]\]\)/gs,
        `B = ${matrixBString}`,
      );

      // Render the updated code using the stored root
      if (codeDisplayRootRef.current) {
        const syntaxHighlighterElement = <CodeBlock code={updatedCode} />;
        codeDisplayRootRef.current.render(syntaxHighlighterElement);
      }
      window.executePython && window.executePython(updatedCode);
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
    window.addEventListener("pythonOutputChanged", handlePythonOutputChange);

    // Return a cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener(
        "pythonOutputChanged",
        handlePythonOutputChange,
      );
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
      const matrixRows = matrixNumbers.split("]\n [");
      // Map each row string to an array of numbers
      const matrix = matrixRows.map(
        (row) =>
          row
            .trim() // Trim whitespace
            .split(/\s+/) // Split by one or more spaces
            .map(Number), // Convert each element to a number
      );
      return matrix;
    }
    return []; // Return an empty array if the pattern is not matched
  }

  return (
    <div
      id="interactiveInputs"
      className="mb-4 grid hidden grid-cols-[2fr_3fr] grid-rows-[2fr_1fr] gap-2 rounded-md bg-[#e9e9e9] pt-4 pr-2 pb-8 pl-2 text-[#d0d0d0] sm:gap-4 sm:pr-0 sm:pl-4 dark:bg-[#292929] dark:text-[#f5f2f0]">
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
  );
};

export default MatrixMultiplication;
