import { useContext, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css';
import { Button, Container, Badge, Nav, Navbar} from 'react-bootstrap'
import { Store } from './utils/Store'
import Register from './screens/Register'
import Settings from './components/Settings';
import {
    LuAlarmClock,
    LuBookLock,
    LuClipboardCopy,
    LuAppWindow,
    LuClock7,
    LuBookPlus,
    LuCalendarCheck,
    LuLineChart,
    LuCalculator,
    LuImage,
    LuPower,
    LuComponent,
    LuFile,
    LuUmbrella,
} from "react-icons/lu";
import InventoryScreen from './screens/Inventory';
import SaleTable from './components/SaleTable';
import FilingScreen from './screens/FilingScreen';
import QuerySalesData from './screens/QuerySalesData';
import Expenses from './screens/Expenses';
import PurchaseScreen from './screens/PurchaseScreen'
import ProductsData from './screens/ProductsData'
import Graphs from './screens/Graphs'
import GalleryScreen from './screens/GalleryScreen';
import DailyReport from './screens/DailyReport';
import Default from './screens/Default';
import { toast, ToastContainer } from 'react-toastify';
import LoginScreen from './screens/LoginScreen';
import axios from 'axios';
import Customers from './screens/Customers';


export default function App() {
    const [activeTab, setActiveTab] = useState('stock-screen')


    const { state, dispatch: ctxDispatch } = useContext(Store)
    const { userInfoToken, selectedItems } = state

    const signoutHandler = () => {
        if (window.confirm('Sign out Session')) {
            ctxDispatch({ type: 'SIGN_OUT' })
            localStorage.removeItem('userInfoToken');
        }
    }

    const getLetterHead = async () => {
        toast.promise(
            axios.get(`/api/letter-head`, { responseType: "blob", headers: { 'Accept': 'application/pdf' } })
                .then((response) => {
                    const blob = new Blob([response.data], { type: "application/pdf" })
                    const url = window.URL.createObjectURL(blob)
                    window.open(url, '_blank')
                }),
            {
                pending: "...wait",
                success: '...success',
                error: "...Oops try again"
            }
        )
    }

    function renderContent() {
        switch (activeTab) {
            case 'stock-screen':
                return <InventoryScreen />;
            case 'sale-screen':
                return <SaleTable />;
            case 'record-screen':
                return <FilingScreen />;
            case 'sales-data':
                return <QuerySalesData />;
            case 'customers':
                return <Customers />;
            case 'purchase-data':
                return <PurchaseScreen />;
            case 'txns-screen':
                return <ProductsData />;
            case 'graphs-screen':
                return <Graphs />;
            case 'expenses-screen':
                return <Expenses />;
            case 'gallery-screen':
                return <GalleryScreen />;
            case 'reports-screen':
                return <DailyReport />;
            default:
                return <Default />;
        }
    }
    return !userInfoToken ? <LoginScreen /> : (
        <div>
            <ToastContainer position="bottom-center" limit={1} />
            <Navbar data-bs-theme="dark" bg='light'>
                <Container fluid className='px-2 w-full'>
                    <Nav
                        fill
                        variant='pills'
                        defaultActiveKey="stock-screen"
                        onSelect={(selectedKey) => {
                            setActiveTab(selectedKey)
                        }}
                        style={{ width: '100%' }}
                    >
                        <Nav.Item style={{alignSelf:"center"}}>
                            <LuComponent
                                onClick={() => setActiveTab(null)}
                                size={33}
                                color='red'
                            />
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="stock-screen">
                                <LuBookLock style={{ marginRight: '4px' }} size={33} />
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="sale-screen">
                                <LuAppWindow style={{ marginRight: '4px' }} size={33} />
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="customers">
                                <LuUmbrella style={{ marginRight: '4px' }} size={33} />
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item className='position-relative'>
                            <Nav.Link eventKey="record-screen">
                                <LuClipboardCopy style={{ marginRight: '4px' }} size={33} />
                                <Badge pill bg='danger' style={{ position: "absolute", top: -3 }}>
                                    {selectedItems?.length}
                                </Badge>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="sales-data">
                                <LuClock7 style={{ marginRight: '4px' }} size={33} />
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="purchase-data">
                                <LuBookPlus style={{ marginRight: '4px' }} size={33} />
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="txns-screen">
                                <LuCalendarCheck style={{ marginRight: '4px' }} size={33} />
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="graphs-screen">
                                <LuLineChart style={{ marginRight: '4px' }} size={33} />
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="expenses-screen">
                                <LuCalculator style={{ marginRight: '4px' }} size={33} />
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="gallery-screen">
                                <LuImage style={{ marginRight: '4px' }} size={33} />
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="reports-screen">
                                <LuAlarmClock style={{ marginRight: '4px' }} size={33} />
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item className='gap-3 d-flex justify-content-between border rounded p-1 border-success'>
                            <Register />
                            <Settings />
                            <Button variant='outline-danger' onClick={getLetterHead}>
                                <LuFile size={22} />
                            </Button>
                            <Button variant='danger' onClick={signoutHandler}>
                                <LuPower size={22} />
                            </Button>
                        </Nav.Item>
                    </Nav>
                </Container>
            </Navbar>
            {renderContent()}
        </div>
    )
}
