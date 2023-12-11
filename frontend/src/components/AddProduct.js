import React, {useState} from 'react'
import { Button, Form } from 'react-bootstrap'
import axios from 'axios'
import {toast} from 'react-toastify'
import {getError} from '../utils/getError'





export default function AddProduct() {
  
    const [name, setName]= useState('');
    const [code, setProductCode] = useState('')
    const [price, setPrice] = useState('')
    const [inStock, setInStock] = useState('')
    const [purchasePrice, setpurchasePrice] = useState('')

    const createHandler = async()=> {
        try{
           const {data} = await axios.post('/api/product/new',{
                name,
                code,
                price,
                inStock,
                purchasePrice,
            })
            toast.success('product added successfully');
            console.log(data)
        }catch(error){
            toast.error(getError(error))
        }
    }


  return (
        <Form className='m-auto w-50'>
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
                <Form.Label>Purchase Price</Form.Label>
                <Form.Control 
                onChange={(e)=>setpurchasePrice(e.target.value)} 
                value={purchasePrice}
                required
                />
            </Form.Group> 

            <Form.Group controlId='price'>
                <Form.Label>Selling Price</Form.Label>
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

            <Button variant='success' onClick={createHandler}className='my-4 w-100'>
                Done
            </Button>
        </Form>
  )
}
