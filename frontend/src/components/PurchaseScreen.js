import React, { useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import Calendar from 'react-calendar'
import { BsArrowBarRight, BsSearch } from 'react-icons/bs'

export default function PurchaseScreen() {

  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  
    const toggleCalendar = () => {
      setShowCalendar(!showCalendar);
    }


  return (
    <Container fluid>
      <h1>Purchase Data</h1>
      <Row className='d-flex'>
      <Form.Group className='w-25'>
        <div className='d-flex border rounded'>
        <Form.Control value={''}
          placeholder='input delivery note number'
        />
        <Button variant='secondary'>
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
    </Container>
  )
}
