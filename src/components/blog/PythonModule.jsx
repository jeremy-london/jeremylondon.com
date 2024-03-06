import Button from '@components/ui/button.astro';
import { useState, useEffect } from 'react';

const PythonModule = ({children, filePath}) => {
  useEffect(() => {
    initPyodide();
  }, []);

  const initPyodide = async () => {
    window.pyodide = await loadPyodide();
    const pythonCode = await loadPythonExample()
    await executePython()
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
    
    const loadingDisplay = document.getElementById('loadingDisplay');
    const outputDisplay = document.getElementById('outputDisplay');
    const executeButton = document.getElementById('executeButton');
    const interactiveInputs = document.getElementById('interactiveInputs');

    interactiveInputs.classList.remove('hidden');
    executeButton.classList.remove('hidden');
    codeDisplay.classList.remove('hidden');
    outputDisplay.classList.remove('hidden');
    loadingDisplay.classList.add('hidden');
    
  };

  const executePython = async () => {
    const codeElement = document.querySelector('#codeDisplay pre code');
    const code = codeElement.textContent;
    const outputElement = document.getElementById('output');

    // clear the output
    outputElement.value = '';
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
      pyodide.runPython(`sys.stdout = sys.__stdout__`);
    }
  };

  return (
    <div className="flex">

      <div className="flex flex-col w-full mb-4" >

        <div id="loadingDisplay" className="flex flex-col text-center items-center py-8 gap-4">
          <span>Loading Interactive Coding Environment...</span>
          <div
          className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status">
            <span
              className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
            >Loading...</span>
          </div>
        </div>

        <button id="executeButton" onClick={() => executePython()} className="hidden w-full bg-black text-white hover:bg-gray-900  border-2 border-transparent dark:bg-white dark:text-black dark:hover:bg-gray-300 rounded-md mb-4">Execute Python Code</button>
        
        <div id="codeDisplay" className="bg-[#1F2937] dark:bg-[#030506] rounded-md mb-4 hidden">
          <pre>
            <code style={{ float: 'left' }}></code>
          </pre>
        </div>

        <div id="outputDisplay" className="bg-[#1F2937] dark:bg-[#030506] text-[#f5f2f0] p-4 rounded-md hidden">
          <div>Output:</div>
          <textarea id="output" className="full-height w-full resize-none bg-[#1F2937] dark:bg-[#030506] text-[#f5f2f0] p-2" rows="10"></textarea>
        </div>
      </div>
    </div>
  );
};


export default PythonModule;