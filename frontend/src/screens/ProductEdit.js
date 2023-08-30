import React, {useEffect, useReducer, useState } from 'react'
import {Button, Col, Form, Row} from 'react-bootstrap'
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
    const [{}, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    })

    const [name, setName]= useState('')
    const [price, setPrice] = useState(0)
    const [inStock, setInStock] = useState(0)
    const [purchase, setPurchase]= useState(0)
    const [code, setCode] = useState('')
    const [isDamaged, setisDamaged] = useState(false)
    const [isDisplay, setisDisplay] = useState(false)
    const [quantity, setQuantity] = useState(0)
    const [product, setProduct] = useState('')
    const [totalPrice, setTotalPrice] = useState(0)
    //const [image, setImage] = useState('')
    

    useEffect(()=> {
        const fetchData = async()=> {
            try{
                const {data} = await axios.get(`/api/product/${ProductId}`)
                setCode(data.code)
                setInStock(data.inStock)
                setName(data.name)
                setPrice(data.price)
                
            }catch(err){
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(err)
                })
                
            }
        }
        fetchData()
    },[ProductId])


    async function submitUpdate(e){
        e.preventDefault()
        try{
            await axios.put(`/api/product/update/${ProductId}`, {
                _id: ProductId,
                name,
                price,
                inStock,
                purchase,
                code
            })
            toast.success('product updated successfully')
        }catch(err){
            toast.error(getError(err))
            navigate('/inventory')
        }
    }

    async function submitDamages(e){
        e.preventDefault()
        try{
           const {data} = await axios.post('/api/damages/new', {
                product: ProductId,
                quantity,
                isDamaged,
                isDisplay,
                totalPrice

            }) 
            toast.success('Data Recorded successfully')
            console.log(data)
        }catch(error){
            toast.error('unable to add record')
            console.log(error)
        }
    }
  return (
 <Row className='py-3'>
 <Col>
 <Form onSubmit={submitUpdate} className='mx-3' sm={12}>
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
            value={price}
            onChange={(e)=> setPrice(e.target.value)}
            required
            />
        </Form.Group>
        <Form.Group controlId='purchase'>
            <Form.Label>Purchase</Form.Label>
            <Form.Control
            value={purchase}
            onChange={(e)=> setPurchase(e.target.value)}
            />
        </Form.Group>
        <Form.Group controlId='inStock'>
            <Form.Label>Product inStock</Form.Label>
            <Form.Control
            value={inStock}
            onChange={(e)=> setInStock(e.target.value)}
            disabled
            />
        </Form.Group>
    <Button type='submit' className='mt-2'>Update</Button>
    </Form>
 </Col>

<Col>
{/** Form For Damages and Display */}
<Form onSubmit={submitDamages} className='mx-3 pt-3'>

      <Form.Text>
        <h2>{`Display / Damaged Product: ${ProductId}`}</h2>
      </Form.Text>

        <Form.Group controlId='name'>
            <Form.Label>Product Name</Form.Label>
            <Form.Control disabled
            value={name}
            placeholder={product.name}
            required
            />
        </Form.Group>

        <Form.Group controlId='code'>
            <Form.Label>Product Code</Form.Label>
            <Form.Control disabled
            value={code || ''}
            placeholder={code}
            required
            />
        </Form.Group>

        <Form.Group controlId='price'>
            <Form.Label>Total price</Form.Label>
            <Form.Control
            value={price * quantity}
            onChange={(e)=> setTotalPrice(e.target.value)}
            required
            />
        </Form.Group>

        <Form.Group controlId='inStock'>
            <Form.Label>Quantity</Form.Label>
            <Form.Control
            value={quantity}
            onChange={(e)=> setQuantity(e.target.value)}
            required
        />
        </Form.Group>

{/*         <Form.Group controlId='inStock'>
            <Form.Label>Image</Form.Label>
            <Form.Control
            value={photo}
            type='file'
            onChange={handleFileChange}
            required
        />
        </Form.Group>
 */}

        <Form.Check 
        className='my-3'
        type='checkbox'
        id='isDamaged'
        label='Damaged'
        checked={isDamaged}
        onChange={(e)=> setisDamaged(e.target.checked)}
        />

        <Form.Check
        type='checkbox'
        id='isDisplay'
        label='Display'
        checked={isDisplay}
        onChange={(e)=> setisDisplay(e.target.checked)}
        />
    <Button type='submit' className='mt-2'>Submit Record</Button>
    </Form>
</Col>
 </Row>
  )
}
