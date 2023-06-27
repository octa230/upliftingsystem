import React, {useEffect, useReducer, useState } from 'react'
import {Button, Container, Form} from 'react-bootstrap'
import axios from 'axios'
import {toast} from 'react-toastify'
import { getError } from '../utils/getError'
import {useParams, useNavigate} from 'react-router-dom'



function reducer(action, state){
    switch(action.type){
        case 'FETCH_REQUEST':
            return{...state, loading: true}
        case 'FETCH_SUCCESS':
            return{...state, loading: false}
        case 'FETCH_FAIL':
            return{...state, loading: false, error: action.payload}
        case 'UPDATE_REQUEST':
            return{...state, loadingUpdate: true}
        case 'UPDATE_SUCCESS':
            return{...state, loadingUpdate: false}
        case 'UPDATE_FAIL':
            return{...state, loadingUpdate: false}
        default:
            return state
    }
}

export default function ProductEdit() {
    const navigate = useNavigate()
    const params = useParams()
    const {id: ProductId} = params;


   // const {state} = useContext(Store)
    const [{loading, error, loadingUpdate}, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    })

    const [name, setName]= useState('')
    const [price, setPrice] = useState('')
    const [inStock, setInStock] = useState('')
    const [code, setCode] = useState('')

    useEffect(()=> {
        const fetchData = async()=> {
            try{
                dispatch({type: 'FETCH_REQUEST'})
                const {data} = await axios.get(`/api/product/${ProductId}`)
                setCode(data.code)
                setInStock(data.inStock)
                setName(data.name)
                setPrice(data.price)
                
                dispatch({type: 'FETCH_SUCCESS'})
            }catch(err){
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(err)
                })
                
            }
        }
        fetchData()
    },[ProductId])


    async function submitHadnler(e){
        e.preventDefault()
        try{
            dispatch({type: 'UPDATE_REQUEST'})
            await axios.put(`/api/product/update/${ProductId}`, {
                _id: ProductId,
                name,
                price,
                inStock,
                code
            })
            dispatch({type: 'UPDATE_SUCCESS'})
            toast.success('product updated successfully')
        }catch(err){
            toast.error(getError(err))
            dispatch({type: 'UPDATE_FAIL'})
            navigate('/inventory')
        }
    }
  return (
 <Container>
       <Form onSubmit={submitHadnler} className='mb-3 w-50'>
      <Form.Text>
        <h2>{`Edit Product: ${ProductId}`}</h2>
      </Form.Text>
        <Form.Group controlId='name'>
            <Form.Label>Product Name</Form.Label>
            <Form.Control
            value={name || ''}
            onChange={(e)=> setName(e.target.value)}
            required
            />
        </Form.Group>
        <Form.Group controlId='code'>
            <Form.Label>Product Code</Form.Label>
            <Form.Control
            value={code || ''}
            onChange={(e)=> setCode(e.target.value)}
            required
            />
        </Form.Group>
        <Form.Group controlId='price'>
            <Form.Label>Product price</Form.Label>
            <Form.Control
            value={price|| ''}
            onChange={(e)=> setPrice(e.target.value)}
            required
            />
        </Form.Group>
        <Form.Group controlId='inStock'>
            <Form.Label>Product inStock</Form.Label>
            <Form.Control
            value={inStock || ''}
            onChange={(e)=> setInStock(e.target.value)}
            required
            />
        </Form.Group>
    <Button type='submit' className='mt-2'>Update</Button>
    </Form>
 </Container>
  )
}
