import React, {useContext, useEffect, useState} from 'react'
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
import { FaEye } from 'react-icons/fa'
import SaleDetailsModal from './SaleDetailsModal'
import { BsPaperclip } from 'react-icons/bs'
import { Store } from '../utils/Store'
import MessageBox from './MessageBox'




export default function SaleHistory() {

    const {state} = useContext(Store)
    const {todaySales, dispatch: ctxDispatch} = state
    

    const [searchCode, setSearchCode] = useState('')
    const [searchPhone, setSearchphone] = useState('')
    const [selectedSale, setSelectedSale] = useState({})
    const [showModal, setShowModal] = useState(false)
    
    
    const addSale = async(saleId)=>{
        const data = await axios.get(`/api/multiple/get-sale/${saleId}`)
        setSelectedSale(data)
        localStorage.setItem('selectedSale', JSON.stringify(selectedSale))
        toast.success('sale attched successfully')
    }
  
   
    const handleViewSale = async (saleId)=> {
       try{
        const result = await axios.get(`/api/multiple/get-sale/${saleId}`)
        setSelectedSale(result.data)
        setShowModal(true)
       } catch(error){
        toast.error(getError(error))
       }
    }

    useEffect(()=>{

    }, [todaySales])


  return (

        <Row className='p-2'>
            <h2 className='text-success'>{todaySales.length} Sales </h2>
            <Col>
            {todaySales && todaySales ? (
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
                    {todaySales && todaySales.map((sale)=> (
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
                                <Col >
                                    <Button variant='warning' onClick={()=> addSale(sale._id)}>
                                    <BsPaperclip/>
                                    </Button>
                                </Col>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            ) : (
                <MessageBox>NO SALES TODAY</MessageBox>
            )}

             <SaleDetailsModal show={showModal} onHide={()=>setShowModal(false)} selectedSale={selectedSale}/>
            </Col>
            <h5>Search Sales Database</h5>
{/*             <Col>
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
            </Col> */}
        </Row>
  )
}
