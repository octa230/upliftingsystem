import React, { useEffect, useState } from 'react'
import Card from 'react-bootstrap/esm/Card'
import Row from 'react-bootstrap/esm/Row'
import Col from 'react-bootstrap/esm/Col'
import axios from 'axios'
import MessageBox from './MessageBox'




const MonthlySummaryCard = ({ type, totalPurchase, totalSold, totalDamage, totalDisplay, totalQuantity }) => {
  return (
    <Card>
      <Card.Body>
        <Card.Title>{type.toUpperCase()}</Card.Title>
        <Card.Text>Total Purchase: {totalPurchase}</Card.Text>
        <Card.Text>Total Sold: {totalSold}</Card.Text>
        <Card.Text>Total Damage: {totalDamage}</Card.Text>
        <Card.Text>Total Display: {totalDisplay}</Card.Text>
        <Card.Text>Total Quantity: {totalQuantity}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default function Analytics() {
const [summary, setSummary] = useState([]) 


useEffect(()=> {
    const getSummary = async()=> {
        const {data} = await axios.get('/api/transactions/monthly-summary')
        setSummary(data)
      }
getSummary()  
}, [])

  return (
    <div>
    <h2>Month Summary</h2>
      <Row className='m-1 bg-warning p-3'>
        {summary ? summary && summary.map(({ _id, totalPurchase, totalSold, totalDamage, totalDisplay, totalQuantity })=>(
        <Col key={_id}>
        <MonthlySummaryCard
          type={_id}
          totalPurchase={totalPurchase}
          totalSold={totalSold}
          totalDamage={totalDamage}
          totalDisplay={totalDisplay}
          totalQuantity={totalQuantity}
        />
      </Col>
        )):(<MessageBox>No Data</MessageBox>) }
      </Row>
      
    </div>
  )
}
