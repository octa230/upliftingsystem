import React, { useEffect, useState, useContext} from 'react'
import Axios from 'axios'
import { Button, Table, Form } from 'react-bootstrap'
import {BsFillPencilFill, BsCheck2Circle, BsXCircle, BsFillFileBreakFill} from 'react-icons/bs'
import {useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getError } from '../utils/getError'
import { Store } from '../utils/Store'
import axios from 'axios'



export default function InventoryScreen() {

const navigate = useNavigate()
    const {state, dispatch: ctxDispatch} = useContext(Store)
    const {sale: {saleItems} } =  state

  const [searchName, setSearchName] = useState('')
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);




  useEffect(() => {
    if (searchName.trim() === '') {
      getProducts(currentPage);
    } else {
      searchProducts(searchName);
    }
  }, [currentPage, searchName]);



  //get products by search input
  async function searchProducts(searchTerm) {
    try {
      const response = await axios.get(`/api/product/search?searchName=${searchTerm}`);
      setProducts(response.data.products);
      setTotalPages(1); // Reset total pages since we're filtering
    } catch (error) {
      console.error('Error searching products:', error);
    }
  }

  //get all products by page split
  async function getProducts(page){
    try{
        const res = await axios.get(`/api/product/list?page=${page}`)
        setProducts(res.data.products)
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
            await Axios.delete(`/api/product/delete/${product._id}`,)
            toast.success('product deleted')
        }catch(error){
            toast.error(getError(error))
        }
    }

  }

  function handleSearch(event){
    setSearchName(event.target.value)
   // setSearchPrice(event.target.value)
  }

  const filteredProducts = products.filter((x)=> x.name.toLowerCase().includes(searchName.toLocaleLowerCase()))
  //const filteredPrice = products.filter((x)=> x.price)

  const addSaleProduct = async(item)=> {
    toast.success('unit added to sale')
    const existItem =  saleItems.find((x)=> x._id === item._id)
    const quantity = existItem ? existItem.quantity + 1 : 1
    const {data} = await Axios.get(`/api/product/${item._id}`)

    if(data.inStock < quantity){
        window.alert('product outsold')
        return;
    }
    ctxDispatch({type: 'ADD_SALE_ITEM', payload: {...item, quantity}})
  }


  return (
    <>


    <Table striped bordered hover className='w-100' responsive>
        <thead>
            <tr>
                <th>Code</th>
                <th>Name</th>
                <th>purchase</th>
                <th>inStock</th>
                <th>Price</th>
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
                          {product.purchase}
                        </td>
                        <td style={product.inStock < 5 ? {backgroundColor: 'red'}: {backgroundColor: 'green'}}>
                            {product.inStock}
                        </td>
                        <td>
                            {product.price}
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
    <div>
        {Array.from({ length: totalPages }, (_, index) => (
          <Button key={index} onClick={() => handlePageChange(index + 1)} variant='success' className='m-2 btn-sm'>
            {index + 1}
          </Button>
        ))}
    </div>
</>
)
}
