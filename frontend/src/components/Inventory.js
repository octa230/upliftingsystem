import React, { useEffect, useState, useContext} from 'react'
import { Button, Table} from 'react-bootstrap'
import {BsFillPencilFill, BsCheck2Circle, BsXCircle, BsFillFileBreakFill} from 'react-icons/bs'
import {useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getError } from '../utils/getError'
import { Store } from '../utils/Store'
import Form from 'react-bootstrap/esm/Form'
import Badge from 'react-bootstrap/esm/Badge'
import axios from 'axios'



export default function InventoryScreen() {

const navigate = useNavigate()
    const {state, dispatch: ctxDispatch} = useContext(Store)
    const {sale: {saleItems} } =  state

  const [searchName, setSearchName] = useState('')
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalValue, setotalValue] = useState(0)




  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchName.trim() === '') {
        getProducts(currentPage);
      } else {
        searchProducts(searchName);
      }
    }, 300); // Adjust the delay as needed (300ms in this example)
  
    return () => clearTimeout(delaySearch);
  }, [currentPage, searchName]);



  //get products by search input
  const searchProducts= async(searchTerm)=> {
    try {
      const response = await axios.get(`/api/product/list?${searchTerm}`);
      setProducts(response.data.products);
      setTotalPages(1); // Reset total pages since we're filtering
    } catch (error) {
      console.error('Error searching products:', error);
    }
  }

  //get all products by page split
  async function getProducts(page){
    try{
        const res = await axios.get(`/api/product/list`)
        setProducts(res.data.products || [])
        setotalValue(res.data.totalValue)
        setTotalPages(res.data.totalPages);
    }catch(error){
        console.error('Error fetching data:', error);
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
  const filteredProducts = products?.filter((x) => x.name.toUpperCase().includes(searchName.toLowerCase())) || [];

  //const filteredPrice = products.filter((x)=> x.price)

  const addSaleProduct = async(item)=> {
    toast.success('unit added to sale')
    const existItem =  saleItems.find((x)=> x._id === item._id)
    const quantity = existItem ? existItem.quantity + 1 : 1
    const {data} = await axios.get(`/api/product/${item._id}`)

    if(data.inStock < quantity){
        window.alert('product outsold')
        return;
    }
    ctxDispatch({type: 'ADD_SALE_ITEM', payload: {...item, quantity}})
  }


  return (
    <>
    <Badge variant='success' className='p-3 mb-2'>Total value:{round2(totalValue)}{' '}</Badge>
    <Table striped bordered hover className='w-100'
     style={{
      overflowY: 'auto',
      maxHeight: '700px',
      //margin: 'auto',
      width: '100%',
      display: 'block', // Important for table layout
      //borderCollapse: 'collapse', // Optional styling for table borders
    }} 
    >
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
            {filteredProducts.map((product)=> (
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
