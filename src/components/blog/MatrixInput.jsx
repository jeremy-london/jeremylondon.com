import { Fragment, useState, useRef, useEffect } from 'react';

const MatrixInput = ({ columns, idPrefix, defaultValues, onMatrixChange, disabled, width = "w-auto" }) => {
  const [values, setValues] = useState(defaultValues);
  const inputsRef = useRef([]);

  useEffect(() => {
    setValues(defaultValues);
  }, [defaultValues]);

  const handleInputChange = (row, column, value) => {
    let newValue = value === '' ? '' : Number(value);
    newValue = isNaN(newValue) ? '' : newValue;
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
    // Call window.executePython after the value update
    window.executePython && window.executePython();
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
            type="text" // Use "text" for more control
            inputMode="numeric" // Ensures numeric keyboard on mobile devices
            pattern="[0-9]*" // Allows only numbers, but doesn't strictly enforce it
            className="text-sm sm:text-base text-center rounded-md border disabled:border-gray-400 disabled:dark:border-gray-600 border-gray-200 dark:border-gray-200 text-black dark:text-white disabled:bg-[#d0d0d0] disabled:dark:bg-[#222222]"
            value={value.toString()} // Convert value to string to handle empty and '0' values
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
