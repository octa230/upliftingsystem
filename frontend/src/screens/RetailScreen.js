import React, { useState, useReducer } from 'react';
import axios from 'axios';
import {Button, Col, Row, Form, Container, ListGroup} from 'react-bootstrap';
import { getError } from '../utils/getError';
import { toast } from 'react-toastify';


function reducer(action, state){
    switch(action.type){
        case 'ADD_SALE_REQUEST':
            return{...state, loading: true, data: action.payload }
        case 'ADD_SALE_SUCCESS':
            return{...state, loading: false}
        case 'ADD_SALE_FAIL':
            return{...state, loading: false, error: action.payload}
        default:
            return state
    }

}

export default function RetailScreen() {

    const [{loading, error}, dispatch] = useReducer(reducer, {
        loading: false,
        error: ''
    })


    const [name, setName] = useState('');
    const [paidBy, setPaidBy] = useState('Cash');
    const [service, setService] = useState('Store pick up');
    const [arrangement, setArrangement] = useState('Box');
    const [preparedBy, setpreparedBy] = useState('Mariam');
    const [productName, setproductName] = useState('');
    const [price, setPrice] = useState(0)
    const [counter, setCounter] = useState('')
    
    const RoundTo = (num)=> Math.round(num * 100 + Number.EPSILON) /100 //====> 123.4567 - 123.45 
    const vat = 0.05/price * 100
    const total = price + vat

    function handleSelectedValue(setState){
        return function(event){
            const selectedValue = event.target.value;
            setState(selectedValue)
        }
    }

    async function handleSubmit(e){
    e.preventDefault()
    try{
        dispatch({type: 'ADD_SALE_REQUEST'})
        const {data} = await axios.post('/api/retail/retail-sale', {
            name, paidBy, 
            service, arrangement,
            preparedBy, productName,
            price, counter
        })
        dispatch({type: 'ADD_SALE_SUCCESS'})
        toast.success('SALE RECORDED SUCCESSFULLY')
    } catch(error){
        dispatch({type: 'ADD_SALE_FAIL'})
        toast.error(getError(error))
    }

    }
  return (
    <Container fluid='sm my-4 md:p-5'>
        <Form onSubmit={handleSubmit}>
            <Row className='mb-3' xs={12} md={4} lg={6}>
                <Form.Text className='d-flex justify-content-center'>
                    <h3>Customer Details</h3>
                </Form.Text>
                <Form.Group as={Col} controlId='customerName'>
                    <Form.Label>customer</Form.Label>
                    <Form.Control type="name" placeholder='customer name' onChange={handleSelectedValue(setName)} required/>
                </Form.Group>
                <Form.Group as={Col} controlId='paidBy'>
                    <Form.Label>Payment</Form.Label>
                    <Form.Select type="select" defaultValue={paidBy} onChange={handleSelectedValue(setPaidBy)}>
                        <option>Cash</option>
                        <option>Card</option>
                        <option>other</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group as={Col} controlId='service'>
                    <Form.Label>Service</Form.Label>
                    <Form.Select type="select" defaultValue={service} onChange={handleSelectedValue(setService)}>
                        <option>Store Pick Up</option>
                        <option>Delivey Order</option>
                        <option>other</option>
                    </Form.Select>
                </Form.Group>
            </Row>
            <Row className='mb-3' xs={12} md={4} lg={6}>
                <Form.Text className='d-flex justify-content-center'>
                    <h3>Purchase Details</h3>
                </Form.Text>
                <Form.Group as={Col} controlId='arrangement'>
                    <Form.Label>Arrangement</Form.Label>
                    <Form.Select type="select" defaultValue={arrangement} onChange={handleSelectedValue(setArrangement)}>
                        <option>Box</option>
                        <option>Bouquet</option>
                        <option>Vase</option>
                        <option>Acrylic</option>
                        <option>other</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group as={Col} controlId='customerDetails'>
                    <Form.Label>Counter</Form.Label>
                    <Form.Control type="input" placeholder='counter' value={counter} onChange={handleSelectedValue(setCounter)}/>
                </Form.Group>
                <Form.Group as={Col} controlId='preparedBy'>
                    <Form.Label>prepared By</Form.Label>
                    <Form.Select type="select" defaultValue={preparedBy} onChange={handleSelectedValue(setpreparedBy)}>
                        <option>Mariam</option>
                        <option>Allan</option>
                        <option>Joe</option>
                    </Form.Select>
                </Form.Group>
            </Row>
            <Row className='mb-3' xs={12} md={4} lg={6}>
            <Form.Text className='d-flex justify-content-center'>
                <h3>Product Details</h3>
                </Form.Text>
                <Form.Group as={Col} controlId='productName'>
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control type="name" placeholder='create prouduct name' onChange={handleSelectedValue(setproductName)} required/>
                </Form.Group>
                <Form.Group as={Col} controlId='product price'>
                    <Form.Label>Price</Form.Label>
                    <Form.Control type="name" placeholder='price' onChange={handleSelectedValue(setPrice)} required/>
                </Form.Group>
                <Form.Group as={Col} controlId='formFile'>
                    <Form.Label>image</Form.Label>
                    <Form.Control type="file" multiple placeholder='images if any'/>
                </Form.Group>
            </Row>
            <Button type='submit' className=' align-item-right mt-4 p-2'>Done</Button>
        </Form> 
        <ListGroup className='my-4 w-50'> 
            <ListGroup.Item>Price: {price}</ListGroup.Item>
            <ListGroup.Item>Vat: {RoundTo(vat)}</ListGroup.Item>
            <ListGroup.Item>Total: {RoundTo(total).toLocaleString(undefined, {maximumFractionDigits: 2})}</ListGroup.Item>
        </ListGroup>
    </Container>
  )
}
