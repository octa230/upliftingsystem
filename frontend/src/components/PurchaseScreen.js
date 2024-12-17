import axios from 'axios';
import React, { useState } from 'react'
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap'
import Calendar from 'react-calendar'
import { BsSearch } from 'react-icons/bs'

export default function PurchaseScreen() {

  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryNote, setDeliveryNote] = useState('')
  const [purchase, setPurchase] = useState({})


    const queryPurchase = async(e)=>{
      if(deliveryNote !== ''){
        const {data} = await axios.get(`/api/transactions/${deliveryNote}`)
        setPurchase(data)
      }
    }
  
  
    const toggleCalendar = () => {
      setShowCalendar(!showCalendar);
    }


  return (
    <Container fluid>
      <h1>Purchase Data</h1>
      <Row className='d-flex'>



      <Form.Group className='w-25'>
        <div className='d-flex border rounded'>
        <Form.Control
          placeholder='input delivery note number'
          type='text'
          onChange={(e)=> setDeliveryNote(e.target.value)}
          value={deliveryNote}
        />
        <Button variant='secondary' onClick={queryPurchase}>
        <BsSearch/>
        </Button>
        </div>
      </Form.Group>
      <Col>
          <Button onClick={toggleCalendar}>
            CHOOSE DATE
          </Button>
          {showCalendar && (
            <div className='my-2'>
              <Calendar onChange={setDate} value={new Date(date)} />
            </div>
          )}
        </Col>
      </Row>

      <div>
      <h2>Purchase Details:{deliveryNote}</h2>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {purchase && purchase.Items?.length > 0 ? (
            purchase.Items.map((item, index) => (
              <tr key={item._id}>
                <td className='d-flex'>
                  {index + 1}
                  <Form.Check className='px-2'/>
                </td>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{item.purchasePrice}</td>
                <td>{item.quantity * item.purchasePrice}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No items found</td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="purchase-summary">
        <p><strong>Delivery Note:</strong> {deliveryNote}</p>
        <p><strong>Total:</strong> {purchase.total}</p>
        <p><strong>Created At:</strong> {new Date(purchase.createdAt).toLocaleString()}</p>
        <p><strong>Updated At:</strong> {new Date(purchase.updatedAt).toLocaleString()}</p>
      </div>
    </div>
    </Container>
  )
}
