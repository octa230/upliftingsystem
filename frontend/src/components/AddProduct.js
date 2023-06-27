import React, {useState, useReducer} from 'react'
import { Button, Form } from 'react-bootstrap'
import axios from 'axios'
import {toast} from 'react-toastify'
import {getError} from '../utils/getError'



const reducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_REQUEST':
        return { ...state, loadingUpdate: true };
      case 'UPDATE_SUCCESS':
        return { ...state, loadingUpdate: false };
      case 'UPDATE_FAIL':
        return { ...state, loadingUpdate: false };
      case 'P_CREATE_REQUEST':
          return { ...state, loadingCreate: true};
      case 'P_CREATE_SUCCESS':
          return { ...state, loadingCreate: false };
      case 'P_CREATE_FAIL':
          return { ...state, loadingCreate: false };

      default:
        return state;
    }
  };

export default function AddProduct() {

    const [{loading}, dispatch] =
    useReducer(reducer, {
      loading: true,
      loadingCreate: true,
      error: '',
    });

  
    const [name, setName]= useState('');
    const [code, setProductCode] = useState('')
    const [price, setPrice] = useState('')
    const [inStock, setInStock] = useState('')



    const createHandler = async()=> {
        try{
            dispatch({type: 'P_CREATE_REQUEST'})
            await axios.post('/api/product/new',{
                name,
                code,
                price,
                inStock
            })
            toast.success('product added successfully');
            dispatch({type: 'P_CREATE_SUCCESS'})
            
        }catch(error){
            toast.error(getError(error))
            dispatch({type: 'P_CREATE_FAIL'})
        }
    }


  return (
        <Form className='m-auto'>
            <Form.Text>
                <h1>Add New Product</h1>
            </Form.Text>

            <Form.Group controlId='code'>
                <Form.Label>Code</Form.Label>
                <Form.Control 
                value={code}
                onChange={(e)=>setProductCode(e.target.value)} 
                required
                />
            </Form.Group>

            <Form.Group controlId='name'>
                <Form.Label>Add Name</Form.Label>
                <Form.Control 
                value={name}
                onChange={(e)=>setName(e.target.value)} 
                required
                />
            </Form.Group>

            <Form.Group controlId='price'>
                <Form.Label>Add Price</Form.Label>
                <Form.Control 
                onChange={(e)=>setPrice(e.target.value)} 
                value={price}
                required
                />
            </Form.Group>  

            <Form.Group controlId='inStock'>
                <Form.Label>Add Stock</Form.Label>
                <Form.Control 
                onChange={(e)=>setInStock(e.target.value)} 
                value={inStock}
                required
                />
            </Form.Group> 

            <Button onClick={createHandler} variant='success' type='submit' className='my-4 w-100'>
                Done
            </Button>
        </Form>
  )
}
