
import React from 'react'
import Table from 'react-bootstrap/esm/Table'

export default function TableComponent(props) {
  const {data, columns} = props
  console.log('data', data)
  console.log('columns', columns)
  return (
    <Table striped>
      <thead>
        <tr>
            {columns.map((column, index)=> (
                <th key={index}>{column}</th>
            ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex)=>(
            <tr key={rowIndex}>
                {columns.map((column, columnIndex)=> (
                  <td key={columnIndex}>
                    {row[column]}
                    </td>
                ))}
            </tr>
        ))}
      </tbody>
    </Table>
  )
}
