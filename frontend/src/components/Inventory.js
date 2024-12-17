import React, { useEffect, useState, useContext, useReducer, useRef} from 'react'
import { Button, Modal, Table} from 'react-bootstrap'
import {BsFillPencilFill, BsCheck2Circle, BsXCircle, BsTrash2Fill} from 'react-icons/bs'
import { toast } from 'react-toastify'
import { getError } from '../utils/getError'
import { Store } from '../utils/Store'
import Form from 'react-bootstrap/esm/Form'
import Container from 'react-bootstrap/esm/Container'
import Row from 'react-bootstrap/esm/Row'
import Col from 'react-bootstrap/esm/Col'
import { useReactToPrint } from 'react-to-print';
import axios from 'axios'
import AddProduct from './AddProduct'


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

  //const {userInfoToken} = useContext(Store)

  const [{ products }, dispatch] = useReducer(reducer, initialState)

  const {state, dispatch: ctxDispatch} = useContext(Store)
  const {selectedItems, userInfoToken } =  state
  const tableRef = useRef()

  const [searchName, setSearchName] = useState(null)
  const [stockOnly, setStockOnly] = useState(false)
  const [outOfStock, setOutOfStock] = useState(false)
  const [selectedIdentifier, setSelectedIdentifier] = useState('')

  const [openModal, setOpenModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState({})


  //get products by search input

  
  const fetchedProducts = async () => {
    try {
      let data;
  
      if (searchName) {
        data = await axios.get(`/api/product/search?searchName=${searchName}`);
        dispatch({ type: "OPEN_SEARCH", payload: data.data });
      } else if (stockOnly) {
        setOutOfStock(false)
        data = await axios.get(`/api/product/stock-only?stockStatus=in&identifier=${selectedIdentifier}`);
        dispatch({ type: "FETCH_PRODUCTS", payload: data.data });
      }else if(outOfStock){
        setStockOnly(false)
        data = await axios.get(`/api/product/stock-only?stockStatus=out&identifier=${selectedIdentifier}`);
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
    //console.log(userInfoToken?.token)
  },[searchName, stockOnly, outOfStock, selectedIdentifier])


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

  const handleIdentifer=(e)=>{
    if(selectedIdentifier === ''){
      const label = e.target.parentElement.textContent.trim();
      setSelectedIdentifier(label);
    }else{
      setSelectedIdentifier('')
    }
    //console.log(label);
  }

  return (
    <Container fluid className='border'>
    <Row className='m-0 p-2'>
      <Col>
      <Button className='p-2 m-1 bg-light text-dark font-monospace'>
        AED: {round2(products?.reduce((acc, product)=> acc + (product.purchasePrice * product.inStock), 0))}{' '}
      </Button>


      <Button variant='success' className='p-2' onClick={()=> setOpenModal(!openModal)}>
        Add Product +
      </Button>
      </Col>
      <Col md={8} className='d-flex'>
        <Form.Control type='text'
          value={searchName}
          onChange={(e)=> setSearchName(e.target.value)}
          placeholder='Search products'
        />
        <Button onClick={()=> setSearchName('')} className='p-2' variant='light'>
          <BsXCircle/>
        </Button>
      </Col>
    </Row>
    <div className='d-flex gap-3 p-2 bg-dark text-light'>
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
        <Form.Check
          label="STEM"
          checked={selectedIdentifier === "STEM"}
          onChange={handleIdentifer}
        />
        <Form.Check
          label="PLANT"
          checked={selectedIdentifier === "PLANT"}
          onChange={handleIdentifer}
        />
        <Form.Check
          label="BUNCH"
          checked={selectedIdentifier === "BUNCH"}
          onChange={handleIdentifer}
        />
        <Form.Check
          label="TOOL"
          checked={selectedIdentifier === "TOOL"}
          onChange={handleIdentifer}
        />
        <Form.Check
          label="ACCESSORY"
          checked={selectedIdentifier === "ACCESSORY"}
          onChange={handleIdentifer}
        />
        <Form.Check
          label="ARRANGEMENT"
          checked={selectedIdentifier === "ARRANGEMENT"}
          onChange={handleIdentifer}
        />
      </div>
    <Table responsive bordered ref={tableRef}>
        <thead>
            <tr>
                <th>Code</th>
                <th colSpan={1}>Name</th>
                <th>Buy</th>
                <th>Sell</th>
                <th>InStock</th>
                <th>Purchase</th>
                <th>Sold</th>
                <th>Returned</th>
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
                        <td colSpan={1} className='text-truncate w-25'>
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
                          {product.returned}
                        </td>
                        <td>
                            {product.waste}
                        </td>
                        <td>
                            {product.closingStock}
                        </td>
                        <td className='d-flex justify-content-between p-2'>
                            <BsFillPencilFill onClick={()=> {
                              setSelectedProduct(product) 
                              setOpenModal(true)
                            }}/>
                            <BsTrash2Fill onClick={()=> deleteHandler(product)}/>
                            <BsCheck2Circle onClick={()=> addSaleProduct(product)}/>
                        </td>
                    </tr>                    
                ))
            }
        </tbody>      
    </Table>


    <Modal show={openModal} onHide={()=>{
      setOpenModal(!openModal)
      setSelectedProduct(null)

    }}>
      <AddProduct product={null || selectedProduct} userInfoToken={userInfoToken}/>
    </Modal>
</Container>
)
}

export default InventoryScreen