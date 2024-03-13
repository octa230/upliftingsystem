import React, { useEffect, useState} from 'react'
import axios from 'axios'
import Form from 'react-bootstrap/esm/Form';
import Table from 'react-bootstrap/esm/Table';
import Button from 'react-bootstrap/esm/Button';
import Col from 'react-bootstrap/esm/Col'
import MessageBox from './MessageBox'
import Row from 'react-bootstrap/esm/Row'

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
   const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write('<html><head><title>Print</title>');
      // Add any print-specific styles here if needed
      printWindow.document.write(
        '<link rel="stylesheet" type="text/css" href="path-to-your-print-style.css">'
      );
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h1>TRANSACTIONS DATA TABLE</h1>');
      printWindow.document.write(document.getElementById('data-table').outerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    } else {
      console.error('Failed to open a new window for printing.');
    }
  };

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
      <Table striped bordered hover style={{ maxHeight: '500px', overflowY: 'auto' }} id='data-table'>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Buying</th>
          <th>Selling</th>
          <th>Type</th>
          <th>Qty</th>
          <th className='d-flex justify-content-between'>
            <span>
              Date
            </span>
            <span>
              <Button variant='' onClick={()=>handlePrint()}>Print</Button>
            </span>
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


/* const renderSummaryCard = (totalPrice, totalQuantity) => (
  <Col key={'i'} xs={12} sm={6} md={3}>
    <Card className='bg-light text-dark border border-3 border-warning'>
      <Card.Body>
         <Card.Title>{type.toUpperCase()}</Card.Title> 
        <Card.Text>
          Quantity: {totalQuantity}<br />
          Valuation: {totalPrice.toFixed(2)}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
);  */