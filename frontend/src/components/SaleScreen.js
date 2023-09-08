import React, {useContext, useReducer, useState} from 'react'
import {Container, Row, Col, ListGroup, Button, Card, Form,} from 'react-bootstrap'
import { Store } from '../utils/Store'
import { getError } from '../utils/getError'
import {BsDashSquareFill, BsFillPlusSquareFill, BsXSquareFill, BsTrash3Fill} from 'react-icons/bs'
import axios from 'axios'
import { toast } from 'react-toastify'
import easyinvoice from 'easyinvoice'
import ProductTable from './TestTable'




function reducer(state, action){
  switch(action.type){
    case 'CREATE_SALE_REQUEST':
      return{...state, loading: true}
    case 'CREATE_SALE_SUCCESS':
      return{...state, loading: false}
    case 'CREATE_SALE_FAIL':
      return{...state, loading: false}
    case 'FETCH_REQUEST':
      return{...state, loading: true}
    case 'FETCH_SUCCESS':
      return {...state, summary: action.payload, loading: false}
    case 'FETCH_FAIL':
      return {...state, loading: false, error: action.payload}
    default:
      return state

  }
}




export default function SaleScreen() {

  const [ {loading}, dispatch ] = useReducer(reducer, {
    loading: false,
    error: ''
  })

  //date converted to locale String in day/month/year format
  const time = new Date().toLocaleDateString('en-GB')


  const [preparedBy, setPreparedBy] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [service, setService] = useState('')
  const [phone, setPhone] = useState('')
  const [customer, setCustomer ] = useState('')
  //const [InvoiceCode, setInvoiceCode] = useState('')

  const {state, dispatch: ctxDispatch} = useContext(Store)
  const {sale, sale:{saleItems}, userInfoToken} = state

  const updateSaleProduct = async(item, quantity)=> {
    const {data} = await axios.get(`/api/product/${item._id}`)
    if (data.inStock < quantity){
      window.alert('unit soldout')
      return
    }
    ctxDispatch({
      type: 'ADD_SALE_ITEM', payload: {...item, quantity}
    })
  }

  const handleSelectedValue=(setState)=> {
    return (e)=> {
      const selectedValue = e.target.value
      setState(selectedValue) 
     // console.log(customer, phone, service, paidBy, prepapredBy)
    }
  }


  
  const RoundTo = (num)=> Math.round(num * 100 + Number.EPSILON) / 100 //====> 123.4567 - 123.45;
  sale.itemsPrice = RoundTo(sale.saleItems.reduce((acc, curr)=> acc + curr.quantity * curr.price, 0))
  sale.taxPrice = RoundTo(0.00 * sale.itemsPrice)
  sale.totalPrice = sale.itemsPrice + sale.taxPrice;

  const makeSale = async()=> {

    const InvoiceData ={

      images:{
        logo: 'https://chateaudesfleursuae.com/wp-content/uploads/2023/05/cropped-Chateau-Des-Fleurs-DMCC-Logo-01.png',
      },

      sender:{
        company: 'CHATEAU DES FLEURS',
        address: `JUMEIRAH LAKE TOWER <br/>LAKE VIEW TOWER <br/>CLUSTER B`,
        city: 'Dubai-UAE',
      },

      client:{
          company: name,
          address: phone,
      },
      
      information: {
        number: "CDFDXB_" + Math.floor(100000 + Math.random()* 900000),
        date: time
      },

      products: products.map((product)=> ({
          quantity: product.quantity,
          description: product.arrangement,
          "tax-rate": 0,
          price: product.price,

      })),
      'vat':vat, preparedBy, 
      paidBy,service,
      subtotal: calculateSubtotal(),
      total: calculateTotal(),  
      'bottom-notice': `
      <p style={padding: 12px}>SEASON OF HAPPINESS</p> <br/> 
      <a href='https://www.instagram.com/chateau_des_fleurs.ae/'>instagram</a>
      Facebook <a href='https://chateaudesfleursuae.com/'>Facebook</a>
      Site <a href='https://chateaudesfleursuae.com/'>Website</a>`,
      "settings":{
      "currency": 'AED',
      "margin-top": 50,
      "margin-right": 50,
      "margin-left": 50,
      "margin-bottom":5
      }
  } 

    try{  
      const {data} = await axios.post('/api/wholesale/make-sale', {

        InvoiceCode: InvoiceData.information.number,
        saleItems: sale.saleItems,
        totalPrice: sale.totalPrice,
        itemsPrice: sale.itemsPrice,
        taxPrice: sale.taxPrice,
        preparedBy: preparedBy,
        paidBy: paidBy,
        service: service,
        date: time,
        phone: phone,
        customer: customer,
      },
      
      {
        headers:{Authorization: `Bearer${userInfoToken.token}`}
      },
      )
      ctxDispatch({type: 'CLEAR_SALE_ITEMS'})
      dispatch({type: 'CREATE_SALE_SUCCESS'});
      localStorage.removeItem('saleItems')
      toast.success('sale added to History')
    }catch(err){
      dispatch({type: 'CREATE_SALE_FAIL'})
      toast.error(getError(err))
    }

    //data used by the invoice module

    const result = await easyinvoice.createInvoice(InvoiceData)
      easyinvoice.render('pdf', result.pdf)
      easyinvoice.download(`${InvoiceData.information.number}.pdf`, result.pdf)
  }

  const dismissItem = (item)=> {
    ctxDispatch({type: 'REMOVE_SALE_ITEM', payload: item})
  } 


  const deleteAllItems= ()=> {
    if(window.confirm('dismiss all items?')){
      ctxDispatch({type:'CLEAR_SALE_ITEMS', payload: saleItems})
    }
  }




  return (
    <Container>
      <Row>
        <Col sm={12} className='border'>
        <div className='d-flex justify-content-between'>
        <h2 className='my-2 p-2 border' style={{color:"red"}}>Recorded units</h2>
        <span className='p-2' onClick={()=> deleteAllItems()}>clear all units {' '} <BsTrash3Fill/></span>
        </div>
        <Row className='my-2 py-3'>
          <Col>
          <Form.Label>Paid By</Form.Label>
          <Form.Select onChange={handleSelectedValue(setPaidBy)}>
            <option>Select...</option>
            <option>Card</option>
            <option>Cash</option>
            <option>TapLink</option>
            <option>Bank Transfer</option>
          </Form.Select>
          </Col>
          <Col>
          <Form.Label>prepared By</Form.Label>
            <Form.Select onChange={handleSelectedValue(setPreparedBy)}>
            <option>choose..</option>
            <option>Joe</option>
            <option>Ahmed</option>
            <option>Mahel</option>
            <option>Adel</option>
            <option>Gladwin</option>
            </Form.Select>
          </Col>

          <Col>
          <Form.Label>service</Form.Label>
          <Form.Select onChange={handleSelectedValue(setService)}>
            <option>Select...</option>
            <option>Delivery</option>
            <option>Store Pick Up</option>
            <option>website</option>
            <option>insta-shop</option>
            <option>Delivero</option>
            <option>Careem</option>
          </Form.Select>
          </Col>

          <Col>
          <Form.Label>phone</Form.Label>
          <Form.Control
            type='input'
            name='phone'
            value={phone || ''}
            onChange={(e)=> setPhone(e.target.value)}
            />
          </Col>
          <Col>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type='input'
            name='name'
            value={customer || ''}
            onChange={(e)=> setCustomer(e.target.value)}
            />
          </Col>
        </Row>
          <ListGroup>
            {saleItems?.map((item)=> (
              <ListGroup.Item key={item._id}>
                <Row className='align-items-center'>
                  <Col md={4}>
                  <h4>{item.name}</h4>
                  </Col>
                  <Col md={3}>
                    <Button onClick={()=> updateSaleProduct(item, item.quantity - 1)}
                    variant='light'
                    disabled={item.quantity === 1}
                    >
                      <BsDashSquareFill/>
                    </Button>{' '}
                    <span>{item.quantity}</span>{' '}

                    <Button onClick={()=> updateSaleProduct(item, item.quantity + 1)}
                    variant='light'
                    disabled={item.quantity === item.inStock}
                    >
                      <BsFillPlusSquareFill/>
                    </Button>{' '}
                  </Col>
                  <Col md={3}>{item.price.toLocaleString(undefined, {maximumFractionDigits: 2})}</Col>
                  <Col md={2}>
                    <Button onClick={()=> dismissItem(item)} variant='light'>
                      <BsXSquareFill/>
                    </Button>
                  </Col>
                </Row>

              </ListGroup.Item>
            ))}
          
          </ListGroup>       
        </Col>
      </Row>
      <Row className='mt-4'>
        <Col>
        <Card>
          <Card.Body>
            <ListGroup variant='flush'>
              <ListGroup.Item>
              <Row>
                <Col>Units</Col>
                <Col>AED: {sale.itemsPrice.toFixed(2).toLocaleString(undefined, {maximumFractionDigits: 2})}</Col>
              </Row>
              </ListGroup.Item>
              <ListGroup.Item>
              <Row>
                <Col>Tax</Col>
                <Col>AED: {sale.taxPrice.toFixed(2).toLocaleString(undefined, {maximumFractionDigits: 2})}</Col>
              </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <h3>
                  SubTotal: ({saleItems.reduce((a, c)=> a+c.quantity, 0)}{' '}: units)
                  AED: {saleItems.reduce((a, c)=> a + c.price * c.quantity, 0).toLocaleString(undefined, {maximumFractionDigits: 2})}
                </h3>

              </ListGroup.Item>
              <ListGroup.Item>
              <Row>
                <Col>Total</Col>
                <Col>AED: {sale.totalPrice.toFixed(2).toLocaleString(undefined, {maximumFractionDigits: 2})}</Col>
              </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className='d-grid'>
                    <Button type='button' variant='danger' disabled={saleItems.length === 0} onClick={makeSale}>
                      Confirm Sale
                    </Button>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
        </Col>
      </Row> 
    </Container>
  )
}
