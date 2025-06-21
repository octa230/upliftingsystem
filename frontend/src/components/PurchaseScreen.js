import axios from 'axios';
import { useEffect, useState } from 'react'
import { Badge, Container, Form, Table } from 'react-bootstrap'
import { round2 } from '../utils/helpers';

export default function PurchaseScreen() {

  const [date, setDate] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [deliveryNote, setDeliveryNote] = useState('')
  const [total, setTotal] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [purchases, setPurchases] = useState([])


    
  
    useEffect(()=> {
      const queryPurchase = async()=>{
        const {data} = await axios.get(`/api/transactions?deliveryNote=${deliveryNote}&startDate=${date.startDate}&endDate=${date.endDate}`)
        setPurchases(data[0].purchases)
        setTotalCount(data[0].totalCount[0]?.count || 0); // Default to 0 if not found
        setTotal(data[0].totalValue[0]?.total || 0);
    }
    queryPurchase()
    }, [date.startDate, date.endDate, deliveryNote])

  return (
    <Container fluid>
      <h1>Purchase Data</h1>
      <div className='d-flex gap-2 justify-content-between align-items-center'>
        <Form.Group>
          <Form.Label>STARTING</Form.Label>
          <Form.Control type='date' value={date.startDate} onChange={(e)=> setDate(prev => ({...prev, startDate: e.target.value}))}/>
        </Form.Group>

        <Form.Group>
          <Form.Label>END</Form.Label>
          <Form.Control type='date' value={date.endDate} onChange={(e)=> setDate(prev => ({...prev, endDate: e.target.value}))}/>
        </Form.Group>

        <Form.Group>
          <Form.Label>DELIVERY / INV - NUMBER</Form.Label>
          <Form.Control
          placeholder='input delivery note number'
          type='text'
          onChange={(e)=> setDeliveryNote(e.target.value)}
          value={deliveryNote}
        />
        </Form.Group>
        <Badge bg='danger'>{purchases?.length || 0}-items</Badge>
        <Badge bg='danger'>
          {round2(purchases.reduce((acc, curr)=> acc + curr.total, 0))}
        </Badge>
      </div>

      <div>
      <Table striped bordered hover responsive className='mt-2'>
        <thead>
          <tr>
            <th>Date</th>
            <th>Note</th>
            <th>Items</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
            {purchases?.map((purchase, index) => (
              <tr key={purchase._id}>
                <td>{new Date(purchase.createdAt).toDateString()}</td>
                <td>{purchase.deliveryNote}</td>
                <td>
                  {purchase.Items?.length}(items)
                  <ul>
                    {purchase.Items.map(item => (
                      <li className='d-flex border-bottom justify-content-between'>
                      <small>{item.productName}: </small> 
                      <small>{item.quantity} &middot; {item.purchasePrice.toFixed(2)}</small>
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{purchase.total}</td>
              </tr>
            ))
          }
        </tbody>
      </Table>
    </div>
    </Container>
  )
}
