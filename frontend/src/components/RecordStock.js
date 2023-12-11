import React, { useState, useEffect } from 'react'
import { FaPlusCircle, FaRedo } from 'react-icons/fa'
import axios from 'axios'
import Button from 'react-bootstrap/esm/Button'
import Col from 'react-bootstrap/esm/Col'
import Table from 'react-bootstrap/esm/Table'
import Form from 'react-bootstrap/esm/Form' 
import { getError } from '../utils/getError'
import {toast} from 'react-toastify'

export default function RecordStock() {
    
    const [products, setProducts] = useState([])
    //const [value, setTotalValue] = useState(0)
    const [selectedProducts, setSelectedProducts] = useState([])


    useEffect(()=> {
        const getNames = async()=>{
           try{
            const res =  await axios.get('/api/product/names')
            //console.log(res.data)
            setProducts(res.data || [])
            //console.log(res.data)
           }catch(err){
            console.log(getError(err))
           }
        }
        getNames()
    }, [])

    const handleAddRow =()=>{
        setSelectedProducts([...selectedProducts, {product: '', purchase: 0}])
    }


    //REMOVE ROW
    const handleRemoveRow = (index) => {
    setSelectedProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
    };

    const handleQuantityChange =(event, index)=> {
        const purchase = event.target.value;
        const newSelectedProducts = selectedProducts.map((selectedProduct, i)=> {
            if(i === index){
                return {...selectedProduct, purchase,}
            }else{
                return selectedProduct
            }
        })
        setSelectedProducts(newSelectedProducts)
    }

    const handleProductChange=(event, index)=> {
        const product = event.target.value
        const newSelectedProducts = selectedProducts.map((selectedProduct, i)=> {
            if(i === index){
                return{...selectedProduct, product}
            }else {
                return selectedProduct
            }
        })
        setSelectedProducts(newSelectedProducts)
    }

    const handleNewTable = () => {
        setSelectedProducts([]);
        //setTotalValue(0);
    };

    const handleSave = async()=>{
        const hasInvalidProducts = selectedProducts.some(
            (row) => !row.product || !row.purchase || isNaN(row.purchase)
        )
        if(hasInvalidProducts){
            toast.error('Check added data')
            return;
        }
        console.log(selectedProducts)

        try{
            await axios.post('/api/stock/purchase', {
                selectedProducts
            })
        }catch(error){
            toast.error(getError(error))
            console.log(error)
        }
    }

  return (
    <div>
       <Col>
       <Button onClick={handleAddRow}>
            <FaPlusCircle/> Add row
        </Button>
       </Col>
       <Col>
        <Table striped bordered className='mt-4'>
            <thead>
                <tr>
                    <th>product</th>
                    <th>quantity</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {selectedProducts.map((selectedProduct, index)=> (
                    <tr key={index}>
                        <td>
                            <Form.Label>Product</Form.Label>
                            <Form.Select as="select" value={selectedProduct.name} onChange={(e)=> handleProductChange(e, index)}>
                                <option value="">---select---</option>
                                {products.map((product)=> (
                                    <option key={product._id} value={product._id}>
                                        {product.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </td>
                        <td>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control type='number' name='purchase' value={selectedProduct.purchase}
                                onChange={(e)=> handleQuantityChange(e, index)}
                            />
                        </td>
                        <td>
                            <Button variant='' onClick={()=> handleRemoveRow()}> Delete</Button>
                        </td>

                    </tr>
                ))}
            </tbody>

        </Table>
       </Col>
       <Col md={3} className='d-flex justify-content-between'> 
       <Button onClick={handleSave}>Record</Button>
       <Button onClick={handleNewTable}>
        <FaRedo/>
       </Button>
       </Col>
      
    </div>
  )
}
