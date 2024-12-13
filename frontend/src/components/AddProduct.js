import React, { useState } from 'react'
import { Button, Form, ListGroup, Modal, InputGroup, Image } from 'react-bootstrap'
import { uploadFileHandler } from '../utils/helpers'
import LoadingBox from './Spinner'
import axios from 'axios'
import { getError } from '../utils/getError'
import { toast } from 'react-toastify'






export default function AddProduct({product, userInfoToken }) {
  

    

    const [name, setName]= useState(product?.name || '');
    const [code, setProductCode] = useState(product?.code || '')
    const [price, setPrice] = useState(product?.price || '')
    const [purchasePrice, setpurchasePrice] = useState(product?.purchasePrice || '')
    const [selectedIdentifier, setSelectedIdentifier ] = useState(product?.identifier || '')
    const [photo, setPhoto] = useState(product?.photo || '')
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    

    const createHandler = async()=> {

        if(product && product._id){
            try{
                const {data} = await axios.put(`/api/product/update/${product._id}`,{
                     name,
                     code,
                     price,
                     photo,
                     purchasePrice,
                     identifier: selectedIdentifier
                 })
                 toast.success('product added successfully');
                 console.log(data)
             }catch(error){
                 toast.error(getError(error))
            } 
        }else{
            try{
                const {data} = await axios.post('/api/product/new',{
                     name,
                     code,
                     price,
                     photo,
                     purchasePrice,
                     identifier: selectedIdentifier
                 })
                 toast.success('product added successfully');
                 console.log(data)
             }catch(error){
                 toast.error(getError(error))
             } 
        }
         
    }

    const identifiers = ['STEM', 'PLANT', 'BUNCH', 'TOOL', 'ACCESSORY', 'ARRANGEMENT']
    
    const FileUPload = async(e)=>{
        const file = e.target.files[0]

        try{
           setLoading(true)
           const fileurl = await uploadFileHandler(file, userInfoToken)
           setPhoto(fileurl)
           setLoading(false)
        }catch(error){
            setError(error)
            console.log(error)
            setLoading(false)
        }
    }


    
    return ( 
        <Form className='m-auto' onSubmit={createHandler}>
            <Modal.Header closeButton>
            <Modal.Title>
                <h1>Add New Product</h1>
            </Modal.Title>
            </Modal.Header>

            <Modal.Body>
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
            <ListGroup className='my-2'>
                {identifiers.map((identifier)=> (
                    <ListGroup.Item key={identifier}>
                        <Form.Check type='radio' 
                            value={identifier}
                            label={identifier}
                            checked={selectedIdentifier === identifier}
                            onChange={(e)=> setSelectedIdentifier(e.target.value)}
                        />
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <ListGroup.Item>
            {loading && <LoadingBox/>}
            {photo && <Image src={photo} className="thumbnail" height={50} width={50}/>}
            {error && <p>{error}</p>}
            </ListGroup.Item>
            <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">Photo</InputGroup.Text>
                <Form.Control type='file'
                    placeholder="photo"
                    aria-label="Photo"
                    aria-describedby="basic-addon1"
                    onChange={FileUPload}
                />
                </InputGroup>
            </Modal.Body>
            <Modal.Footer>
            <Button variant='success' className='my-4 w-100' onClick={createHandler}>
                SAVE
            </Button>
            </Modal.Footer>
        </Form>        
  )
}
