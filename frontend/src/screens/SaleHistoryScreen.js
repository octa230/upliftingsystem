import React, {useEffect, useReducer, useState} from 'react'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Container from 'react-bootstrap/Container'
import ListGroup from 'react-bootstrap/ListGroup'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import axios from 'axios'
import { getError } from '../utils/getError'
import { toast } from 'react-toastify'
import { useLocation} from 'react-router'
import { Link } from 'react-router-dom'


function reducer(state, action){
    switch(action.type){
        case 'FETCH_REQUEST':
            return{...state, loading: true}
        case 'FETCH_SUCCESS':
            return{
                ...state, 
                sales: action.payload.sales, 
                page: action.payload.page,
                pages: action.payload.pages,
                loading: false
            }
        case 'FETCH_FAIL':
            return{...state, loading: false, error: action.payload}
        case 'INVOICE_REQUEST':
            return{...state, loading: true}
        case 'INVOICE_SUCCESS':
            return{...state, loading: false}
        case 'INVOICE_FAIL':
            return{...state, loading: false}
        default:
            return state
    }
}

export default function SaleHistoryScreen() {


    const [{sales, pages}, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        sales: []
    })

    const [searchCode, setSearchCode] = useState('')
    const [searchPhone, setSearchphone] = useState('')
    const [selectedSale, setSelectedSale] = useState()

    const {search} = useLocation()
    const sp = new URLSearchParams(search);
    const page = sp.get('page') || 1

    useEffect(()=> {
        const fetchData =async()=> {
            try{
                const {data} = await axios.get(`/api/multiple/list?page=${page}`)
                dispatch({type: 'FETCH_SUCCESS', payload: data})      
            }catch(error){
                dispatch({type: 'FETCH_FAIL', payload: error})
                toast.error(getError(error))
            }
        }
        fetchData()
    }, [page])

    
    function handleSearch(setState){
        return (event)=> {
            const setValue = event.target.value;
            setState(setValue)
        }
      }

  
    const filteredSale = sales.filter((x)=> x.InvoiceCode.toLowerCase().includes(searchCode.toLocaleLowerCase()))
    const filteredPhone = sales.filter((x)=> x.phone.toLowerCase().includes(searchPhone.toLocaleLowerCase()))
   
    //const filteredName = sales.filter((x)=> x.name.toLowerCase().includes(searchPrice.toLocaleLowerCase()))
    //const filteredPrice = searchPrice

    async function handleViewSale(saleId){
       try{
        const result = await axios.get(`/api/multiple/get-sale/${saleId}`)
        setSelectedSale(result.data)
       } catch(error){
        toast.error(getError(error))
       }
    }

  return (
    <Container fluid>

        <Row className='p-4'>
            <Col>
                <Form.Control
                    type="input"
                    placeholder="search by code"
                    onChange={handleSearch(setSearchCode)}
                />
                {searchCode === '' ? (
                     <div className='mt-2'>
                     <Alert variant='primary'>...Search By Invoice Number</Alert>
                  </div>
                   
                ) : (

                <ListGroup className='pt-2'>
                    {filteredSale.map((sale)=> (
                         <ListGroup.Item key={sale._id} className='d-flex justify-content-between'>
                         <Link to={`/edit-sale/${sale._id}`}>
                            {sale.InvoiceCode}
                         </Link>
                            Date: {sale.date}
                         <span>
                            <button onClick={()=>handleViewSale(sale._id)}>view</button>
                         </span>
                     </ListGroup.Item>
                    ))}
                </ListGroup>
                )}

            </Col>
            <Col>
                <Form.Control
                    type="input"
                    placeholder="search by phone"
                    onChange={handleSearch(setSearchphone)}
                />
                {searchPhone === '' ? (
                    <div variant='primary' className='mt-2'>
                        <Alert>...Search By Phone</Alert>
                    </div>
                    
                ):(
                    <ListGroup className='pt-2'>
                        {filteredPhone.map((sale)=>(
                            <ListGroup.Item key={sale._id} className='d-flex justify-content-between'>
                                code:
                                <Link to={`/edit-sale/${sale._id}`}>
                                    {sale.InvoiceCode}
                                </Link>
                                Tel: {sale.phone}
                            <span onClick={()=>handleViewSale(sale._id)} className="badge bg-dark p-2 m-2">
                                view
                             </span>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Col>
            <Col>
            <Card>
                <Card.Header className='d-flex align-items-center justify-content-between'>
                   <h4>
                   Sale Details
                   </h4>
                    {selectedSale && selectedSale.InvoiceCode ? (
                    <span className="badge bg-success p-2 m-2">
                        Processed successfully 
                    </span>
                    ): (
                        <Alert variant='danger'>Invoice Number Not Found</Alert>
                    )}
                </Card.Header>
                <Card.Body>
                    {selectedSale && (
                        <>
                        <Card.Text>
                            Code: {selectedSale.InvoiceCode}
                        </Card.Text>
                        <Card.Text>
                            prepapredBy: {selectedSale.preparedBy}
                        </Card.Text>
                        <Card.Text>
                            PaidBy: {selectedSale.paidBy}
                        </Card.Text>
                        <Card.Text>
                            Date: {selectedSale.date}
                        </Card.Text>
                        <Card.Text>
                            Service: {selectedSale.service}
                        </Card.Text>
                        <Card.Text>
                            Customer: {selectedSale.name}
                        </Card.Text>
                        <Card.Text>
                            Phone: {selectedSale.phone}
                        </Card.Text>
                        <Card.Text>
                            Subtotal: {selectedSale.subTotal}
                        </Card.Text>
                        <Card.Text>
                            Total: {selectedSale.total}
                        </Card.Text>
                    {selectedSale && selectedSale.saleItems.map((item)=>(
                        <Card key={item._id} className='mt-2'>
                        <Card.Title className='align-self-center'>{item.productName}</Card.Title>
                        <Card.Body>
                            <ListGroup>
                                <ListGroup.Item>
                                   price: {item.price}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                   quantity: {item.quantity}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  arrangement:  {item.arrangement}
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                        </Card>
                    ))}
                    </>
                    )}
                    </Card.Body>
                
            </Card>
            </Col>
        </Row>
      
    <div>
        {[...Array(pages).keys()].map((x)=>(
            <Link key={x+ 1} 
            to={`/api/multiple/list?page=${x + 1}`}
            className={x + 1 === Number(page) ? 'btn text-bold': 'btn'}
            >
            {x + 1}
            </Link>
        ))}
    </div>
    </Container>
  )
}
