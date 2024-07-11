import React from 'react';

const DataTable = ({ headers, data }) => {
  return (
    <table>
      <thead>
        <tr>
          {headers?.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data && data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {headers?.map((header, colIndex) => (
              <td key={colIndex}>{row[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
