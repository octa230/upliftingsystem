import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Form from 'react-bootstrap/esm/Form';
import Table from 'react-bootstrap/esm/Table';
import Button from 'react-bootstrap/esm/Button';
import Col from 'react-bootstrap/esm/Col'
import Row from 'react-bootstrap/esm/Row'

export default function ProductsData() {

  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [name, setName]= useState('')
  const [results, setResults] = useState([])
  const [products, setProducts] = useState([])
  const [day, setDay] = useState('')
  const [product, setProduct] = useState('')

  const handleSubmit = async(e)=> {
    e.preventDefault()

    try{
      const response = await axios.get('/api/product/purchase-history', {
        params:{
          month, 
          year, 
          day,
          product
        }
      })
      setResults(response.data)
    }catch(err){
      console.log(err)
    }
  }

  useEffect(()=> {
    async function getNames(){
      const res = await axios.get('/api/product/names')
      setProducts(res.data)
      console.log(products)
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
      <Table striped bordered hover>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Purchases</th>
          <th>Total Price</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {results && results.map(row => (
          <tr key={row.ProductID}>
            <td>{row.Name}</td>
            <td>{row.TotalPurchases}</td>
            <td>{row.TotalPrice}</td>
            <td>{row.Date}</td>
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
