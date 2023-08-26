import React, {useEffect, useReducer, useRef, useState} from 'react'
import {useReactToPrint} from 'react-to-print'
import { Link, useLocation } from 'react-router-dom'
import { Button, Container, Table, Form } from 'react-bootstrap'
import {BsFillArrowUpRightSquareFill} from 'react-icons/bs'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getError } from '../utils/getError'



const reducer = (state, action)=> {
    switch(action.type){
        case 'FETCH_REQUEST':
            return {...state, loading: true}
        case 'FETCH_SUCCESS':
            return {
                ...state, loading: false, 
                products: action.payload.products, 
                page: action.payload.page, 
                pages: action.payload.pages,    
            }
        default:
            return state
    }
}

export default function PrintStock() {

    const PDF = useRef()
    const {search} = useLocation()
    const sp = new URLSearchParams(search)
    const page = sp.get('page') || 1

    const [searchTerm, setSearchTerm] = useState('')

   
    const [{products, pages}, dispatch] = useReducer(reducer, {
        loading: true,
        products: [],
        error: ""
    })

    useEffect(()=> {
        const getProducts = async()=> {
            dispatch({type: 'FETCH PRODUCTS'})
            try{
                const {data} = await axios.get(`/api/product/list?page${page}`)
                dispatch({type: 'FETCH_SUCCESS', payload: data})
            } catch(error){
                toast.error(getError(error))
            }
        }
        getProducts()
    }, [page])
    
    const generatePDF = useReactToPrint({
        content: ()=> PDF.current,
        documentTitle: "inventory List",
        onafterprint:()=> alert('pdf file saved')
    })

    function handleSearch(event){
        setSearchTerm(event.target.value)
    }

    const searchPrice = Number(searchTerm)
    const filteredProducts = products.filter((x)=> x.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || searchPrice)

  return (
    <Container fluid className='my-2'>
     <Form.Control className='my-3'
            type="input"
            value={searchPrice || searchTerm}
            onChange={handleSearch}
            placeholder='search by name'
            />
        <Button onClick={generatePDF}>
            print table data
        <span className='p-3'>
            <BsFillArrowUpRightSquareFill />
        </span>
        </Button>
        <div ref={PDF}  style={{width:"100%"}}>
            <h6 style={{padding: '12px', textAlign: 'center'}}>{`Printed On: ${new Date().toLocaleDateString('en-GB')}`}</h6>
        <Table striped bordered hover className='my-2 w-100'>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Stock</th>
                </tr>
            </thead>
            <tbody>
                {filteredProducts?.map((product)=> (
                    <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{product.inStock}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
      </div>
      <div>
        {[...Array(pages).keys()].map((x)=>(
            <Link key={x+ 1} 
            to={`/api/product/list?page${x + 1}`}
            className={x + 1 === Number(page) ? 'btn text-bold': 'btn'}
            >
            {x + 1}
            </Link>
        ))}
    </div>
    </Container>
  )
}