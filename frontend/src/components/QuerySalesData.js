import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Form, Button, Alert} from 'react-bootstrap';
import axios from 'axios';
import { getError } from '../utils/getError'
import { toast } from 'react-toastify'
import { FaEye } from 'react-icons/fa'
import SaleDetailsModal from './SaleDetailsModal'


export default function QuerySalesData (){
  // State to store query parameters
  const [query, setQuery] = useState({});

  // State to store sales data
  const [sales, setSales] = useState(null); // Initialize to null
  const [selectedSale, setSelectedSale] = useState({})
  const [showModal, setShowModal] = useState(false)

  // State to store the total count of results
  const [totalCount, setTotalCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [focSales, setFocSales] = useState(0)


  // Function to fetch sales data based on query parameters
  const fetchSales =async()=> {
    if (Object.keys(query).length > 0) {
      try {
        const response = await axios.get('/api/multiple/for', {
          params: query,
        });
        setSales(response.data.sales);
        setTotalCount(response.data.totalCount); // Set the total count
        setTotalValue(response.data.totalValue)
        setFocSales(response.data.focSales)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    } else {
      setSales(null); // Set to null when no query is provided
      setTotalCount(0);
    }
  }

  const handleViewSale = async (saleId)=> {
    try{
     const result = await axios.get(`/api/multiple/get-sale/${saleId}`)
     setSelectedSale(result.data)
     setShowModal(true)
    } catch(error){
     toast.error(getError(error))
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
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23

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
              <div className='d-flex justify-content-between'>
              <Alert variant='warning'>Total Results: {totalCount}</Alert>
              <Alert variant='warning'>Total value: {round2(totalValue)}</Alert>
              <Alert variant='warning'>F.O.C. {round2(focSales)}</Alert>
              </div>
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
                      <td>
                      <Button onClick={()=>handleViewSale(sale._id)} className='bg-primary border'>
                          <span className='px-1'>
                              <FaEye/>
                            </span>
                          {sale.InvoiceCode}
                        </Button>
                      </td>
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
              <SaleDetailsModal show={showModal} onHide={()=>setShowModal(false)} selectedSale={selectedSale}/>
            </div>
          ) : (
            <Alert variant='warning'>No data</Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}
