import React, {useEffect, useReducer } from 'react'
import axios from 'axios'
import { getError } from '../utils/getError'
import { Button, ListGroup } from 'react-bootstrap'
import { toast } from 'react-toastify'



function reducer (state, action){
    switch(action.type){
        case 'FETCH_REQUEST':
            return{...state, loading: true}
        case 'FETCH_SUCCESS':
            return{...state, sales: action.payload, loading: false}
        case 'FETCH_FAIL':
            return{...state, loading: false, error: action.payload}
        case 'INOVICE_REQUEST':
            return{...state, loading: true}
        case 'INVOICE_SUCCESS':
            return{...state, loading: false}
        case 'INVOICE_FAIL':
            return{...state, loading: false}
        default:
            return state
    }

}


export default function SalesHistory() {

    const [{sales }, dispatch]= useReducer(reducer, {
        loading: true,
        error: '',
        sales:[]
    })

    useEffect(()=> {
        const fetchData = async()=> {
            dispatch({type: 'FETCH_REQUEST'});
            try{
            await axios.get('/api/sales/list') 
            dispatch({type: 'FETCH_SUCCESS'})
            
            }catch(error){
                dispatch({type: 'FETCH_FAIL', payload: getError(error)})
            }
        }
        fetchData()
    }, [])

    //generate invoice function

    const generateInvoice = async(sale)=> {
        try{
            dispatch({type: 'INVOICE_REQUEST'})
            const {data} = await axios.post(`/api/sales/make-invoice/${sale._id}`)
            dispatch({type: 'INVOICE_SUCCESS'})
        }catch(error){
            dispatch({type: 'INVOICE_FAIL'})
            toast.error(getError(error))
        }
    }
  return (
    <table className='table align-items-center'>
        <thead>
            <tr>
                <th>CODE</th>
                <th>DESC</th>
                <th>Date</th>
                <th>Total</th>
                <th>Store/ Delivery</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {sales?.map((sale)=> (
                <tr key={sale._id}>
                    <td >{sale.InvoiceCode}</td>
                    <td>
                        <ListGroup variant='flush'>
                            {sale.saleItems.map((item)=>(
                                <ListGroup.Item key={item._id}>
                                    {item.name}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </td>
                    <td>{sale.createdAt.substring(0, 10)}</td>
                    <td>{sale.totalPrice.toFixed(2)}</td>
                    <td>{'N/A'}</td>
                    <td>
                        <Button variant='' onClick={generateInvoice}>invoice</Button>
                        <Button variant=''>Review</Button>
                    </td>
                </tr>
            ))}
        </tbody>  
    </table>
  )
}
