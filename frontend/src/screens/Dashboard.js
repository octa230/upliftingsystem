import { useState } from 'react'
import Graphs from '../components/Graphs'
import ProductsData from '../components/ProductsData'
import { Tabs, Tab } from 'react-bootstrap';



import InventoryScreen from '../components/Inventory'
import {
    BsPeopleFill, BsPieChartFill,
    BsFillCreditCardFill,
    BsGraphUpArrow,
    BsFillFileEarmarkBarGraphFill,
    BsCloudsFill, BsFillFolderSymlinkFill,
    BsFillInboxesFill
} from 'react-icons/bs'
import SaleTable from '../components/SaleTable'
import FilingScreen from '../components/FilingScreen'
import QuerySalesData from '../components/QuerySalesData'
import DailyReport from '../components/DailyReport'
import PurchaseScreen from '../components/PurchaseScreen'

export default function Dashboard() {
    const [content, setContent] = useState('inventory')
    return (
        <Tabs fill
            defaultActiveKey="inventory"
            id="dashboard-tabs"
            className="mb-3 p-3 bg-dark text-li"
            variant='pills'
            mountOnEnter
            onSelect={(eventKey) => setContent(eventKey)}
        >
            <Tab eventKey="inventory" title={
                <>
                    <BsFillFileEarmarkBarGraphFill /> Inventory
                </>
            }>
                {content === 'inventory' && <InventoryScreen />}
            </Tab>
            <Tab eventKey="make-sale" title={
                <>
                    <BsFillCreditCardFill /> Make Sale
                </>
            }>
                {content === 'make-sale' && <SaleTable />}
            </Tab>
            <Tab eventKey="mass-records" title={
                <>
                    <BsCloudsFill /> Mass Records
                </>
            }>
                {content === 'mass-records' && <FilingScreen />}
            </Tab>
            <Tab eventKey="sales" title={
                <>
                    <BsFillFolderSymlinkFill /> Sales Data
                </>
            }>
                {content === 'sales' && <QuerySalesData />}
            </Tab>
            <Tab eventKey="purchase" title={
                <>
                    <BsPeopleFill /> Purchase Data
                </>
            }>
                {content === 'purchase' && <PurchaseScreen />}
            </Tab>
            <Tab eventKey="products" title={
                <>
                    <BsFillInboxesFill /> Transactions
                </>
            }>
                {content === 'products' && <ProductsData />}
            </Tab>

            <Tab eventKey="graphs" title={
                <>
                    <BsGraphUpArrow /> Graphs
                </>
            }>
                {content === 'graphs' && <Graphs />}
            </Tab>
            <Tab eventKey="reports" title={
                <>
                    <BsPieChartFill /> Daily Report
                </>
            }>
                {content === 'reports' && <DailyReport />}
            </Tab>
        </Tabs>
    )
}
