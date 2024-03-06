import { Fragment, useState } from 'react';

const MatrixInput = ({ columns, idPrefix, defaultValues, onMatrixChange }) => {
  const [values, setValues] = useState(defaultValues);

  const handleInputChange = (row, column, value) => {
    const newValues = [...values];
    newValues[row] = [...newValues[row]];
    newValues[row][column] = Number(value);
    setValues(newValues);
    onMatrixChange(newValues);
  };

  const gridTemplateColumns = `grid-cols-${columns}`;

  return (
    <div
      className={`grid ${gridTemplateColumns} gap-2`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {values.map((rowValues, rowIndex) => (
        <Fragment key={`row-${rowIndex}`}>
        {rowValues.map((value, columnIndex) => (
          <input
            key={`${idPrefix}-${rowIndex}-${columnIndex}`}
            type="number"
            className="text-center rounded-md border border-gray-200"
            value={value}
            onChange={(e) => handleInputChange(rowIndex, columnIndex, e.target.value)}
          />
        ))}
        </Fragment>
      ))}
    </div>
  );
};

export default MatrixInput;