import React, {useEffect, useState} from 'react'
import Form from 'react-bootstrap/esm/Form';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Table from 'react-bootstrap/esm/Table';
import axios from 'axios';
import Button from 'react-bootstrap/esm/Button';

export default function Damages() {
  const [product, setProduct] = useState('');
  const [isDamaged, setIsDamaged] = useState(false);
  const [isDisplay, setIsDisplay] = useState(false);
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('')
  const [results, setResults] = useState([]);
  const [products, setProducts] = useState([])



  //sort function
  const handleSubmit = async(e)=>{
    e.preventDefault()
    try{
      const response = await axios.get('/api/damages/stats', {
        params:{
          product,
          isDamaged,
          isDisplay,
          month,
          day,
          year
        }
      })
      setResults(response.data)
      console.log(results)
    }catch(error){
      console.log(error)
    }
  }


  ///fetch names useEffect
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
      <h1>Damages & Display Insights</h1>
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
          <Col>
          <label>Damaged</label>
            <Form.Group controlId="isDamaged" className='py-3'>
              <Form.Check
                type="checkbox"
                label="Is Damaged"
                checked={isDamaged}
                onChange={() => setIsDamaged(!isDamaged)}
              />
            </Form.Group>
          </Col>
          <Col>
          <label>Display</label>
            <Form.Group controlId="isDisplay" className='py-3'>
              <Form.Check
                type="checkbox"
                label="Is Display"
                checked={isDisplay}
                onChange={() => setIsDisplay(!isDisplay)}
              />
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
          </Col>
          <Col>
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


{/**results TABLE */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Day</th>
            <th>Month</th>
          </tr>
        </thead>
        <tbody>
          {results && results.quantityByDayAndMonth?.map((result, index) => (
            <tr key={index}>
              <td>{product}</td>
              <td>{result.quantity}</td>
              <td>{result.day}</td>
              <td>{result.month}</td>
            </tr>
          ))}
          <tr>
          <td>Total: {results.totalQuantity}</td>
          </tr>
        </tbody>
      </Table>
      
    </div>
  )
}
