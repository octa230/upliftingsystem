import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';

const DailySummaryTable = () => {
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    // Fetch daily data from the backend
    fetch('/api/salesData')
      .then(response => response.json())
      .then(data => {
        setDailyData(data.dailyData);
      });
  }, []);

  return (
    <Container>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Total Sales</th>
            <th>Number of Sales</th>
          </tr>
        </thead>
        <tbody>
          {dailyData.map(entry => (
            <tr key={entry.date}>
              <td>{entry.date}</td>
              <td>{entry.dailySummary.totalSales}</td>
              <td>{entry.dailySummary.numSales}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default DailySummaryTable;
