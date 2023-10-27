import React, {useContext, useEffect, useReducer, useState} from 'react'
import {Container, Row, Col, ListGroup, Button, Card, Form,} from 'react-bootstrap'
import { Store } from '../utils/Store'
import { getError } from '../utils/getError'
import {BsDashSquareFill, BsFillPlusSquareFill, BsXSquareFill, BsTrash3Fill} from 'react-icons/bs'
import axios from 'axios'
import { toast } from 'react-toastify'
import MessageBox from './MessageBox'
import { PDFViewer } from '@react-pdf/renderer'
import InvoiceTwo from '../utils/InvoiceTwo'




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
      return {...state, codes: action.payload, loading: false}
    case 'FETCH_FAIL':
      return {...state, loading: false, error: action.payload}
    default:
      return state

  }
}




export default function SaleScreen() {

  const [{codes}, dispatch ] = useReducer(reducer, {
    loading: false,
    error: '',
    codes:[]
  })

  //date converted to locale String in day/month/year format
  const time = new Date().toLocaleDateString('en-GB')

  //const [codes, setCodes] = useState([])
  const [preparedBy, setPreparedBy] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [service, setService] = useState('')
  const [phone, setPhone] = useState('')
  const [customer, setCustomer ] = useState('')
  const [free, setFree]= useState(false)
  const [driver, setDriver] = useState('')
  const [orderedBy, setorderedBy] = useState('')
  const [discount, setDiscount] = useState(0)
  const [recievedBy, setrecievedBy] = useState('')
  const [deliveredTo, setdeliveredTo] = useState('')
  const [printsale, setPrintSale] = useState(null)
  const [showPDF, setshowPDF] = useState(false)


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




  useEffect(()=> {
    const fetchData = async()=> {
      dispatch({type: 'FETCH_REQUEST'})
      try{
        const {data} = await axios.get('/api/wholesale/invoices')
        //setCodes(data)
        dispatch({type: 'FETCH_SUCCESS', payload: data})
        //console.log(response.data)
      }catch(error){
        dispatch({type: 'FETCH_FAIL', payload: error})
        toast.error(error)
      }
    }
    fetchData()
  }, [])

  //console.log(codes)
  const filteredCodes = codes?.slice( -10)
  console.log(filteredCodes)

  const getSale = async(x)=> {
    const response = await axios.get(`/api/wholesale/get-sale/${x._id}`)
    const fetchedSale = response.data
    //setSales(sale)
    setPrintSale(fetchedSale)
    setshowPDF(true)
    console.log(printsale)
  }

  
  const RoundTo = (num)=> Math.round(num * 100 + Number.EPSILON) / 100 //====> 123.4567 - 123.45;
  sale.itemsPrice = RoundTo(sale.saleItems.reduce((acc, curr)=> acc + curr.quantity * curr.price, 0))
  sale.taxPrice = RoundTo(0.05 * sale.itemsPrice)
  sale.totalPrice = sale.itemsPrice + sale.taxPrice;

  const makeSale = async()=> {
    try{  
        await axios.post('/api/wholesale/make-sale', { 
        saleItems: sale.saleItems,
        totalPrice: sale.totalPrice,
        itemsPrice: sale.itemsPrice,
        taxPrice: sale.taxPrice,
        preparedBy: preparedBy,
        paidBy: paidBy, 
        service: service,
        date: time,
        phone: phone,
        free: free, 
        orderedBy: orderedBy,
        driver: driver,
        discount: discount,
        recievedBy: recievedBy,
        deliveredTo: deliveredTo,
        customer: customer,
      },
      {
        headers:{Authorization: `Bearer${userInfoToken.token}`}
      },
      )
      ctxDispatch({type: 'CLEAR_SALE_ITEMS'})
      dispatch({type: 'CREATE_SALE_SUCCESS'});
      localStorage.removeItem('saleItems')
      toast.success('Success')
    }catch(err){
      dispatch({type: 'CREATE_SALE_FAIL'})
      toast.error(getError(err))
    }
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
            <option>Allan</option>
            <option>Ahmed</option>
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
      <Row>
      <Form.Check type='checkbox'
        label='Free Of Charge(F.O.C)'
        checked={free}
        className='py-2 mt-3'
        onChange={(e)=>setFree(e.target.checked)}
      />
        {free ? ( 
        <div>
           <Form.Group>
            <Form.Label>Orderd By</Form.Label>
            <Form.Control type='input'
            required
            value={orderedBy}
            onChange={(e)=>setorderedBy(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Delivery Area</Form.Label>
            <Form.Control type='input'
            required
            value={deliveredTo}
            onChange={(e)=> setdeliveredTo(e.target.value)}
        />
          </Form.Group>
          <Form.Group>
            <Form.Label>Recieved By</Form.Label>
            <Form.Control type='input'
            required
            value={recievedBy}
            onChange={(e)=>setrecievedBy(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Driver</Form.Label>
            <Form.Control type='input'
            required
            value={driver}
            onChange={(e)=>setDriver(e.target.value)}
            />
          </Form.Group>
        </div>
         ) : (<MessageBox variant='warning'>Not F.O.C</MessageBox>)
         }
      </Row>
      <Row className='mt-4'>
        <Col>
        <Card>
          <Card.Body>
            <ListGroup variant='flush'>
              <ListGroup.Item>
              <Row>
                <Col>SubTotal</Col>
                <Col>AED: {sale.itemsPrice - sale.taxPrice.toFixed(2).toLocaleString(undefined, {maximumFractionDigits: 2})}</Col>
              </Row>
              </ListGroup.Item>
              <ListGroup.Item>
              <Row>
                <Col>Tax</Col>
                <Col>AED: {sale.taxPrice.toFixed(2).toLocaleString(undefined, {maximumFractionDigits: 2})}</Col>
              </Row>
              </ListGroup.Item>

              <ListGroup.Item>
              <Row>
                <Col>Total</Col>
                <Col>AED: {(sale.itemsPrice + sale.taxPrice - discount).toLocaleString(undefined, {maximumFractionDigits: 2})}</Col>
                <Col className='d-flex pt-3'>
              <Form.Label>Discount:</Form.Label>
                <span className='text-danger'>
                <strong>{discount}</strong>
      </span>
      <Form.Control type='number' style={{width:'6rem'}} className='mx-2'
        value={discount}
        onChange={(e)=> setDiscount(e.target.value)}
        placeholder='discount'
      />
      </Col>   
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
      <Row>
      <Col className='my-3'>
        <div style={{ maxHeight: '260px', overflowY: 'auto', border: 'solid 1px'}}>
          {filteredCodes && filteredCodes.map((s)=> (
            <ListGroup key={s._id}>
              <ListGroup.Item className='d-flex justify-content-between'>
                <div>{s.InvoiceCode}</div>
                <div>
                <Button onClick={()=> getSale(s)}>Print</Button>
                </div>
              </ListGroup.Item>
            </ListGroup>
          ))}
         </div>
        </Col>
        <Col className='my-3'>
        <div style={{maxWidth: '100%', border: 'solid 1px'}}>
        {showPDF && printsale &&(
          <PDFViewer width='100%' height='600'>
            <InvoiceTwo sale={printsale}/>
          </PDFViewer>
        )}
      </div>
        </Col>
      </Row>
    </Container>
  )
}
