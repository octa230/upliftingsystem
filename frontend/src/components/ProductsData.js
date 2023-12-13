import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Form from 'react-bootstrap/esm/Form';
import Table from 'react-bootstrap/esm/Table';
import Button from 'react-bootstrap/esm/Button';
import Col from 'react-bootstrap/esm/Col'
import Card from 'react-bootstrap/esm/Card'
import Row from 'react-bootstrap/esm/Row'

export default function ProductsData() {

  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  //const [name, setName]= useState('')
  const [results, setResults] = useState([])
  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState({})
  const [day, setDay] = useState('')
  const [product, setProduct] = useState('')

  const handleSubmit = async(e)=> {
    e.preventDefault()

    try{
      const {data} = await axios.get('/api/transactions/records', {
        params:{
          month, 
          year, 
          day,
        }
      })
      setResults(data.data)
      setSummary(data.totals)
    }catch(err){
      console.log(err)
    }
  }

  useEffect(()=> {
    async function getNames(){
      const res = await axios.get('/api/product/names')
      setProducts(res.data)
      //console.log(products)
    }
    getNames()
  }, [])

 
   



  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col>
          <Form.Group controlId="product">
              <Form.Label>Product</Form.Label>
              <Form.Select as='select' value={product} onChange={(e)=> setProduct(e.target.value)}>
                <option value="">---select---</option>
                {products.map((x)=> (
                  <option key={x._id} value={x._id}>
                    {x.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
        <Col>
            <Form.Group controlId="month">
              <Form.Label>Month</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="year">
              <Form.Label>year</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </Form.Group>
          </Col>          <Col>
            <Form.Group controlId="day">
              <Form.Label>Day</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
            </Form.Group>
          </Col> 
        </Row>
        <Button className='my-3' type='submit'>sort</Button>
      </Form>
      <div className='mb-3'>
      <Row>
        {summary && Object.entries(summary).map(([type, { quantity, valuation }]) => (
          renderSummaryCard(type, quantity, valuation)
        ))}
      </Row>
      </div>
      <Table striped bordered hover style={{ maxHeight: '500px', overflowY: 'auto' }}>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Transaction Type</th>
          <th>QTY</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {results && results.map(row => (
          <tr key={row._id}>
            <td>{row.productName}</td>
            <td>{row.type}</td>
            <td>{row.quantity}</td>
            <td>{new Date(row.createdAt).toLocaleString()}</td>
            {/* <td>
              <ul>
                {row.productWisePurchases && row.productWisePurchases.map(entry => (
                  <li key={entry.date}>
                    On: {entry.date}: QTY: {entry.purchase}
                  </li>
                ))}
              </ul>
            </td> */}
          </tr>
        ))}
      </tbody>
    </Table>

    </div>
  )
}


const renderSummaryCard = (type, quantity, valuation) => (
  <Col key={type} xs={12} sm={6} md={3}>
    <Card className='bg-light text-dark border border-3 border-warning'>
      <Card.Body>
        <Card.Title>{type.toUpperCase()}</Card.Title>
        <Card.Text>
          Quantity: {quantity}<br />
          Valuation: {valuation}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
);