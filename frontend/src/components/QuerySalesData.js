import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Form, Button, Alert} from 'react-bootstrap';
import axios from 'axios';

function QuerySalesData() {
  // State to store query parameters
  const [query, setQuery] = useState({});

  // State to store sales data
  const [sales, setSales] = useState(null); // Initialize to null

  // State to store the total count of results
  const [totalCount, setTotalCount] = useState(0);

  // Function to fetch sales data based on query parameters
  async function fetchSales() {
    if (Object.keys(query).length > 0) {
      try {
        const response = await axios.get('/api/multiple/for', {
          params: query,
        });
        setSales(response.data);
        setTotalCount(response.data.length); // Set the total count
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    } else {
      setSales(null); // Set to null when no query is provided
      setTotalCount(0);
    }
  }

  useEffect(() => {
    fetchSales();
  }, [query]);

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuery({ ...query, [name]: value });
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h2>Sales Data</h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Year</Form.Label>
            <Form.Control
              type="text"
              name="year"
              placeholder="Enter year"
              value={query.year || ''}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Month</Form.Label>
            <Form.Control
              type="text"
              name="month"
              placeholder="Enter month"
              value={query.month || ''}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Day</Form.Label>
            <Form.Control
              type="text"
              name="day"
              placeholder="Enter day"
              value={query.day || ''}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Button variant="primary" onClick={fetchSales}>
            Search
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          {sales !== null ? (
            <div>
              <p>Total Results: {totalCount}</p>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Invoice Code</th>
                    <th>Date</th>
                    <th>customer</th>
                    <th>Total</th>

                    {/* Add more table headers here */}
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale.InvoiceCode}</td>
                      <td>{sale.date}</td>
                      <td>Name: {sale.name}
                      <br/><span><strong>{`Phone:${sale.phone}`}</strong></span>
                      </td>
                      <td>{sale.total}</td>
                      {/* Add more table data cells here */}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant='warning'>No data</Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default QuerySalesData;
