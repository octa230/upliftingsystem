import React, {useEffect, useReducer, useState} from 'react'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import ListGroup from 'react-bootstrap/ListGroup'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import axios from 'axios'
import { getError } from '../utils/getError'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import Table from 'react-bootstrap/esm/Table'
import Button from 'react-bootstrap/esm/Button'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import Invoice from '../utils/Invoice'
import { FaEye, FaPenAlt, FaPrint } from 'react-icons/fa'



function reducer(state, action){
    switch(action.type){
        case 'FETCH_REQUEST':
            return{...state, loading: false}
        case 'FETCH_SUCCESS':
            return{
                ...state, 
                sales: action.payload, 
                loading: false
            }
        case 'FETCH_FAIL':
            return{...state, loading: false, error: action.payload}
        default:
            return state
    }
}

export default function SaleHistory() {

    
    const [{sales}, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        sales: []
    })

    const [searchCode, setSearchCode] = useState('')
    const [searchPhone, setSearchphone] = useState('')
    const [selectedSale, setSelectedSale] = useState()
    const [printSale, setPrintSale] = useState(null)
    const [showPDF, setshowPDF] = useState(false)

    useEffect(()=> {
        const fetchData =async()=> {
            dispatch({type: 'FETCH_REQUEST'})
            try{
                const {data} = await axios.get(`/api/multiple/list`)
                dispatch({type: 'FETCH_SUCCESS', payload: data}) 
            }catch(error){
                dispatch({type: 'FETCH_FAIL', payload: error})
                toast.error(getError(error))
            }
        }
        fetchData()
    },[])

    
    const handleSearch =(setState)=> {
        return (event)=> {
            const setValue = event.target.value;
            setState(setValue)
        }
      }

  
    const filteredSale = sales?.filter((x)=> x.InvoiceCode.toLowerCase().includes(searchCode.toLocaleLowerCase()))
    const filteredPhone = sales?.filter((x)=> x.phone.toLowerCase().includes(searchPhone.toLocaleLowerCase()))
   
    //const filteredName = sales.filter((x)=> x.name.toLowerCase().includes(searchPrice.toLocaleLowerCase()))
    //const filteredPrice = searchPrice

    const handleViewSale = async (saleId)=> {
       try{
        const result = await axios.get(`/api/multiple/get-sale/${saleId}`)
        setSelectedSale(result.data)
       } catch(error){
        toast.error(getError(error))
       }
    }

    const openPDFVeiwer = async(s)=> {
        const result = await axios.get(`/api/multiple/get-sale/${s}`)
        const fetchdData = result.data
        console.log(result.data)
        console.log(fetchdData)
        setPrintSale(fetchdData)
        setshowPDF(true) 
        console.log(printSale)
    }

  return (

        <Row className='p-2'>
            <h2 className='text-success'>Last {sales.length} Sales</h2>
            <Col>
            <Table style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sales && sales.map((sale)=> (
                        <tr key={sale._id}>
                            <td>
                                
                                <Button onClick={()=>handleViewSale(sale._id)} className='bg-primary border'>
                                <span className='px-1'>
                                    <FaEye/>
                                </span>
                                {sale.InvoiceCode}
                                </Button>
                            </td>
                            <td>{sale.date}</td>
                            <td>{sale.total}</td>
                            <td className='d-flex'>
                                <Col>
                                <Button variant='secondary' onClick={()=> openPDFVeiwer(sale._id)}>
                                    <FaPrint/>
                                </Button>
                                </Col>
                               
                                <Col >
                                    <Button variant='warning'>
                                    <Link to={`/edit-sale/${sale._id}`}>
                                        <FaPenAlt/>
                                    </Link>
                                    </Button>
                                </Col>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            </Col>
            <Col>
            <Card style={{ maxHeight: '500px', overflowY: 'auto' }}>
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
                                <ListGroup.Item style={{maxWidth: '255px'}}>
                                    {item.photo && (<img src={item.photo} className='img-thumbnail' alt='product'/>)}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  {selectedSale.units.map((unit, index)=> (
                                    <Card key={index} className='mb-2 p-1'>
                                        <Card.Header>{unit.arrangement}</Card.Header>
                                        <Card.Img src={unit.photo} className='img-thumbnail'/>
                                        <ul>
                                        {unit.products.map((x, index)=>(
                                            <li key={index}>
                                                {x.quantity}
                                            </li>

                                        ))}
                                  </ul>
                                    </Card>
                                  ))}
                                  
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

            <div style={{maxWidth:'50%'}}>
            <div>
            {showPDF && printSale &&(
                <PDFViewer width="100%" height="600">
                    <Invoice sale={printSale}/>
                </PDFViewer>
                )}
                </div>
                {printSale && (
                <PDFDownloadLink document={<Invoice sale={printSale} />} fileName={`Invoice_${printSale.InvoiceCode}.pdf`}>
                {({ blob, url, loading, error }) =>
                  loading ? 'Loading document...' : <Button onClick={() => openPDFVeiwer(printSale._id)}>Download</Button>
                }
              </PDFDownloadLink>
            )}
            </div>
            <h5>Search Sales Database</h5>
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
                    {filteredSale?.map((sale)=> (
                         <ListGroup.Item key={sale._id} className='d-flex justify-content-between'>
                         <Link to={`/edit-sale/${sale._id}`}>
                            {sale.InvoiceCode}
                         </Link>
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
        </Row>
  )
}
