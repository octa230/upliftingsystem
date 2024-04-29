import React, { useState } from 'react'
import Row from 'react-bootstrap/esm/Row'
import Col from 'react-bootstrap/esm/Col'
import Nav from 'react-bootstrap/esm/Nav'
import AddProduct from '../components/AddProduct'
import RegisterUser from '../components/RegisterUser'
import SaleHistory from '../components/SaleHistory'
import Graphs from '../components/Graphs'
import Charts from '../components/Charts'
import CustomerData from '../components/CustomerData'
import ProductsData from '../components/ProductsData'
import StockRecords from '../components/StockRecords'

import InventoryScreen from '../components/Inventory'
import {
    BsPeopleFill, BsPieChartFill,
    BsFillCreditCardFill, 
    BsFillDatabaseFill, BsGraphUpArrow,
    BsFillDeviceHddFill, 
    BsFillFileEarmarkBarGraphFill, BsFillPersonPlusFill,
    BsCloudsFill,BsFillFolderSymlinkFill,
    BsBuildingLock, BsFillInboxesFill 
} from 'react-icons/bs'
import { newDate } from '../utils/Date'
import SaleTable from '../components/SaleTable'
import FilingScreen from '../components/FilingScreen'
import QuerySalesData from '../components/QuerySalesData'

export default function Dashboard() {
    const [content, setContent] = useState('make-sale')

    const handleSideBarClick = (content)=>(e)=>{
        e.preventDefault()
        setContent(content)
    }
  return (
    <Row className='mt-2'>
        <Col sm={2} md={2}>
            <Nav justify-variant='tabs' className='dashboard-nav'>
              <h3>{newDate()}</h3>
                <Nav.Item onClick={handleSideBarClick('inventory')}>
                    <Nav.Link className='nav-link'>
                      <span><BsFillFileEarmarkBarGraphFill/></span> See Inventory
                    </Nav.Link>
                </Nav.Item>
            <Nav.Item onClick={handleSideBarClick('records')}>
                    <Nav.Link className='nav-link'>
                      <span><BsFillDeviceHddFill/></span> Sales History
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('new-product')}>
                    <Nav.Link className='nav-link'>
                    <span><BsFillDatabaseFill/></span>    Add product
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('make-sale')}>
                    <Nav.Link className='nav-link'>
                      <span><BsFillCreditCardFill/></span>  Make Sale
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('mass-records')}>
                    <Nav.Link className='nav-link'>
                      <span><BsCloudsFill/></span>  Mass Records
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('new-user')}>
                    <Nav.Link className='nav-link'>
                       <span><BsFillPersonPlusFill/></span> New User
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('stockrecords')}>
                    <Nav.Link className='nav-link'>
                      <span><BsBuildingLock/></span> Stock Records
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('customers')}>
                    <Nav.Link className='nav-link'>
                      <span><BsPeopleFill/></span> Customer Data
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('products')}>
                    <Nav.Link className='nav-link'>
                      <span><BsFillInboxesFill /></span> Product Data
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('sales')}>
                    <Nav.Link className='nav-link'>
                      <span><BsFillFolderSymlinkFill/></span> Sales Data
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('graphs')}>
                    <Nav.Link className='nav-link'>
                      <span><BsGraphUpArrow/></span> Graphs
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('charts')}>
                    <Nav.Link className='nav-link'>
                      <span><BsPieChartFill/></span> Charts
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </Col>  
        <Col className='dashboard-display'>
          {content === 'make-sale' && <SaleTable/>}
          {content === 'new-product' && <AddProduct/>}
          {content === 'mass-records' && <FilingScreen/>}
          {content === 'new-user' && <RegisterUser/>}
          {content === 'records' && <SaleHistory />} 
          {content === 'inventory' && <InventoryScreen/>}
          {content === 'sales' && <QuerySalesData/>}
          {content === 'customers' && <CustomerData/>}
          {content === 'products' && <ProductsData/>}
          {content === 'stockrecords' && <StockRecords />}
          {content === 'graphs' && <Graphs />}
          {content === 'charts' && <Charts />}
        </Col>
    </Row>
  )
}
