
import React from 'react'

export default function Table({data, columns}) {
  return (
    <Table>
      <thead>
        <th>
            {columns.map((column, index)=> (
                <th key={index}>{column}</th>
            ))}
        </th>
      </thead>
      <tbody>
        {data.map((row, rowIndex)=>(
            <tr key={rowIndex}>
                {columns.map((column, columnIndex)=> (
                    <td key={columnIndex}>{row[column]}</td>
                ))}
            </tr>
        ))}
      </tbody>
    </Table>
  )
}
