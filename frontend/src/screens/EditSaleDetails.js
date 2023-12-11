import React, { useEffect, useState, useReducer, useContext} from 'react'
import {useParams} from 'react-router-dom'
import Card from 'react-bootstrap/esm/Card'
import Container from 'react-bootstrap/esm/Container'
import Form from 'react-bootstrap/esm/Form'
import Stack from 'react-bootstrap/esm/Stack'
import Table from 'react-bootstrap/esm/Table'
import Button from 'react-bootstrap/esm/Button'
import Col from 'react-bootstrap/esm/Col'
import {Store} from '../utils/Store'
import MessageBox from '../components/MessageBox'
import {FaPlusCircle, FaRedo} from 'react-icons/fa'
import axios from 'axios'
import {toast} from 'react-toastify'
import {getError} from '../utils/getError'




const reducer = (state, action) => {
    switch (action.type) {
      case 'FETCH_SALE_REQUEST':
        return { ...state, loading: true};
      case 'FETCH_SALE_SUCCESS':
        return { ...state, loading: false, sale: action.payload  };
      case 'FETCH_SALE_FAIL':
        return { ...state, loading: false, error: action.payload };
      case 'UPDATE_REQUEST':
        return { ...state, loadingUpdate: true, data: action.payload};
      case 'UPDATE_SUCCESS':
        return { ...state, loadingUpdate: false };
      case 'UPDATE_FAIL':
        return { ...state, loadingUpdate: false };
      case 'FETCH_PRODUCTS_REQUEST':
        return { ...state, loading: true};
      case 'FETCH_PRODUCTS_SUCCESS':
        return {...state, loading: false, products: action.payload.products};
      case 'UPLOAD_FAIL':
        return { ...state, loadingUpload: false, errorUpload: action.payload };
  
      default:
        return state;
    }
  };

export default function EditSaleDetails() {

const params = useParams()
const {id: saleId} = params;

const [selectedProducts, setSelectedProducts] = useState([]);
const [totalValue, setTotalValue] = useState(0);
const [code, setCode] = useState('')
const [unitName, setunitName] = useState('')
const [products, setProducts] = useState([])
const [images, setImages] = useState([]);
const [image, setImage] = useState('')

const { state} = useContext(Store);
const { userInfoToken } = state;

const [{sale}, dispatch] =
    useReducer(reducer, {
      sale:{},
      loading: true,
      error: '',
    });

useEffect(()=> {
  const fetchData = async()=> { 
    dispatch({type: 'FETCH_SALE_REQUEST'})
      try{
          const {data} = await axios.get(`/api/multiple/get-sale/${saleId}`)
          dispatch({type: 'FETCH_SALE_SUCCESS', payload: data})
          setCode(data.InvoiceCode)
      } catch(error){
          dispatch({type: 'FETCH_SALE_FAIL', payload: getError(error)})
      }
  }
  getProducts()
  fetchData()
}, [saleId])


const getProducts = async()=> {
  try{
    const {data} = await axios.get('/api/product/names')
    setProducts(data)
  } catch(error){
    toast.error(getError(error))
  }
}


const handleAddRow = () => {
  setSelectedProducts([...selectedProducts, { product: '', quantity: 0,  }]);
};

const handleQuantityChange = (event, index) => {
  const quantity = event.target.value;
  const newSelectedProducts = selectedProducts.map((selectedProduct, i) => {
    if (i === index) {
      return { ...selectedProduct, quantity };
    } else {
      return selectedProduct;
    }
  });
  setSelectedProducts(newSelectedProducts);
};

const handleProductChange = (event, index) => {
  const product = event.target.value
  const newSelectedProducts = selectedProducts.map((selectedProduct, i)=> {
    if(i === index){
      return{...selectedProduct, product}
    }else{
      return selectedProduct
    }
  });
   setSelectedProducts(newSelectedProducts)
};



//REMOVE ROW
 const handleRemoveRow = (index) => {
  setSelectedProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
  };


////UPLOAD PHOTO/PHOTOS
const uploadFileHandler = async(e, forImages)=>{
 try{
  const file = e.target.files[0]
  const bodyFormData = new FormData()
  bodyFormData.append('file', file)
  const {data} = await axios.post('/api/upload/', bodyFormData, {
    headers :{
      'Content-Type': 'multipart/form-data',
      authorization: `Bearer ${userInfoToken.token}`,
    }
  })
  setImage(data.secure_url)
 }catch(error){
  getError(error)
 }
}


const handleNewTable = () => {
  setSelectedProducts([]);
  setTotalValue(0);
};
///send data to backend
  const handleSave = async () => {
    if (unitName === '') {
      toast.error('Please Add arrangement');
      return;
    }
    if (image === '') {
      toast.error('Please Add photo');
      return;
    }
  
    const hasInvalidProducts = selectedProducts.some(
      (row) => !row.product || !row.quantity || isNaN(row.quantity)
    );
  
    if (hasInvalidProducts) {
      toast.error('Invalid product data');
      return;
    }
  
    try {  
      await axios.post(`/api/multiple/${saleId}/add-units`, {
        selectedProducts, unitName, image
      });
  
      toast.success('unit added successfully');
      //console.log()
    } catch (error) {
      toast.error(getError(error));
      console.log(selectedProducts, unitName, images, image);
    }
  };
  
  
return (
<Container>
        <Stack direction='vertical' gap={2}>
              <div className='d-flex align-items-center'>
              <Col md={3} xm={12}>
                  <Card.Title className='m-2'>code:{' '}{sale.InvoiceCode}</Card.Title>
                    <Form.Control type='text'
                    onChange={(e)=> setunitName(e.target.value)}
                    name='arrangement'
                    placeholder='add arrangement'
                    />
              </Col>
              <Col md={8} xm={12} className='px-2'>
                  <Card.Title className='m-2'>Add Photo</Card.Title>
                  <Form.Group className="mb-3" controlId="imageFile">

                  <Form.Label className='productEditScreenText'>Upload Image</Form.Label>
                  <Form.Control 
                    type="file" 
                    onChange={uploadFileHandler} 
                />
          </Form.Group>
              {image ? (
                <Card.Img src={image} style={{width:'200px'}}/>
              ): (<MessageBox>ADD IMAGE & WAIT</MessageBox>)}
              </Col>
              </div>
                <Button onClick={handleAddRow} className='w-25'>
                  <FaPlusCircle/> Add row
                </Button>
          <Col md={6} lg={8}>
          <Table striped bordered hover className='mt-4'>
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
                            <Form.Label>product</Form.Label>
                            <Form.Select as="select"  value={selectedProduct.name} onChange={(e)=>handleProductChange(e, index)}>
                              <option value=""> ---select--- </option>
                                {products.map((product)=> (
                                  <option key={product._id} value={product._id}>
                                    {product.name}
                                  </option>
                                ))}
                            </Form.Select>
                        </td>
                       <td>
                        <Form.Label>quantity</Form.Label>
                        <Form.Control type='number' name='quantity' value={selectedProduct.quantity}
                        onChange={(e)=> handleQuantityChange(e, index)}
                        />
                        </td> 
                        <td>
                          <Button variant='' onClick={()=>handleRemoveRow(index)}>Delete</Button>
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
        </Stack>
</Container>
  )
}
