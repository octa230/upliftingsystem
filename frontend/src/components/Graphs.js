import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Calendar from 'react-calendar';
import axios from 'axios';
import { Chart } from 'react-google-charts';

export default function Graphs() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [type, setType] = useState('');
  const [graphData, setGraphData] = useState([]);
  const [types, setTypes] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get('/api/transactions/visualize', {
        params: {
          startDate,
          endDate,
          type,
        }
      });
      setGraphData(data.results);
      setTypes(data.types);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    handleSubmit();
  }, []); // Fetch data on component mount

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Row className='my-3'>
          <Col lg={4}>
            <Form.Group controlId="type">
              <h3>Transaction Type</h3>
              <Form.Select as='select' value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">---select---</option>
                {types.map((x, index) => (
                  <option key={index} value={x}>
                    {x}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className='p-2 d-flex'>
          <Col className="mb-2" xs={8} md={4}>
            <h5>Start Date</h5>
            <Calendar onChange={setStartDate} value={startDate} />
          </Col>
          <Col className="mb-2" xs={8}>
            <h5>End Date</h5>
            <Calendar onChange={setEndDate} value={endDate} />
          </Col>
        </Row>
        <Button className='my-3' type="submit">Sort</Button>
      </form>

      {/* Render the line graph */}
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Chart
          width={'100%'}
          height={'300px'}
          chartType="LineChart"
          loader={<div>Loading Chart</div>}
          data={prepareGraphData()}
          options={{
            hAxis: {
              title: 'Date',
            },
            vAxis: {
              title: 'Value',
            },
            series: generateSeriesColors(types.length),
          }}
        />
      </div>
    </div>
  );

  function prepareGraphData() {
    const data = [
      ['Date', ...types.map(type => `${type} Quantity`), ...types.map(type => `${type} Price`)]
    ];

    graphData.forEach(({ date, transactions }) => {
      const rowData = [date];
      types.forEach(type => {
        const transaction = transactions.find(({ _id }) => _id === type);
        rowData.push(transaction ? transaction.totalQuantity : 0);
        rowData.push(transaction ? transaction.totalPrice : 0);
      });
      data.push(rowData);
    });

    return data;
  }

  function generateSeriesColors(num) {
    const colors = Array(num * 2).fill('').map((_, index) => {
      return {
        color: getRandomColor(),
      };
    });
    return Object.fromEntries(colors.entries());
  }

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
