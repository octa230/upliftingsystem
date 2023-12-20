import React, { useState, useContext, useReducer, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/esm/Form'
import Button from 'react-bootstrap/esm/Button'
import Col from 'react-bootstrap/esm/Col'
import ListGroup from 'react-bootstrap/esm/ListGroup'
import Row from 'react-bootstrap/esm/Row'
import axios from 'axios'
import { Store } from '../utils/Store';
import {getError} from '../utils/getError'
import Invoice from '../utils/Invoice';
import { BsCamera} from 'react-icons/bs';
import MessageBox from './MessageBox'
import {toast} from 'react-toastify'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import {BsBoxArrowDown, BsPlusSquare, BsFillTrash3Fill} from 'react-icons/bs'




function reducer(state, action){
  switch(action.type){
      case 'FETCH_REQUEST':
          return{...state, loading: false}
      case 'FETCH_SUCCESS':
          return{
              ...state, 
              sales: action.payload, 
              loading: false
          }
      case 'FETCH_FAIL':
          return{...state, loading: false, error: action.payload}
      default:
          return state
  }
}

function SaleTable() {

  const [products, setProducts] = useState([]);
  const [paidBy,  setPaidBy]= useState('')
  const [service, setService]= useState('')
  const [name, setCustomerName] = useState('')
  const [phone, setPhoneNumber] = useState('')
  const [preparedBy, setPreparedBy]= useState('')
  const [deliveredTo, setdeliveredTo] = useState('')
  const [free, setFree] = useState(false)
  const [driver, setDriver]= useState('')
  const [orderedBy, setorderedBy]= useState('')
  const [discount, setDiscount] = useState(0)
  const [recievedBy, setrecievedBy]= useState('')
  const [printSale, setPrintSale] = useState(null)
  const [showPDF, setshowPDF] = useState(false)
  const [refresh, setRefresh] = useState(false)

  const time = new Date().toLocaleDateString('en-GB');
  const [{sales}, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    sales: []
  })

  useEffect(()=> {
    const fetchData =async()=> {
        try{
            const {data} = await axios.get(`/api/multiple/list`)
            dispatch({type: 'FETCH_SUCCESS', payload: data}) 
        }catch(error){
            dispatch({type: 'FETCH_FAIL', payload: error})
            toast.error(getError(error))
        }
    }
    fetchData()
},[refresh])

const openPDFVeiwer = async(s)=> {
  const result = await axios.get(`/api/multiple/get-sale/${s}`)
  const fetchdData = result.data
  console.log(result.data)
  console.log(fetchdData)
  setPrintSale(fetchdData)
  setshowPDF(true) 
  console.log(printSale)
}


const { state} = useContext(Store);
const { userInfoToken } = state;


  const handleAddRow=()=> {
    setProducts([...products, {name:"", price: 0, quantity: 0, arrangement:"", photo: "", loading: false}]);
  }

  const handleReset=()=> {
    setProducts([])
  }

  function handleSelectedValue(setState){
    return function(e){
      const selectedValue = e.target.value

      setState(selectedValue)
    }
  }
  const handleProductChange = (index, event) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [event.target.name]: event.target.value };
    setProducts(newProducts);
  };

  const handleArrangementChange = (index, event) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [event.target.name]: event.target.value };
    setProducts(newProducts);
  };

  const handleQuantityChange = (index, event) => {
    const newProducts = [...products];
    newProducts[index].quantity = parseInt(event.target.value, 10) || 0;
    setProducts(newProducts);
  };

  ////UPLOAD PHOTO/PHOTOS
  const uploadFileHandler = async(file)=>{
  try{
    //setLoading(true)
   const bodyFormData = new FormData()
   bodyFormData.append('file', file)
   const {data} = await axios.post('/api/upload/', bodyFormData, {
     headers :{
       'Content-Type': 'multipart/form-data',
       authorization: `Bearer ${userInfoToken.token}`,
     }
   })
   return data.secure_url
  }catch(error){
  //    setLoading(false)
   getError(error)
  }
 }


 const handleCaptureImage = async (index, image) => {
  const newProducts = [...products];
  if(image){
    try{
    newProducts[index].loading = true
    //setProducts(newProducts)

    const photoUrl = await uploadFileHandler(image)
    newProducts[index].photo = photoUrl
    //newProducts[index].loading = false
  }catch(error){
    toast.error(error || 'error occured')
    console.log(error)
  }finally{
    newProducts[index].loading = false;
    setProducts(newProducts)
  }}};
 
  const calculateSubtotal = () => {
    const itemsTotal = products.reduce((accumulator, product) => accumulator + (product.price * product.quantity), 0)
    if(discount){
      return itemsTotal - discount
    }else{
      return itemsTotal
    }
  };


  const calculateVat =()=> {
    const subtotal = calculateSubtotal()
    const Calculatedvat = (subtotal * 0.05)
    return Calculatedvat.toFixed(2)

  }
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const total = (parseFloat(subtotal));
    return total;
  };

