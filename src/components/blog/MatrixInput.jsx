import { Fragment, useState, useRef, useEffect } from 'react';

const MatrixInput = ({ columns, idPrefix, defaultValues, onMatrixChange, disabled, width = "w-auto" }) => {
  const [values, setValues] = useState(defaultValues);
  const [temporaryValues, setTemporaryValues] = useState({});
  const inputsRef = useRef([]);

  useEffect(() => {
    setValues(defaultValues);
  }, [defaultValues]);

  const setTemporaryValue = (row, column, value) => {
    // Store the temporary value in a way that you can identify the specific input it belongs to
    const key = `${row}-${column}`;
    const newTempValues = { ...temporaryValues, [key]: value };
    setTemporaryValues(newTempValues);
  };
  
  const clearTemporaryValue = (row, column) => {
    const key = `${row}-${column}`;
    const newTempValues = { ...temporaryValues };
    delete newTempValues[key];
    setTemporaryValues(newTempValues);
  };
  
  const handleInputChange = (row, column, value) => {
    // Directly handle empty input or just a "-" to allow users to clear the input or start typing a negative number
    if (value === '' || value === '-') {
      // Temporarily store the value as is (including just "-") in a local or component state
      // to allow the input field to reflect the user's intent
      setTemporaryValue(row, column, value);
      return; // Skip further processing and avoid calling updateValue for now
    }
  
    // When input is not just "-", try to convert it to a number
    const newValue = Number(value);
    if (!isNaN(newValue)) {
      // If conversion is successful and we have a valid number, proceed with the update
      
      clearTemporaryValue(row, column); // Clear any temporary value now that we have a valid number
    } else {
      // if there are special characters or multiple negative signs, the conversion will fail so we can just remove them
      const cleanedValue = value.replace(/[^0-9-]/g, '');
      const newValue = cleanedValue === '-' ? '' : Number(cleanedValue);
      setTemporaryValue(row, column, newValue);
      // If conversion fails, likely due to invalid input, do nothing or handle as needed
      return;
    }

    updateValue(row, column, newValue);
  };


  const handleKeyDown = (row, column, event) => {
    const index = row * columns + column;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const currentValue = values[row][column] || 0;
      const increment = event.key === 'ArrowUp' ? 1 : -1;
      const newValue = currentValue + increment;
      updateValue(row, column, newValue);
      
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      // Move focus to the previous input if not the first input
      if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      // Move focus to the next input if not the last input
      if (index < values.flat().length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };
  



  const updateValue = (row, column, newValue) => {
    const newValues = [...values];
    newValues[row] = [...newValues[row]];
    newValues[row][column] = newValue;
    setValues(newValues);
    onMatrixChange(newValues);
  };

  // Assign refs and set input properties
  const assignRef = (element, rowIndex, columnIndex) => {
    const index = rowIndex * columns + columnIndex;
    inputsRef.current[index] = element;
  };

  return (
    <div
      className={`grid grid-cols-${columns} gap-2 ${width}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {values.map((rowValues, rowIndex) => (
        <Fragment key={`row-${rowIndex}`}>
        {rowValues.map((value, columnIndex) => (
          <input
            key={`${idPrefix}-${rowIndex}-${columnIndex}`}
            ref={(element) => assignRef(element, rowIndex, columnIndex)}
            type="text"
            inputMode={/Android/i.test(navigator.userAgent) ? "decimal" : "numeric"}
            pattern="-?[0-9]*" // Allows only numbers, but doesn't strictly enforce it
            className="text-sm sm:text-base text-center rounded-md border disabled:border-gray-400 disabled:dark:border-gray-600 border-gray-200 dark:border-gray-200 text-black dark:text-white disabled:bg-[#d0d0d0] disabled:dark:bg-[#222222]"
            value={temporaryValues[`${rowIndex}-${columnIndex}`] ?? value.toString()} // Convert value to string to handle empty and '0' values
            onChange={(e) => handleInputChange(rowIndex, columnIndex, e.target.value)}
            onKeyDown={(e) => handleKeyDown(rowIndex, columnIndex, e)}
            disabled={disabled}
          />
        ))}
        </Fragment>
      ))}
    </div>
  );
};

export default MatrixInput;
