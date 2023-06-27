import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Container from 'react-bootstrap/Container';
import axios from 'axios'
import {getError} from '../utils/getError'
import easyinvoice from 'easyinvoice'
import {toast} from 'react-toastify'
import {BsBoxArrowDown, BsPlusSquare, BsCameraFill, BsFillTrash3Fill} from 'react-icons/bs'






function ProductTable() {

  const time = new Date().toLocaleDateString('en-GB');
  const [products, setProducts] = useState([]);
  const [paidBy,  setPaidBy]= useState('')
  const [service, setService]= useState('')
  const [name, setCustomerName] = useState('')
  const [phone, setPhoneNumber] = useState('')
  const [preparedBy, setPreparedBy]= useState('')
  const [vat, setVat] = useState(5);
  const [file, setFile] = useState('')
  const [source, setSource] = useState("")


  const handleAddRow=()=> {
    setProducts([...products, {name:"", price: 0, quantity: 0, arrangement:"", file:""}]);
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

  
  const handleFileChange=(event, index)=> {
    const newProducts = [...products];
    newProducts[index].file = event.target.value
    setFile(newProducts)
    console.log(newProducts)
  }
  const calculateSubtotal = () => {
    return products.reduce((accumulator, product) => accumulator + (product.price * product.quantity), 0);
  };

  const handelCapture =(target)=> {
    if(target.files){
      if(target.files.target !== 0){
        const file = target.files[0]
        const newUrl = URL.createObjectURL(file)
        setSource(newUrl)
      }
    }
  }


  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const total = subtotal + (subtotal * vat / 100);
    return total.toFixed(2);
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

const data ={

        images:{
          logo: 'https://uplifting.ae/wp-content/uploads/2022/10/cropped-Uplifting-Floral-Studio-Horizontal-02-600x200.png',
        },

        sender:{
          company: 'Uplifting Floral Studio',
          address: 'Business Bay BB02',
          city: 'Dubai',
          country: 'UAE'
        },

        client:{
            company: name,
            address: phone
        },
        information: {
            number: "UPDXB_" + Math.floor(100000 + Math.random()* 900000),
            date: time
        },
        products: products.map((product)=> ({
            quantity: product.quantity,
            description: product.arrangement,
            "tax-rate": 5,
            price: product.price,

        })),
        'vat':vat, preparedBy, 
        paidBy,service,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),  
        'bottom-notice': `
        Welcome to our Floral Paradise <br/> 
        <a href='https://www.instagram.com/upliftingdxb/'>instagram</a>
        Facebook <a href='https://www.instagram.com/upliftingdxb/'>Facebook</a>
        Site <a href='https://uplifting.ae'>Website</a>`,
        "settings":{
        "currency": 'AED',
        "margin-top": 50,
        "margin-right": 50,
        "margin-left": 50,
        "margin-bottom":5
        }
    } 

      try{
        const invoiceNumber = data.information.number
        const subTotal = calculateSubtotal()
        const total = calculateTotal()

        const {result} = await axios.post('/api/multiple/new-sale', {
          products, paidBy, service,
          name, phone, preparedBy, total,
          time, invoiceNumber, subTotal, file
        },
        console.log(products, paidBy, service,
          name, phone, preparedBy, subTotal,
          vat, invoiceNumber, total,
        ))
      }catch(error){
        toast.error(getError(error))
      }
      const result = await easyinvoice.createInvoice(data)
      easyinvoice.render('pdf', result.pdf)
      easyinvoice.download(`${data.information.number}.pdf`, result.pdf)  
  }




  return (
    <Container fluid>
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
      <option>Lynn</option>
      <option>Allan</option>
      <option>Joe</option>
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
            <th>Photo</th>
            <th>Subtotal</th>
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
              <td>
                <div className='d-flex'>
                <Form.Control
                type='file'
                name='photo'
                accept='image/*'
                multiple
                onChange={(event)=> handleFileChange(event, index)}
                />
                  <span className='mx-2'>
                  <Button
                  accept='image/*'
                  type='file'
                  capture="enviroment"
                  onChange={(e)=> handelCapture(e.target)}
                  >
                    <BsCameraFill/>
                  </Button>
                </span>
                </div>
             
              </td>
              <td>{product.price && product.quantity ? product.price * product.quantity : 0}</td>
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
    </Row>
      <Form.Group className='w-25'>
        <Form.Label>VAT (%)</Form.Label>
        <Form.Control
          type="number"
          value={vat}
          onChange={(event) => setVat(parseInt(event.target.value, 10) || 0)}
        />
      </Form.Group>
      <p>Subtotal: {calculateSubtotal()}</p>
      <p>Total: {calculateTotal()}</p>
    </Container>
  );
}

export default ProductTable;
