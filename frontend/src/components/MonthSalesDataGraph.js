import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Chart } from 'react-google-charts';
import axios from 'axios';

const MonthSalesDataGraph = () => {
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    async function getData() {
      const { data } = await axios.get('/api/multiple/sales-data');
      setMonthlyData(data.monthlyData);
    }
    getData();
  }, []);

  // Split data into quarters
  const quarters = [];
  for (let i = 0; i < monthlyData.length; i += 3) {
    quarters.push(monthlyData.slice(i, i + 3));
  }

  return (
    <Container>
      {quarters.map((quarter, quarterIndex) => (
        <div key={quarterIndex}>
          <h2>Quarter {quarterIndex + 1}</h2>
          {quarter.map((entry, index) => (
            <Row key={index}>
              <Col>
                <h3>
                  {entry.period.year}/{entry.period.month}
                </h3>
                <Chart
                  width={'100%'}
                  height={'300px'}
                  chartType="Bar"
                  loader={<div>Loading Chart</div>}
                  data={[
                    ['Date', 'Total Sales'],
                    [
                      `${entry.period.month}/${entry.period.year}`,
                      entry.monthlySummary.totalSales,
                    ],
                  ]}
                  options={{
                    chart: {
                      title: 'Monthly Sales Data',
                    },
                  }}
                />
              </Col>
              <Col>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Total Sales</th>
                      <th>Number of Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.monthlySales.map((sale, saleIndex) => (
                      <tr key={saleIndex}>
                        <td>{sale.date}</td>
                        <td>{sale.total}</td>
                        <td>{1}</td> {/* Assuming you want to show the count of daily sales */}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
          ))}
        </div>
      ))}
    </Container>
  );
};

export default MonthSalesDataGraph;
