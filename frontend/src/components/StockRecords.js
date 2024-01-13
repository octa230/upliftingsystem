import React, { useState } from 'react'
import Form from 'react-bootstrap/esm/Form' 
import Row from 'react-bootstrap/esm/Row'
import Button from 'react-bootstrap/esm/Button'
import Col from 'react-bootstrap/esm/Col'
import axios from 'axios'
import Table from 'react-bootstrap/esm/Table'
import Alert from 'react-bootstrap/esm/Alert'

export default function StockRecords() {
  
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [data, setData] = useState(null)


  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.get(`/api/stock/q?month=${month}&year=${year}&day=${day}`);
    const responseData = Array.isArray(res.data) ? res.data[0] : res.data;
    setData(responseData);
    //console.log(responseData.products);
  };  

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23

  return (
    <div>
      <Row>
      <div className='d-flex m-2'>
       <Form.Group className='mx-2'>
       <Form.Label>Year</Form.Label>
      <Form.Control type='input'
        value={year}
        onChange={(e)=> setYear(e.target.value)}
      />
       </Form.Group>
      <Form.Group className='mx-2'>
      <Form.Label>Month</Form.Label>
      <Form.Control type='input'
        value={month}
        onChange={(e)=> setMonth(e.target.value)}
      />
      </Form.Group>
      <Form.Group className='mx-2'>
      <Form.Label>Day</Form.Label>
      <Form.Control type='input'
        value={day}
        onChange={(e)=> setDay(e.target.value)}
      />
      </Form.Group>
        </div>
        <Button disabled={!year || !day || !month }
          onClick={handleSubmit} 
          className='mx-2 mb-2 w-50'
        >
          SORT
        </Button>
      </Row>
      <Row>
        <Col className='p-3 m-1'>
          <Alert>
          CLOSING STOCK VALUE:{data?.closingStockvalue || 'N/A'}
          </Alert>
        </Col>
        <Col className='p-3 m-1'>
          <Alert>CLOSING DAMAGES VALUE:{data?.TotalDamagesvalue || 'N/A'}</Alert>
        </Col>
        <Col className='p-3 m-1'>
          <Alert>
          CLOSING SOLD VALUE:{data?.TotalSoldvalue || 'N/A'}
          </Alert>
        </Col>
      </Row>
      <div>
        <Table bordered>
          <thead>
            <tr>
              <th>Name</th>
              <th>purchase</th>
              <th>Sold</th>
              <th>damage</th>
              <th>Price</th>
              <th>Closing</th>
              <th>{`close value(AED)`}</th>
            </tr>
          </thead>
          <tbody>
            {data && data.products.map((product)=>(
              <tr key={product.productId}>
              <td>{product.productName}</td>
              <td>{product.purchase}</td>
              <td>{product.sold}</td>
              <td>{product.damaged}</td>
              <td>{product.price}</td>
              <td>{product.closingStock}</td>
              <td>{round2(product.Total)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  )
}
