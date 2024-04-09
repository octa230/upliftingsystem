import React, { useEffect, useState, useContext, useReducer} from 'react'
import { Button, Table} from 'react-bootstrap'
import {BsFillPencilFill, BsCheck2Circle, BsXCircle, BsFillFileBreakFill} from 'react-icons/bs'
import {useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getError } from '../utils/getError'
import { Store } from '../utils/Store'
import Form from 'react-bootstrap/esm/Form'
import Row from 'react-bootstrap/esm/Row'
import Col from 'react-bootstrap/esm/Col'
import Badge from 'react-bootstrap/esm/Badge'
import axios from 'axios'


const reducer = (state, action)=>{
  switch(action.type){
    case "FETCH_PRODUCTS":
      return {...state, products: action.payload}
    case "OPEN_SEARCH":
      return {...state, products: action.payload}
    case "FAILED_SEARCH":
      return {...state, loading: false, error: action.payload}
    default:
      return state;
  }
}


export default function InventoryScreen() {

  const initialState = {
    error: "",
    loading: true,
    products: [] // Initialize products as an empty array
  };

  const [{ products }, dispatch] = useReducer(reducer, initialState)

  const navigate = useNavigate()
    const {state, dispatch: ctxDispatch} = useContext(Store)
    const {selectedItems } =  state

  const [searchName, setSearchName] = useState('')



  //get products by search input
  const fetchedProducts = async (searchName) => {
    if(!searchName){
      const {data} = await axios.get('/api/product/all')
      dispatch({type: "FETCH_PRODUCTS", payload: data})
    }else{
      const {data} = await axios.get(`/api/product/search?searchName=${searchName}`)
      dispatch({type: "OPEN_SEARCH", payload: data})
    }
  };

  useEffect(()=> {
    fetchedProducts(searchName, dispatch)
  },[searchName])


  async function deleteHandler(product){
    if(window.confirm('Are you sure?')){
        try{
            await axios.delete(`/api/product/delete/${product._id}`,)
            toast.success('product deleted')
        }catch(error){
            toast.error(getError(error))
        }
    }

  }
  

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  

  //const filteredPrice = products.filter((x)=> x.price)

  const addSaleProduct = async(item)=> {
    const existItem =  selectedItems.find((x)=> x._id === item._id)
    const quantity = existItem ? existItem.quantity + 1 : 1
    const {data} = await axios.get(`/api/product/${item._id}`)

    if(data.inStock < quantity){
        window.alert('product outsold')
        return;
    }
    ctxDispatch({type: 'ADD_SELECTED_ITEM', payload: {...item, quantity}})
  }


  return (
    <>
    <Row>
      <Col>
      <Badge variant='success' className='p-3 mb-2'>
        Total value:{round2(products.reduce((acc, product)=> acc + (product.purchasePrice * product.inStock), 0))}{' '}
      </Badge>
      </Col>
      <Col md={8} className='d-flex m-1'>
        <Form.Control type='text'
          value={searchName}
          onChange={(e)=> setSearchName(e.target.value)}
          placeholder='Search products'
        />
        <Button onClick={()=> setSearchName('')} className='p-2' variant=''>
          <BsXCircle/>
        </Button>
      </Col>
    </Row>
    <Table responsive striped bordered hover className='w-100 lg'>
        <thead>
            <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Buy</th>
                <th>Sell</th>
                <th>InStock</th>
                <th>Purchase</th>
                <th>Sold</th>
                <th>Waste</th>
                <th>Closing</th>
                <th className='d-flex justify-content-between'>
                    Actions
                    <span>
                        <Button variant='' onClick={()=> navigate('/print-inventory')}>
                          Print <BsFillFileBreakFill />
                        </Button>
                    </span>
                </th>
            </tr>
        </thead>
        <tbody>
            {products.map((product)=> (
              <tr key={product._id}>
                <td>
                            {product.code}
                        </td>
                        <td>
                            {product.name}
                        </td>
                        <td>
                          {product.purchasePrice}
                        </td>
                        <td>
                            {product.price}
                        </td>
                        <td style={product.inStock < 5 ? {backgroundColor: 'red'}: {backgroundColor: 'green'}}>
                            {product.inStock}
                        </td>
                        <td>
                          {product.purchase}
                        </td>
                        <td>
                          {product.sold}
                        </td>
                        <td>
                            {product.waste}
                        </td>
                        <td>
                            {product.closingStock}
                        </td>
                        <td className='d-flex justify-content-end'>
                          <Button variant='' onClick={()=> (navigate(`/api/product/update/${product._id}`))}>                               
                            Edit <BsFillPencilFill/>
                          </Button>
                            <Button variant='' onClick={()=> deleteHandler(product)}>
                               Delete <BsXCircle/>
                            </Button>
                        <Button variant='' onClick={()=> addSaleProduct(product)}>
                            Add <BsCheck2Circle/>
                          </Button> 
                        </td>
                    </tr>                    
                ))
            }
        </tbody>      
    </Table>
</>
)
}
