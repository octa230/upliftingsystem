import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Form, Button, Alert} from 'react-bootstrap';
import axios from 'axios';
import { getError } from '../utils/getError';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import { FaEye } from 'react-icons/fa';
import { BsPencil, BsCheck2 } from 'react-icons/bs';
import SaleDetailsModal from './SaleDetailsModal';

export default function QuerySalesData (){
  // State to store query parameters
  const [query, setQuery] = useState({});

  // State to store sales data
  const [sales, setSales] = useState(null); // Initialize to null
  const [selectedSale, setSelectedSale] = useState({});
  const [showModal, setShowModal] = useState(false);

  // State to store the total count of results
  const [totalCount, setTotalCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [focSales, setFocSales] = useState(0);

  // State for editing
  const [editingSale, setEditingSale] = useState(null);
  const [paidBy,  setPaidBy]= useState('');
  const [service, setService]= useState('');
  const [date, setDate] = useState(new Date());

  // Function to fetch sales data based on query parameters
  const fetchSales = async () => {
    try {
      const response = await axios.get('/api/multiple/for', { params: query });
      setSales(response.data.sales);
      setTotalCount(response.data.totalCount);
      setTotalValue(response.data.totalValue);
      setFocSales(response.data.focSales);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Function to handle viewing sale details
  const handleViewSale = async (saleId) => {
    try {
      const result = await axios.get(`/api/multiple/get-sale/${saleId}`);
      setSelectedSale(result.data);
      setShowModal(true);
    } catch(error) {
      toast.error(getError(error));
    }
  };

  // Function to handle editing sale
  const handleEdit = async (sale) => {
    if (!editingSale || editingSale._id !== sale._id) {
      setEditingSale(sale); // Start editing the selected sale
    } else {

      await axios.put(`/api/multiple/edit/${sale._id}`, {
        time: new Date(date).toLocaleDateString(),
        service: service,
        paidBy: paidBy
      })
      console.log('closed');
    }
    setEditingSale(null); // Reset editing state
  };

  useEffect(() => {
    fetchSales();
  }, [query, editingSale]);

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuery({ ...query, [name]: value });
  };

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23

  return (
    <div>
      <Row className="my-2">
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
              <Table bordered hover responsive>
                <thead>
                  <tr>
                    <th>Invoice Code</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Paid By</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td>
                        <Button onClick={() => handleViewSale(sale._id)} className='bg-primary border'>
                          <span className='px-1'>
                            <FaEye/>
                          </span>
                          {sale.InvoiceCode}
                        </Button>
                      </td>
                      <td>
                        {editingSale && editingSale._id === sale._id ? (
                          <Calendar onChange={setDate} value={date}/>
                        ) : (
                          <>{sale.date}</>
                        )}
                      </td>
                      <td>{sale.name}</td>
                      <td>
                        {editingSale && editingSale._id === sale._id ? (
                          <Form.Select onChange={(e) => setService(e.target.value)}>
                            <option>Select...</option>
                            <option>Delivery</option>
                            <option>Store Pick Up</option>
                            <option>website</option>
                            <option>insta-shop</option>
                            <option>Delivero</option>
                            <option>Careem</option>
                          </Form.Select>
                        ) : (
                          <>{sale.service}</>
                        )}
                      </td>
                      <td>
                        {editingSale && editingSale._id === sale._id ? (
                          <Form.Select onChange={(e) => setPaidBy(e.target.value)}>
                            <option>Select...</option>
                            <option>Card</option>
                            <option>Cash</option>
                            <option>TapLink</option>
                            <option>Bank Transfer</option>
                          </Form.Select>
                        ) : (
                          <td>{sale.paidBy}</td>
                        )}
                      </td>
                      <td>{sale.total}</td>
                      <td>
                        {!editingSale || editingSale._id !== sale._id ? (
                          <BsPencil onClick={() => handleEdit(sale)}/>
                        ) : (
                          <BsCheck2 onClick={() => handleEdit(sale)}/>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <SaleDetailsModal show={showModal} onHide={() => setShowModal(false)} selectedSale={selectedSale}/>
            </div>
          ) : (
            <Alert variant='warning'>No data</Alert>
          )}
        </Col>
      </Row>
    </div>
  );
}
