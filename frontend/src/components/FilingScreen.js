import React, { useContext, useState, useEffect } from 'react'
import { Store } from '../utils/Store'
import Col from 'react-bootstrap/esm/Col'
import Form from 'react-bootstrap/esm/Form'
import ListGroup from 'react-bootstrap/esm/ListGroup'
import  Container from 'react-bootstrap/esm/Container'
import  Button from 'react-bootstrap/esm/Button'
import {toast} from 'react-toastify'
import { BsXCircle } from 'react-icons/bs'
import axios from 'axios'
import Alert from 'react-bootstrap/esm/Alert'
import { BsPaperclip } from 'react-icons/bs'
import SaleDetailsModal from './SaleDetailsModal'
import MessageBox from './MessageBox'
import { FaEye } from 'react-icons/fa'
import { getError } from '../utils/getError'





const FilingScreen = () => {

const { state, dispatch: ctxDispatch } = useContext(Store)
const {selectedItems, todaySales} = state

const recordTypes = ['purchase', 'sale', 'damage', 'hotel']


const [recordType, setRecordType] = useState('')
const [itemQuantities, setItemQuantities] = useState({})
const [deliveryNote, setdeliveryNote] = useState('')
const [invoices, setInvoices] = useState([])
const [showModal, setShowModal] = useState(false)
const [selectedSale, setSelectedSale] = useState({})
const [arrangement, setArrangement] = useState('')
const [showSale, setShow] = useState({})



useEffect(() => {
    if (recordType === 'sale') {
      setInvoices(todaySales)
      const storedSale = JSON.parse(localStorage.getItem('selectedSale'))
      if(storedSale){
        setSelectedSale(storedSale)
      }
    }
  }, [recordType, selectedItems, invoices, selectedSale, todaySales]);



  const handleQuantityChange = (itemId, value) => {
    setItemQuantities(prevState => ({
      ...prevState,
      [itemId]: value
    }));
  }

  const handleViewSale = async (saleId)=> {
    try{
     const result = await axios.get(`/api/multiple/get-sale/${saleId}`)
     setShow(result.data)
     setShowModal(true)
    } catch(error){
     toast.error(getError(error))
    }
 }

  const selectedProducts = selectedItems.map(item => ({
    product: item._id,
    productName: item.name,
    purchasePrice: item.purchasePrice,
    quantity: itemQuantities[item._id] || 0 // Access quantity for each item using item._id as key
  }));
  const calculateTotal=(products)=>{
    return products.reduce((total, product)=> {
        return total + (product.quantity * product.purchasePrice)
    }, 0)

  }

const handleSubmit =async()=>{
    switch(recordType){
        case "purchase":
            try{
                const total = calculateTotal(selectedProducts)
                if(!deliveryNote){
                    toast.error('Add delivery note number')
                    return
                }
                await axios.post('/api/transactions/purchase', {
                    selectedProducts, deliveryNote,
                    total
                })
                toast.success('Done')
            }catch(error){
                toast.error('something went wrong')
                console.log(error)
            }
            break;
        case "sale":
            try{
                await axios.post(`/api/multiple/${selectedSale._id}/add-units`, {
                    selectedProducts,
                    unitName: arrangement
                })
                localStorage.removeItem('selectedSale')
                toast.success('Done')
            }catch(error){
                toast.error('something went wrong')
                console.log(error)
            }
            break;
        case "damage":
            try{
                await axios.post('/api/transactions/damages', {
                    selectedProducts
                })
                toast.success('Done')
            }catch(error){
                toast.error('something went wrong')
                console.log(error)
            }
            break;
        case "hotel":
            toast.error('still building')
            //console.log({selectedItems, recordType})
            break;
        default:
            toast.error('no type selected')
    }
}

 const removeItemHandler = (item) => {
    const newselectedItems = selectedItems.filter((x)=> x._id !== item._id)
    ctxDispatch({type: "REMOVE_SELECTED_ITEM", payload: newselectedItems})
  };

  const addSale = async(saleId)=>{
    const {data} = await axios.get(`/api/multiple/get-sale/${saleId}`)
    localStorage.setItem('selectedSale', JSON.stringify(data))
    ctxDispatch({type: "ADD_SELECTED_SALE", payload: data})
    toast.success('sale attched successfully')
}

    const clearSelectedItems =()=>{
        ctxDispatch({type: "CLEAR_SELECTED_ITEMS"})
        localStorage.removeItem('selectedItems')
    }

  return (
    <Container fluid className='my-2'>
        <div className='d-flex justify-content-between'>
        <div>
        <Form.Label>Record Type</Form.Label>
        <Form.Control as='select' onChange={(e)=> setRecordType(e.target.value)} value={recordType}>
            <option>---select---</option>
            {recordTypes.map((record)=> (
                <option key={record}>{record}</option>
            ))}
        </Form.Control>
        </div>
        <div>
        {recordType === "purchase" ? (
            <Form.Group>
                <Form.Label>Delivery Note Number</Form.Label>
                <Form.Control type='text'
                placeholder='invoice / Delivery Note Number'
                value={deliveryNote}
                onChange={(e)=> setdeliveryNote(e.target.value)}
            />
            </Form.Group>
        ): (
            selectedSale && recordType !== "damage" ? (
               <div>
                 <Alert variant="success">
            {selectedSale.InvoiceCode || "No Invoice"}
        </Alert>
        <Form.Group>
            <Form.Label>Arrangement</Form.Label>
            <Form.Control as='select'
                value={arrangement}
                onChange={(e)=> setArrangement(e.target.value)}
            >
                <option>--select--</option>
                {selectedSale.saleItems?.map(item => (
                    <option key={item}>{item.arrangement}</option>
                ))}
            </Form.Control>
        </Form.Group>
                </div>
            ): (
                <MessageBox>Not Sale</MessageBox>
            ) 
        )}
        </div>
        <div>
        <Button onClick={()=>clearSelectedItems()} disabled>
            Clear All
        </Button>
        </div>
        </div>
    <ListGroup className='my-3'>
      {selectedItems && selectedItems.length > 0 ? 
         selectedItems.map((item)=> (
        <ListGroup.Item key={item._id} className='d-flex my-1 justify-content-between'>
            <Col>{item.name}</Col>
            {recordType === 'purchase' ? (
                <Col>
                <Form.Control type='Number'
                    value={itemQuantities[item._id] || ''} 
                    onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                />
                </Col>
            ) : (
                <Col>
                <Form.Control as="select" 
                    value={itemQuantities[item._id] || ''} 
                    onChange={(e) => handleQuantityChange(item._id, e.target.value)}>
                        <option>--select--</option>
                    {[...Array(item.inStock).keys()].map((val) => (
                    <option key={val + 1} value={val + 1}>{val + 1}</option>
                  ))}
                </Form.Control>
            </Col>
            )}
            <Col>
            <Button variant='' onClick={()=> removeItemHandler(item)}>
                <BsXCircle/>
            </Button>
            </Col>
        </ListGroup.Item>
      )) : (
        <MessageBox>ADD DATA FROM INVENTORY</MessageBox>
      )}
    </ListGroup>
    <Button onClick={handleSubmit}>Submit</Button>

    <div className='my-3'>
        {
            recordType !== "purchase" ? (
                <ListGroup className='my-3'>
                {recordType !== "damage"  && invoices.map((invoice)=> (
            <ListGroup.Item className='d-flex justify-content-between' key={invoice.InvoiceCode}>
                <Button onClick={()=>handleViewSale(invoice._id)} className='bg-primary border'> 
                <span className='px-1'>
                    <FaEye/>
                </span>
                {invoice.InvoiceCode}
                </Button>
                <div>
                <Button variant='warning' onClick={()=> addSale(invoice._id)}>
                        <BsPaperclip/>
                    </Button>
                </div>
            </ListGroup.Item>
        ))}
    </ListGroup>
            ):(
                <MessageBox>Not Required</MessageBox>
            )
        }
        <SaleDetailsModal show={showModal} onHide={()=>setShowModal(false)} selectedSale={showSale}/>
    </div>
    </Container>
  )
}

export default FilingScreen
