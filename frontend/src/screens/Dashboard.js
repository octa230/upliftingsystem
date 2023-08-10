import React, { useState } from 'react'
import Row from 'react-bootstrap/esm/Row'
import Col from 'react-bootstrap/esm/Col'
import Nav from 'react-bootstrap/esm/Nav'
import ProductTable from '../components/TestTable'
import AddProduct from '../components/AddProduct'
import RegisterUser from '../components/RegisterUser'
import SaleScreen from '../components/SaleScreen'
import SaleHistory from '../components/SaleHistory'
import InventoryScreen from '../components/Inventory'
import {
    BsFillCreditCardFill, 
    BsFillDatabaseFill, 
    BsFillDeviceHddFill, BsFillTagFill,
    BsFillFileEarmarkBarGraphFill, BsFillPersonPlusFill
} from 'react-icons/bs'

export default function Dashboard() {
    const [content, setContent] = useState('dashboard')

    const handleSideBarClick = (content)=>(e)=>{
        e.preventDefault()
        setContent(content)
    }
  return (
    <Row className='mt-2'>
        <Col sm={2} className='dashboard-nav'>
            <Nav justify-variant='tabs'  className='d-flex flex-column'>
                <Nav.Item onClick={handleSideBarClick('make-sale')}>
                    <Nav.Link className='nav-link'>
                      <span><BsFillCreditCardFill/></span>  Make Sale
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('new-product')}>
                    <Nav.Link className='nav-link'>
                    <span><BsFillDatabaseFill/></span>    Add product
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('retail')}>
                    <Nav.Link className='nav-link'>
                      <span><BsFillTagFill/></span>  Sale retail
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('new-user')}>
                    <Nav.Link className='nav-link'>
                       <span><BsFillPersonPlusFill/></span> New User
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('records')}>
                    <Nav.Link className='nav-link'>
                      <span><BsFillDeviceHddFill/></span>  History
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('inventory')}>
                    <Nav.Link className='nav-link'>
                      <span><BsFillFileEarmarkBarGraphFill/></span>  Inventory
                    </Nav.Link>
                </Nav.Item>
            </Nav>

        </Col>  
        <Col sm={8} className='dashboard-display'>
                {content === 'make-sale' && <ProductTable/>}
                {content === 'new-product' && <AddProduct/>}
                {content === 'retail' && <SaleScreen/>}
                {content === 'new-user' && <RegisterUser/>}
                {content === 'records' && <SaleHistory />}
                {content === 'inventory' && <InventoryScreen/>}
        </Col>
    </Row>
  )
}
