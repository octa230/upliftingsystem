import React, { useState } from 'react'
import Row from 'react-bootstrap/esm/Row'
import Col from 'react-bootstrap/esm/Col'
import Nav from 'react-bootstrap/esm/Nav'
import AddProduct from '../components/AddProduct'
import RegisterUser from '../components/RegisterUser'
import SaleScreen from '../components/SaleScreen'
import SaleHistory from '../components/SaleHistory'
import InventoryScreen from '../components/Inventory'
import RecordStock from '../components/RecordStock'
import {
    BsFillCreditCardFill, 
    BsFillDatabaseFill, 
    BsFillDeviceHddFill, BsFillTagFill,
    BsFillFileEarmarkBarGraphFill, BsFillPersonPlusFill, BsCalculatorFill, BsTrash3Fill
} from 'react-icons/bs'
import RecordDamages from '../components/RecordDamages'
import { newDate } from '../utils/Date'
import SaleTable from '../components/SaleTable'

export default function Dashboard() {
    const [content, setContent] = useState('dashboard')

    const handleSideBarClick = (content)=>(e)=>{
        e.preventDefault()
        setContent(content)
    }
  return (
    <Row className='mt-2'>
      <h3>{newDate()}</h3>
        <Col sm={2} gap={2} className='dashboard-nav'>
            <Nav justify-variant='tabs'  className='d-flex flex-column'>
            <Nav.Item onClick={handleSideBarClick('stock')}>
                    <Nav.Link className='nav-link'>
                      <span><BsCalculatorFill/></span>  New Purchase
                    </Nav.Link>
                </Nav.Item>
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
                <Nav.Item onClick={handleSideBarClick('wasted')}>
                    <Nav.Link className='nav-link'>
                      <span><BsTrash3Fill/></span>  Add Waste
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item onClick={handleSideBarClick('make-sale')}>
                    <Nav.Link className='nav-link'>
                      <span><BsFillCreditCardFill/></span>  Make Sale
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

            </Nav>

        </Col>  
        <Col sm={8} className='dashboard-display'>
                {content === 'make-sale' && <SaleTable/>}
                {content === 'new-product' && <AddProduct/>}
                {content === 'retail' && <SaleScreen/>}
                {content === 'new-user' && <RegisterUser/>}
                {content === 'records' && <SaleHistory />} 
                {content === 'inventory' && <InventoryScreen/>}
                {content === 'stock' && <RecordStock/>}
                {content === 'wasted' && <RecordDamages/>}
        </Col>
    </Row>
  )
}
