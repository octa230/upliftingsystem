import React, { useState } from 'react'
import Row from 'react-bootstrap/esm/Row'
import Col from 'react-bootstrap/esm/Col'
import Nav from 'react-bootstrap/esm/Nav'
import Graphs from '../components/Graphs'
import Charts from '../components/Charts'
import CustomerData from '../components/CustomerData'
import ProductsData from '../components/ProductsData'
import SalesData from '../components/SalesData'
import StockRecords from '../components/StockRecords'
import { newDate } from '../utils/Date'


export default function StatScreen() {
    const [content, setContent] = useState('dashboard')

    const handleSideBarClick = (content)=>(e)=>{
        e.preventDefault()
        setContent(content)
    }
  return (
    <Row>
        <h3>{newDate()}</h3>
        <Col sm={2} className='dashboard-nav'>
            <Nav justify-variant='tabs'  className='d-flex flex-column'>
                <Nav.Item onClick={handleSideBarClick('stockrecords')}>
                    <Nav.Link>Stock Records</Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('customers')}>
                    <Nav.Link>Customer Data</Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('products')}>
                    <Nav.Link>Product Data</Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('sales')}>
                    <Nav.Link>Sales Data</Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('graphs')}>
                    <Nav.Link>Graphs</Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('charts')}>
                    <Nav.Link>Charts</Nav.Link>
                </Nav.Item>
            </Nav>

        </Col>  
        <Col sm={8}>
                {content === 'sales' && <SalesData/>}
                {content === 'customers' && <CustomerData/>}
                {content === 'products' && <ProductsData/>}
                {content === 'stockrecords' && <StockRecords />}
                {content === 'graphs' && <Graphs />}
                {content === 'charts' && <Charts />}
        </Col>
    </Row>
  )
}
