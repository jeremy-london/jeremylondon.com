import React, { useEffect } from 'react';

const PythonModule = ({filePath}) => {
  useEffect(() => {
    const initPyodide = async () => {
      window.pyodide = await loadPyodide();
      // document.getElementById('output').value = "Pyodide is ready!\n";

      const pythonCode = await loadPythonExample()
      
      await executePython(pythonCode)
    };

    const loadPythonExample = async () => {
      const rawFileUrl = `https://raw.githubusercontent.com/jeremy-london/solve-by-hand/main/${filePath}`;

      const response = await fetch(rawFileUrl)
      const pythonCode = await response.text();
      displayPythonCode(pythonCode);
      return pythonCode;
    };


    const displayPythonCode = (code) => {
      const codeElement = document.createElement('code');
      codeElement.className = 'language-python';
      codeElement.textContent = code; // Set the text content to the Python code
      const preElement = document.createElement('pre');
      preElement.appendChild(codeElement);
      const codeDisplay = document.getElementById('codeDisplay');
      codeDisplay.innerHTML = ''; // Clear existing content
      codeDisplay.appendChild(preElement);
    };

    const executePython = async (code) => {
      const outputElement = document.getElementById('output');
      try {
        // Setup custom stdout to capture print statements.
        await window.pyodide.runPythonAsync(`
          import io
          import sys
          class CustomStdout(io.StringIO):
              _original_stdout = sys.stdout
              def write(self, string):
                  self._original_stdout.write(string)
                  super().write(string)
          stdout = CustomStdout()
          sys.stdout = stdout
        `);
        // Execute the Python code.
        await window.pyodide.loadPackagesFromImports(code);
        await window.pyodide.runPythonAsync(code);
        // Retrieve and display the captured output.
        const capturedOutput = pyodide.runPython('stdout.getvalue()');
        outputElement.value += ">>>\n" + capturedOutput + "\n";
      } catch (err) {
        outputElement.value += "Error:\n" + err.toString() + "\n";
      } finally {
        // Reset stdout to its original state.
        pyodide.runPython(`
          sys.stdout = sys.__stdout__
        `);
      }
    };

    initPyodide();

    // executePython(pythonCode);
  }, []);

  return (
    <div className="flex">

      <div className="flex flex-col" style={{ width: '100%', height: 'calc(100vh + 4em)' }}>

        <div id="codeDisplay" className="min-h-1/2 overflow-scroll code-display">
          <pre>
            <code className="language-python" style={{ float: 'left' }}></code>
          </pre>
        </div>

        <div className="overflow-scroll output-console">
          <div>Output:</div>
          <textarea id="output" className="full-height w-full" rows="10"></textarea>
        </div>
      </div>
    </div>
  );
};

export default PythonModule;