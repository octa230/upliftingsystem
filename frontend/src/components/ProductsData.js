import React, { useEffect, useRef, useState} from 'react'
import axios from 'axios'
import Form from 'react-bootstrap/esm/Form';
import Table from 'react-bootstrap/esm/Table';
import Button from 'react-bootstrap/esm/Button';
import Col from 'react-bootstrap/esm/Col'
import MessageBox from './MessageBox'
import Row from 'react-bootstrap/esm/Row'
import { useReactToPrint } from 'react-to-print';

export default function ProductsData() {

  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [results, setResults] = useState([])
  const [summary, setSummary] = useState(null)
  const [endDay, setendDay] = useState('')
  const [startDay, setstartDay] = useState('')
  const [type, setType] = useState('')
  const [productName, setProductName] = useState('')
  const [productNames, setProductNames] = useState([])

  const handleSubmit = async(e)=> {
    e.preventDefault()
    try{
      const responseData = await axios.get('/api/transactions/records', {
        params:{
          month, 
          year,
          productName, 
          type,
          startDay,
          endDay
        },
      })
      console.log(
        month, 
          year,
          productName, 
          type,
          startDay,
          endDay
      )
      setResults(responseData.data.data)
      setSummary(responseData.data.totals);
    }catch(err){
      console.log(err)
    }
  }


  const tableRef = useRef()

  useEffect(()=> {
    const fetchProdutNames = async()=>{
      const {data} = await axios.get('/api/product/names')
      setProductNames(data)
      console.log(data)
    }
    fetchProdutNames()
  },[])
 
  const RoundTo = (num)=> Math.round(num * 100 + Number.EPSILON) / 100 //====> 123.4567 - 123.45;
   const types = ['sale', 'display', 'damage', 'purchase']

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <Row className='my-3'>
          <Col lg={4}>
          <Form.Group controlId="type">
              <h3>Transaction Type</h3>
              <Form.Select as='select' value={type} onChange={(e)=> setType(e.target.value)}>
                <option value="">---select---</option>
                {types.map((x, index)=> (
                  <option key={index} value={x}>
                    {x}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <h3>Product</h3>
              <Form.Select as='select' value={productName} onChange={(e)=> setProductName(e.target.value)}>
                <option value=''>--select--</option>
                {productNames?.map((product, index)=> (
                  <option key={product._id} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
        <Col>
            <Form.Group controlId="month">
              <h4>Month</h4>
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
              <h4>year</h4>
              <Form.Control
                type="number"
                placeholder="Enter year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </Form.Group>
          </Col> 
          <Col>
            <Form.Group controlId="startDay">
              <h4>From(Day)</h4>
              <Form.Control
                type="number"
                placeholder="Enter day"
                value={startDay}
                onChange={(e) => setstartDay(e.target.value)}
              />
            </Form.Group>
          </Col> 
          <Col>
            <Form.Group controlId="endDay">
              <h4>To(Day)</h4>
              <Form.Control
                type="number"
                placeholder="Enter day"
                value={endDay}
                onChange={(e) => setendDay(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button className='my-3' type='submit'>sort</Button>
      </Form>

      {summary !== null && (
        <div>
          <MessageBox>Total Price: {RoundTo(summary.totalPrice)}</MessageBox>
          <MessageBox>Total Quantity: {summary.totalQuantity}</MessageBox>
        </div>
      )}
      <Table striped bordered ref={tableRef}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Buying</th>
          <th>Selling</th>
          <th>Type</th>
          <th>Qty</th>
          <th className='d-flex justify-content-between'>
            <span>
              Date
            </span>
              <Button onClick={useReactToPrint({content: ()=> tableRef.current})}>Print</Button>
          </th>
        </tr>
      </thead>
      <tbody>
        {results && results.map(row => (
          <tr key={row._id}>
            <td>{row.productName}</td>
            <td>{row.purchasePrice}</td>
            <td>{row.sellingPrice}</td>
            <td>{row.type}</td>
            <td>{row.quantity}</td>
            <td>{new Date(row.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>

    </div>
  )
}
