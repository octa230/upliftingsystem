import React from 'react';
import { Table } from 'react-bootstrap';

const AggregatedDamageTable = ({ data }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Year</th>
          <th>Month</th>
          <th>Day</th>
          <th>Product</th>
          <th>Total Damaged</th>
          <th>Total Display</th>
        </tr>
      </thead>
      <tbody>
        {data.map((yearData) =>
          yearData.months.map((monthData) =>
            monthData.days.map((dayData) =>
              dayData.products.map((productData) => (
                <tr
                  key={`${yearData.year}-${monthData.month}-${dayData.day}-${productData.product._id}`}
                >
                  <td>{yearData.year}</td>
                  <td>{monthData.month}</td>
                  <td>{dayData.day}</td>
                  <td>{productData.product.name}</td>
                  <td>{productData.totalDamaged}</td>
                  <td>{productData.totalDisplay}</td>
                </tr>
              ))
            )
          )
        )}
        <tr>
          <td colSpan="3">Total</td>
          <td></td>
          <td>{data[0].totalYearDamaged}</td>
          <td>{data[0].totalYearDisplay}</td>
        </tr>
      </tbody>
    </Table>
  );
};

export default AggregatedDamageTable;
