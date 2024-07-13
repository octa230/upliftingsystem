import React, { useEffect, useState, useContext, useReducer, useRef} from 'react'
import { Button, Table} from 'react-bootstrap'
import {BsFillPencilFill, BsCheck2Circle, BsXCircle} from 'react-icons/bs'
import {useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getError } from '../utils/getError'
import { Store } from '../utils/Store'
import Form from 'react-bootstrap/esm/Form'
import Container from 'react-bootstrap/esm/Container'
import Row from 'react-bootstrap/esm/Row'
import Col from 'react-bootstrap/esm/Col'
import Badge from 'react-bootstrap/esm/Badge'
import { useReactToPrint } from 'react-to-print';
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


const InventoryScreen =()=> {

  const initialState = {
    error: "",
    loading: true,
    products: []
  };

  const [{ products }, dispatch] = useReducer(reducer, initialState)

  const navigate = useNavigate()
    const {state, dispatch: ctxDispatch} = useContext(Store)
    const {selectedItems } =  state
    const tableRef = useRef()

  const [searchName, setSearchName] = useState(null)
  const [stockOnly, setStockOnly] = useState(false)
  const [outOfStock, setOutOfStock] = useState(false)


  //get products by search input

  
  const fetchedProducts = async () => {
    try {
      let data;
  
      if (searchName) {
        data = await axios.get(`/api/product/search?searchName=${searchName}`);
        dispatch({ type: "OPEN_SEARCH", payload: data.data });
      } else if (stockOnly) {
        setOutOfStock(false)
        data = await axios.get(`/api/product/stock-only?stockStatus=${"in"}`);
        dispatch({ type: "FETCH_PRODUCTS", payload: data.data });
      }else if(outOfStock){
        setStockOnly(false)
        data = await axios.get(`/api/product/stock-only?stockStatus=${"out"}`);
        dispatch({ type: "FETCH_PRODUCTS", payload: data.data });
      }else {
        data = await axios.get('/api/product/all');
        dispatch({ type: "FETCH_PRODUCTS", payload: data.data });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      dispatch({ type: "FAILED_SEARCH", payload: error.message });
    }
  };
  

  useEffect(()=> {
    fetchedProducts(searchName, stockOnly, dispatch)
  },[searchName, stockOnly, outOfStock])


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
    await axios.get(`/api/product/${item._id}`)
    ctxDispatch({type: 'ADD_SELECTED_ITEM', payload: {...item, quantity}})
  }


  return (
    <Container fluid>
    <Row>
      <Col>
      <Badge variant='success' className='p-3 mb-2'>
        Total value:{round2(products?.reduce((acc, product)=> acc + (product.purchasePrice * product.inStock), 0))}{' '}
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
      <Col>
        <Form.Check
          label="IN STOCK ONLY"
          checked={stockOnly}
          onChange={()=> setStockOnly(!stockOnly)}
        />
        <Form.Check
          label="OUT OF STOCK ONLY"
          checked={outOfStock}
          onChange={()=> setOutOfStock(!outOfStock)}
        />
      </Col>
    </Row>
    <Table responsive bordered ref={tableRef}>
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
                  <span>Actions</span>
                    <Button onClick={useReactToPrint({content: ()=> tableRef.current})}>
                      Print
                    </Button>
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
</Container>
)
}

export default InventoryScreen