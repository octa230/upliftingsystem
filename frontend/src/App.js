import LoginScreen from "./screens/LoginScreen";
import SaleScreen from "./screens/SaleScreen";
import 'react-toastify/dist/ReactToastify.css';
import RegisterUser from "./screens/RegisterUser";
import ProtectedRoute from "./components/ProtectedRoutes";
import InventoryScreen from "./screens/InventoryScreen";
import ProductEdit from "./screens/ProductEdit";
import SalesHistory from "./screens/SalesHistory";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import Nav from "react-bootstrap/Nav";
import Navbar from 'react-bootstrap/Navbar'
import RetailScreen from "./screens/RetailScreen";
import {BsBoxArrowRight, BsFillDatabaseFill, BsFillClipboard2DataFill, BsFillPersonPlusFill, BsGrid1X2Fill} from 'react-icons/bs'
import { useContext } from "react";
import { Store } from "./utils/Store";
import EditSaleDetails from "./screens/EditSaleDetails";
import SaleHistoryScreen from "./screens/SaleHistoryScreen"
import PrintStock from "./screens/PrintStock";


function App() {

  const {state, dispatch: ctxDispatch} = useContext(Store);
  const {userInfoToken } = state;
  
  
  function signoutHandler(){

    ctxDispatch({type: 'SIGN_OUT'})
    localStorage.removeItem('userInfoToken');
    window.location.href = '/'
  }
  return (
  <BrowserRouter>
  <Navbar expand='lg' bg="dark" variant="dark" color="black" className="p-4" > 
      <Navbar.Brand href="/">
        <span className="border p-2">Active as: {userInfoToken? userInfoToken.name: 'Home'}</span>
      </Navbar.Brand>
        <Navbar.Toggle aria-controls="nav-bar-basic"/>
        <Navbar.Collapse id="nav-bar-basic">
        <Nav className="m-auto justify-content-center fs-5">
          <Nav.Link href="/dashboard">
            <span className="p-3 mb-2">
              <BsGrid1X2Fill/>
            </span>
            Dashboard
          </Nav.Link>
          <Nav.Link href="/inventory">
            <span className="p-3">
              <BsFillDatabaseFill />
            </span>
            Inventory
            </Nav.Link>
          <Nav.Link href="/register">
            <span className="p-3 mb-2">
              <BsFillPersonPlusFill/>
            </span>
            New User
          </Nav.Link>
          <Nav.Link href="/sale-history-sale">
            <span className="p-3 mb-2">
              <BsFillClipboard2DataFill/>
            </span>
            History
          </Nav.Link>
        </Nav>
        
        <div className="d-flex align-items-end">
          <Nav>
            <Nav.Link>
              <span className="p-lg-3" onClick={signoutHandler}>Log out</span>
              <BsBoxArrowRight />
            </Nav.Link>
          </Nav>
        </div>
      </Navbar.Collapse>
    </Navbar>

    <ToastContainer position="bottom-center" limit={2} />
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route path="/dashboard" element ={
      <ProtectedRoute>
        <SaleScreen />
      </ProtectedRoute>}/>
      <Route path="/inventory" element ={
        <ProtectedRoute>
          <InventoryScreen />
        </ProtectedRoute>
      } /> 
      <Route path="/register" element = {
        <ProtectedRoute>
          <RegisterUser />
        </ProtectedRoute>
      } />
      <Route path="/api/product/update/:id" element={
        <ProtectedRoute>
          <ProductEdit />
        </ProtectedRoute>
      }/>
      <Route path="/retail" element={
        <ProtectedRoute>
          <RetailScreen />
        </ProtectedRoute>
      }/>
      <Route path="/sales" element={
        <ProtectedRoute>
          <SalesHistory/>
        </ProtectedRoute>
      }/>
      <Route path="/sale-history-sale" element={
        <ProtectedRoute>
          <SaleHistoryScreen/>
        </ProtectedRoute>
      }/>
      <Route path="/edit-sale/:id" element={
        <ProtectedRoute>
          <EditSaleDetails />
        </ProtectedRoute>
      }
      />
      <Route path="print-inventory" element={
        <ProtectedRoute>
          <PrintStock />
        </ProtectedRoute>
      }
      />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
