import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Table, Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { getError } from '../utils/getError';
import { toast } from 'react-toastify';
import { FaEye } from 'react-icons/fa';
import { BsPencil, BsCheck2, BsXLg, BsBookmarkCheckFill } from 'react-icons/bs';
import Badge from 'react-bootstrap/esm/Badge';
import SaleDetailsModal from './SaleDetailsModal';
import { Store } from '../utils/Store';
import Calendar from 'react-calendar';
import XlsExportBtn from './XlsExportBtn';
import { useCallback } from 'react';
import debounce from 'lodash.debounce'

export default function QuerySalesData() {
  const { state } = useContext(Store);
  const { userInfoToken } = state;

  // State to store query parameters
  const [query, setQuery] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    foc: true
  });

  // State to store sales data
  const [sales, setSales] = useState(null);
  const [selectedSale, setSelectedSale] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState('')

  // State to store the total count of results
  const [totalCount, setTotalCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [focSales, setFocSales] = useState(0);
  const [paymentTotals, setPaymentTotals] = useState([])

  // State for editing
  const [editingSale, setEditingSale] = useState(null);
  const [paidBy, setPaidBy] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState(new Date());


  // Function to fetch sales data based on query parameters

  // Function to handle viewing sale details
  const handleViewSale = async (saleId) => {
    try {
      const result = await axios.get(`/api/sale/get-sale/${saleId}`);
      setSelectedSale(result.data);
      setShowModal(true);
    } catch (error) {
      toast.error(getError(error));
    }
  };

  // Function to handle editing sale
  const handleEdit = async (sale) => {
    if (!userInfoToken.isAdmin) {
      toast.error('YOUR ACCOUNT CAN\'T COMPLETE THIS ACTION')
      return
    }
    setEditingSale(sale);
  };

  const handleCancel = async () => {
    setEditingSale(null)
  }

  // Function to update sale details
  const updateSale = async () => {
    try {
      await axios.put(`/api/sale/edit/${editingSale._id}`, {
        time: date.toLocaleDateString(),
        service: service,
        paidBy: paidBy
      });
      toast.success('Done')
      console.log('Sale updated successfully');
    } catch (error) {
      console.error('Error updating sale:', error);
    }
    setEditingSale(null); // Reset editing state
  };

  useEffect(() => {


    const fetchSales = async () => {

      if(searchText){
        handleSearch(searchText)
      }

      if (query) {
        try {
          const { data } = await axios.get(`/api/sale/for?startDate=${query.startDate}&endDate=${query.endDate}&foc=${query.foc}`)
          setSales(data.sales)
          setTotalCount(data.totalCount)
          setTotalValue(data.totalValue);
          setFocSales(data.focSales);
          setPaymentTotals(data.paymentTotals)
        } catch (error) {
          toast.error(error)
          console.log(error)
        }
      }
    };
    fetchSales()


  }, [query.startDate, query.endDate, userInfoToken, editingSale, searchText]);


  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  const searchTotal = sales?.reduce((acc, curr)=> acc + curr.total, 0)
  const searchFoc = sales?.filter((sale)=> sale.free)?.reduce((acc, curr)=> acc + curr.total, 0)

  const handleSearch = useCallback(
    debounce(async(searchText)=>{
      const {data} = await axios.get(`/api/sale/search?searchText=${searchText}`)
      setSales(data)
    }, 300),
    []
  )

  const addSale = async(saleId)=>{
    const {data} = await axios.get(`/api/sale/get-sale/${saleId}`)
    if(data && data._id){
      localStorage.setItem('selectedSale', JSON.stringify(data))
      toast.success('successfully attached')
    }

  }

  return (
    <div>
      <div className="mb-3 d-flex flex-direction-row justify-content-between p-3">
        <div className='d-flex'>
          <Form.Group>
            <Form.Label>STARTING</Form.Label>
            <Form.Control type='date' value={query.startDate} onChange={(e) => setQuery(prev => ({ ...prev, startDate: e.target.value }))} />
          </Form.Group>
          <Form.Group className='mx-2'>
            <Form.Label>END</Form.Label>
            <Form.Control type='date' value={query.endDate} onChange={(e) => setQuery(prev => ({ ...prev, endDate: e.target.value }))} />
          </Form.Group>
          <Form.Group>
            <Form.Label>SEARCH SALE</Form.Label>
            <Form.Control type='text' 
              value={searchText} 
              placeholder='name, phone or invoice number'
              onChange={(e)=> setSearchText(e.target.value)}
              />
          </Form.Group>
        </div>
        <div>
          <XlsExportBtn data={sales} />
        </div>
      </div>
      <Row>
        <Col>
          {sales !== null ? (
            <div>
              <div className='d-flex justify-content-between m-2'>
                <Badge bg='danger' className='p-3'>Total Results: {totalCount || sales?.length}</Badge>
                <Badge bg='danger' className='p-3'>Total value: {round2(totalValue || searchTotal)}</Badge>
                <Badge bg='danger' className='p-3'>Vat value: {round2(sales?.reduce((acc, sale) => acc + sale.vat, 0))}</Badge>
                <Badge bg='danger' className='p-3'>F.O.C. {round2(focSales || searchFoc)}</Badge>
              </div>
              <Row>
                {paymentTotals && paymentTotals?.map((paymentMethod, index) => (
                  <Col key={index} className="m-3 border bg-primary text-light">
                    <Card.Title className='py-2'>
                      <strong>{paymentMethod.paymentMethod}</strong>
                    </Card.Title>
                    <p>{round2(paymentMethod.total)}</p>
                  </Col>
                ))
                }
              </Row>
              <Table bordered hover responsive>
                <thead>
                  <tr>
                    <th>INV Code</th>
                    <th>DATE</th>
                    <th>CUSTOMER</th>
                    <th>STATUS</th>
                    <th>SERVICE</th>
                    <th>PAID By</th>
                    <th>TOTAL</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {sales?.map((sale) => (
                    <tr key={sale._id}>
                      <td>
                        <Button onClick={() => handleViewSale(sale._id)} className='bg-primary border'>
                          <span className='px-1'>
                            <FaEye />
                          </span>
                          {sale.InvoiceCode}
                        </Button>
                      </td>
                      <td>
                        {editingSale && editingSale._id === sale._id ? (
                          <Calendar onChange={setDate} value={date} />
                        ) : (
                          sale.date
                        )}
                      </td>
                      <td>{sale.name}</td>
                      <td style={{ backgroundColor: sale.free ? 'greenyellow' : 'transparent' }}>{sale.free === true ? 'F.O.C' : 'PAID'}</td>
                      <td>
                        {editingSale && editingSale._id === sale._id ? (
                          <Form.Select onChange={(e) => setService(e.target.value)}>
                            <option>Select...</option>
                            <option>Delivery</option>
                            <option>Store Pick Up</option>
                            <option>website</option>
                            <option>insta-shop</option>
                            <option>Delivero</option>
                            <option>Careem</option>
                          </Form.Select>
                        ) : (
                          sale.service
                        )}
                      </td>
                      <td>
                        {editingSale && editingSale._id === sale._id ? (
                          <Form.Select onChange={(e) => setPaidBy(e.target.value)}>
                            <option>Select...</option>
                            <option>Card</option>
                            <option>Cash</option>
                            <option>TapLink</option>
                            <option>Bank Transfer</option>
                          </Form.Select>
                        ) : (
                          sale.paidBy
                        )}
                      </td>
                      <td>{sale.total}</td>
                      <td className='d-flex justify-content-around'>
                        {!editingSale || editingSale._id !== sale._id ? (
                          <BsPencil size={22} onClick={() => handleEdit(sale)} />
                        ) : (
                          <div className='d-flex p-1 justify-content-between'>
                            <BsCheck2 size={22} onClick={() => updateSale()} />
                            <BsXLg size={22} onClick={() => handleCancel()} />
                          </div>
                        )}
                        <BsBookmarkCheckFill size={22} onClick={()=> addSale(sale._id)}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <SaleDetailsModal show={showModal} onHide={() => setShowModal(false)} selectedSale={selectedSale} />
            </div>
          ) : (
            <Alert variant='warning'>No data</Alert>
          )}
        </Col>
      </Row>
    </div>
  );
}
