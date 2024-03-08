import { Fragment, useState, useEffect } from 'react';

const MatrixInput = ({ columns, idPrefix, defaultValues, onMatrixChange, disabled }) => {
  const [values, setValues] = useState(defaultValues);
  
  useEffect(() => {
    setValues(defaultValues);
  }, [defaultValues]);

  const handleInputChange = (row, column, value) => {
    let newValue = value === '' ? '' : Number(value);
    newValue = isNaN(newValue) ? '' : newValue;
    updateValue(row, column, newValue);
  };

  const handleKeyDown = (row, column, event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      // Prevent the default input behavior
      event.preventDefault();
      const currentValue = values[row][column] || 0;
      const increment = event.key === 'ArrowUp' ? 1 : -1;
      const newValue = currentValue + increment;
      updateValue(row, column, newValue);
    }
  };

  const updateValue = (row, column, newValue) => {
    const newValues = [...values];
    newValues[row] = [...newValues[row]];
    newValues[row][column] = newValue;
    setValues(newValues);
    onMatrixChange(newValues);
  };

  return (
    <div
      className={`grid grid-cols-${columns} gap-2`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {values.map((rowValues, rowIndex) => (
        <Fragment key={`row-${rowIndex}`}>
        {rowValues.map((value, columnIndex) => (
          <input
            key={`${idPrefix}-${rowIndex}-${columnIndex}`}
            type="text" // Use "text" for more control
            inputMode="numeric" // Ensures numeric keyboard on mobile devices
            pattern="[0-9]*" // Allows only numbers, but doesn't strictly enforce it
            className="text-center rounded-md border border-gray-200 text-black dark:text-white disabled:bg-[#d0d0d0] disabled:dark:bg-[#222222]"
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