async function handleSave(e){
e.preventDefault()

const selectFields =[name, phone, service, paidBy, preparedBy];
const submitProducts = [...products]
const hasEmptyValues = selectFields.some((value)=> value === '')
const hasNullValues = submitProducts.some(row => Object.values(row).some(value => value === ''))

if(hasEmptyValues ){
  toast.error('Check Sale Fields for empty data')
  return
}
if(hasNullValues){
  toast.error('check Table Data for empty values')
  return
}

    try{
        const subTotal = calculateSubtotal()
        const total = calculateTotal()
        const vat = calculateVat()
        
        await axios.post('/api/multiple/new-sale', {
        products, discount,
        paidBy, driver,
        service, recievedBy,
        name, deliveredTo,
        phone, orderedBy,
        preparedBy, total,
        time,
        subTotal,
        vat, free, 
      },
      toast.success('Success'),
      setRefresh((prevRefresh)=> !prevRefresh)
     )
      }catch(error){
        toast.error(getError(error))
      }
      
}




  return (
    <>
    <Row className='d-flex justify-content-between my-2'>
    <Col sm={2}>
    <Form.Label>Paid By</Form.Label>
    <Form.Select onChange={handleSelectedValue(setPaidBy)}>
      <option>Select...</option>
      <option>Card</option>
      <option>Cash</option>
      <option>TapLink</option>
      <option>Bank Transfer</option>
    </Form.Select>
    </Col>

    <Col sm={2}>
    <Form.Label>Service</Form.Label>
    <Form.Select onChange={handleSelectedValue(setService)} required>
      <option>Select...</option>
      <option>Delivery</option>
      <option>Store Pick Up</option>
      <option>website</option>
      <option>insta-shop</option>
      <option>Delivero</option>
      <option>Careem</option>
    </Form.Select>
    </Col>
    <Col sm={2}>
    <Form.Label>prepared By</Form.Label>
    <Form.Select onChange={handleSelectedValue(setPreparedBy)} required>
      <option>choose..</option>

      <option>Joe</option>
      <option>Allan</option>
      <option>Adel</option>
      <option>Gladwin</option>
    </Form.Select>
    </Col>
    <Col className='' sm={2}>
      <Form.Label>Customer Name:</Form.Label>
      <Form.Control
      type='text'
      value={name || ''}
      name='customerName'
      placeholder='customer name'
      onChange={(e)=> setCustomerName(e.target.value)}
      />
    </Col>
    <Col sm={2}>
      <Form.Label>Customer Tel:</Form.Label>
    <Form.Control
      required
      type='text'
      name='phone'
      value={phone || ''}
      placeholder='customer number'
      onChange={(e)=> setPhoneNumber(e.target.value)}
      />
    </Col>
    </Row>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Arrangement</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Photo</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td>
                <Form.Control
                  required
                  type="text"
                  name="name"
                  value={product.name || ''}
                  onChange={(event) => handleProductChange(index, event)}
                />
              </td>
              <td>
                <Form.Control
                  required
                  type="text"
                  name="arrangement"
                  value={product.arrangement || ''}
                  onChange={(event) => handleArrangementChange(index, event)}
                />
              </td>
              <td>
                <Form.Control
                  required
                  type="number"
                  name="price"
                  value={product.price || ''}
                  onChange={(event) => handleProductChange(index, event)}
                />
              </td>
              <td>
                <Form.Control
                  required
                  type="number"
                  value={product.quantity || ''}
                  onChange={(event) => handleQuantityChange(index, event)}
                />
              </td>
              <td>{product.price && product.quantity ? product.price * product.quantity - discount : 0}</td>
            <td>
          <label htmlFor={`fileInput-${index}`}>
            <BsCamera size={20} />
          </label>
          <input
            id={`fileInput-${index}`}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => handleCaptureImage(index, event.target.files[0])}
            style={{ display: 'none' }}
          />
          {product.loading ? (<span>wait..</span>) : (product.photo && !product.loading &&(<span>Done</span>))}
        </td>
        </tr>
          ))}
        </tbody>
      </Table>
      <Row className='d-flex justify-content-between my-3'>
      <Col md={4}>
      <Button variant='dark' onClick={handleAddRow} className='m-2'>
      <BsPlusSquare/><span className='mx-2'>Add</span>
    </Button>
    </Col>
      <Col md={4}>
      {products.length > 0 ? (
      <Button variant='dark' onClick={handleSave} className='m-2'>
      <BsBoxArrowDown/><span className='mx-2'>save</span>
    </Button>) : (
      <Button variant='dark' disabled className='m-2'>
      <BsBoxArrowDown/><span className='mx-2'>save</span>
    </Button>
    )}
      </Col>
      <Col md={4}>
      <Button variant='dark' onClick={handleReset} className='m-2'>
      <BsFillTrash3Fill/><span className='mx-2'>Reset</span>
      </Button>
      </Col>
      <Col>
      <Form.Check type='checkbox'
        label='Free Of Charge(F.O.C)'
        checked={free}
        className='py-2 mt-3'
        onChange={(e)=>setFree(e.target.checked)}
      />
      {free ? (
        <div className='p-2 border'>
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
      ): (<MessageBox variant='warning'>Not F.O.C</MessageBox>)}
      </Col>
    </Row>
      <div className='border p-2'>
      <p>Subtotal: {calculateSubtotal()}</p>
      <Col className='d-flex justify-content-between'>
      <Form.Label>Discount:</Form.Label>
      <span className='text-danger'>
        <strong>{discount}</strong>
      </span>
      <Form.Control type='number' style={{width:'12rem'}}
        value={discount}
        onChange={(e)=> setDiscount(e.target.value)}
        placeholder='discount'
      />
      </Col>
      <p>vat: {calculateVat()}</p>
      <p>Total: {calculateTotal()}</p>
      </div>
      <Row className='my-2 px-3'>
        <Col style={{ maxHeight: '600px', overflowY: 'auto', border: 'solid 1px'}}>
          <ListGroup>
            {sales && sales.map((sale)=>(
              <ListGroup.Item key={sale._id} onClick={()=> openPDFVeiwer(sale._id)}>
                <Button variant='light'>
                {sale.InvoiceCode}
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col style={{maxWidth:'50%'}}>
            <div>
            {showPDF && printSale &&(
                <PDFViewer width="100%" height="600">
                    <Invoice sale={printSale}/>
                </PDFViewer>
                )}
                </div>
                {printSale && (
                <PDFDownloadLink document={<Invoice sale={printSale} />} fileName={`Invoice_${printSale.InvoiceCode}.pdf`}>
                {({ blob, url, loading, error }) =>
                  loading ? 'Loading document...' : <Button onClick={() => openPDFVeiwer(printSale._id)}>Download</Button>
                }
              </PDFDownloadLink>
            )}
        </Col>
      </Row>
      </>
  );
}

export default SaleTable;
