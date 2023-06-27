import React, { useEffect, useState, useReducer, useContext} from 'react'
import Axios from 'axios'
import { Button, Container, Table, Form } from 'react-bootstrap'
import {BsFillPencilFill, BsCheck2Circle, BsXCircle, BsPlusSquareFill, BsFillFileBreakFill} from 'react-icons/bs'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getError } from '../utils/getError'
import { Store } from '../utils/Store'



const reducer = (state, action)=> {
    switch(action.type){
        case 'FETCH_REQUEST':
            return { ...state, loading: false };
        case 'FETCH_SUCCESS':
            return { 
                ...state, 
                products: action.payload.products,
                page: action.payload.page,
                pages: action.payload.pages,
                loading: false 
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'DELETE_REQUEST':
            return {...state, loadingDelete: true, successDelete: false}
        case 'DELETE_SUCCESS':
            return {...state, loadingDelete: false, successDelete: true}
        case 'DELETE_FAIL':
            return {...state, loadingUpdate: false, successDelete: false}
        case 'UPDATE_REQUEST':
            return {...state, loadingUpdate: true}
        case 'UPDATE_SUCCESS':
            return {...state, loadingUpdate: false}
        case 'UPDATE_FAIL':
            return {...state, loadingUpdate: false}
        default:
            return state
    }
}


export default function InventoryScreen() {


    const {state, dispatch: ctxDispatch} = useContext(Store)
    const {sale: {saleItems} } =  state

    const {search} = useLocation() 
    const navigate = useNavigate()
    const sp = new URLSearchParams(search);
    const page = sp.get('page') || 1

  const [{successDelete, error, products, pages}, dispatch]= useReducer(reducer, {
    loading: true,
    products:[],
    error: ''
  })

  const [code, setCode]= useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState()
  const [inStock, setInStock] = useState(0)
  const [searchName, setSearchName] = useState('')



  useEffect(()=> {
   const getProducts = async()=> {

    dispatch({type: 'FETCH_REQUEST'})
       try{    
        const {data}  = await Axios.get(`/api/product/list?page=${page}`)
        dispatch({type: 'FETCH_SUCCESS', payload: data})
       } catch(error){
        toast.error(getError(error))
       }
    
    }
    if(successDelete){
        dispatch({type: 'DELETE_RESET'})
    } else{
        getProducts() 
    }
  }, [page, successDelete])


  async function deleteHandler(product){
    if(window.confirm('Are you sure?')){
        dispatch({type: 'DELETE_REQUEST'})
        try{
            await Axios.delete(`/api/product/delete/${product._id}`,)
            toast.success('product deleted')
            dispatch({type: 'DELETE_SUCCESS'})
        }catch(err){
            toast.error(getError(error))
            dispatch({type: 'DELETE_FAIL'})
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
   <Container fluid>
    <div>
        <Form.Control className='p-2 my-2 w-100'
            type="text"
            placeholder = "search..."
            value={searchName}
            onChange={handleSearch}
        />
    <Table striped bordered hover className='my-2 w-100' responsive>
        <thead>
            <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th className='d-flex justify-content-between'>
                    Actions
                    <span>
                        <Button href='/dashboard' variant=''>
                           Add product <BsPlusSquareFill/>
                        </Button>
                    </span>
                    <span>
                        <Button variant='' onClick={()=> navigate('/print-inventory')}>
                            Print <BsFillFileBreakFill />
                        </Button>
                    </span>
                </th>
            </tr>
        </thead>
        <tbody>
            {
                filteredProducts?.map((product)=> (
                    <tr key={product._id}>
                        <td>{product._id.slice(0, 8)}...</td>
                        <td>
                            <input
                            value={product.code || code}
                            type='text'
                            onChange={(e)=> setCode(e.target.value)}
                            />

                        </td>
                        <td>
                            <input 
                            value={product.name || name}
                            type='text'
                            onChange={(e)=> setName(e.target.value)}
                            />
                        </td>
                        <td>
                            <input 
                            type='Number'
                            value={product.price || price}
                            onChange={(e)=> setPrice(e.target.value)}
                            />

                        </td>
                        <td>
                            <input 
                            type='Number'
                            value={product.inStock || inStock}
                            onChange={(e)=> setInStock(e.target.value)}
                            />

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
    </div>

    <div>
        {[...Array(pages).keys()].map((x)=>(
            <Link key={x+ 1} 
            to={`/api/product/list?page=${x + 1}`}
            className={x + 1 === Number(page) ? 'btn text-bold': 'btn'}
            >
            {x + 1}
            </Link>
        ))}
    </div>
   </Container>
  )
}
