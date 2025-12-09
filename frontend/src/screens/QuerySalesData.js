import { useState, useEffect, useContext } from 'react';
import { Row, Col, Table, Form, Button, Alert, Card, Modal, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { getError } from '../utils/getError';
import { toast } from 'react-toastify';
import { BsXLg, BsDashCircleFill } from 'react-icons/bs';
import SaleDetailsModal from '../components/SaleDetailsModal';
import { Store } from '../utils/Store';
import XlsExportBtn from '../components/XlsExportBtn';
import { useCallback } from 'react';
import debounce from 'lodash.debounce'
import { LuCheckCircle2, LuPenLine, LuPlusCircle, LuPrinter } from 'react-icons/lu';

export default function QuerySalesData() {
  const { state } = useContext(Store);
  const { userInfoToken } = state;

  // State to store query parameters
  const [query, setQuery] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    //foc: true
  });

  // State to store sales data
  const [sales, setSales] = useState(null);
  const [selectedSale, setSelectedSale] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [searchText, setSearchText] = useState('')

  // State to store the total count of results
  const [totalCount, setTotalCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [focSales, setFocSales] = useState(0);
  const [paymentTotals, setPaymentTotals] = useState([])

  // State for editing
  const [editingSale, setEditingSale] = useState(null);


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

  const handlePrint = async (saleId) => {
    if (window.confirm('print Invoice?')) {
      toast.promise(
        axios.post(`/api/sale/print-sale/${saleId}`, {},
          {
            responseType: "blob",
            headers: { 'Accept': 'application/pdf' }
          }
        ).then((response) => {
          const blob = new Blob([response.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob)
          window.open(url, '_blank')
        }),
        {
          pending: "...please wait",
          success: "...done!",
          error: "Oops! try again"
        }
      )
    }
  }

  // Function to handle editing sale
  const handleEdit = async (sale) => {
    if (userInfoToken.isAdmin) {
      toast.error('YOUR ACCOUNT CAN\'T COMPLETE THIS ACTION')
      return
    }
    setEditingSale({
      ...sale,
    });
  };

  const handleChangeStatus = async (str) => {
    setEditingSale(null)
    const { data } = await axios.patch(`/api/sale/status/${selectedSale._id}`, {
      status: str
    })
    setSales((prev) => prev.map((sale) => sale._id === data._id ? data : sale))
    setStatusModal(false)
  }

  // Function to update sale details
  const updateSale = async () => {
    try {
      const { data } = await axios.put(`/api/sale/edit/${editingSale._id}`, {
        date: editingSale?.date,
        service: editingSale?.service,
        paidBy: editingSale?.paidBy
      });
      if (data) {
        toast.success('Done')
        setSales(prevSales =>
          prevSales.map(sale =>
            sale._id === data._id ? { ...sale, ...data } : sale
          )
        );

      }
      console.log('Sale updated successfully');
    } catch (error) {
      console.error('Error updating sale:', error);
    } finally {
      setEditingSale(null); // Reset editing state
    }
  };

  useEffect(() => {


    const fetchSales = async () => {

      if (searchText) {
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


  }, [query.startDate, query.endDate, userInfoToken, editingSale?._id, searchText]);


  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  const searchTotal = sales?.reduce((acc, curr) => acc + curr.total, 0)
  const searchFoc = sales?.filter((sale) => sale.free)?.reduce((acc, curr) => acc + curr.total, 0)

  const handleSearch = useCallback(
    debounce(async (searchText) => {
      const { data } = await axios.get(`/api/sale/search?searchText=${searchText}`)
      setSales(data)
    }, 300),
    []
  )

  const addSale = async (saleId) => {
    const { data } = await axios.get(`/api/sale/get-sale/${saleId}`)
    if (data && data._id) {
      localStorage.setItem('selectedSale', JSON.stringify(data))
      toast.success('successfully attached')
    }

  }

  const cancelSale = async ({ _id }) => {
    setSelectedSale({ _id })
    setStatusModal(true)
  }


  const statusColors = {
    cancelled: "tomato",
    pending: "orange",
    completed: "white",
  };


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
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Form.Group>
        </div>
        <div>
          <XlsExportBtn data={sales} />
          <Button className='mx-3'>PDF</Button>
        </div>
      </div>
      <Row>
        <Col>
          {sales !== null ? (
            <div>
              <div className="row g-2">
                {/* Left side */}
                <div className="col-md-6">
                  <div className="row g-2">
                    <div className="col-6">
                      <Card className="p-4 text-center h-100">
                        <Card.Title>Total Results</Card.Title>
                        <h4 className="fw-bold text-dark">{totalCount || sales?.length}</h4>
                      </Card>
                    </div>
                    <div className="col-6">
                      <Card className="p-4 text-center h-100">
                        <Card.Title>Total Value</Card.Title>
                        <h4 className="fw-bold text-success">{round2(totalValue || searchTotal)}</h4>
                      </Card>
                    </div>
                    <div className="col-6">
                      <Card className="p-4 text-center h-100">
                        <Card.Title>VAT Value</Card.Title>
                        <h4 className="fw-bold text-primary">
                          {round2(sales?.reduce((acc, sale) => acc + sale.vat, 0))}
                        </h4>
                      </Card>
                    </div>
                    <div className="col-6">
                      <Card className="p-4 text-center h-100">
                        <Card.Title>F.O.C.</Card.Title>
                        <h4 className="fw-bold text-danger">{round2(focSales || searchFoc)}</h4>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="col-md-6">
                  <div className="row g-2">
                    {paymentTotals &&
                      paymentTotals.slice(0, 4).map((paymentMethod, index) => (
                        <div key={index} className="col-6">
                          <Card className="p-4 text-center h-100">
                            <Card.Title>{paymentMethod.paymentMethod}</Card.Title>
                            <h4 className="fw-bold text-secondary">
                              {round2(paymentMethod.total)}
                            </h4>
                          </Card>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <Table bordered striped hover size='sm' responsive className='mt-3'>
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
                    <tr key={sale._id} style={{ background: statusColors[sale?.status] || 'white' }}>
                      <td>
                        <Button onClick={() => handleViewSale(sale._id)} className='bg-primary border-none btn-sm'>
                          {sale.InvoiceCode}
                        </Button>
                      </td>
                      <td>
                        {editingSale && editingSale._id === sale._id ? (
                          <Form.Control
                            type='date'
                            onChange={(e) => {
                              setEditingSale(({ ...editingSale, date: e.target.value }));
                            }}
                            value={editingSale?.date ? editingSale.date.split('T')[0] : ''}
                          />
                        ) : (
                          new Date(sale.date).toLocaleDateString()
                        )}
                      </td>
                      <td>{sale.name}</td>
                      <td style={{ backgroundColor: sale.free ? '#FF9999' : 'transparent' }}>
                        {sale.free === true ? 'F.O.C' : 'PAID'}
                      </td>
                      <td>
                        {editingSale && editingSale._id === sale._id ? (
                          <Form.Select
                            onChange={(e) => {
                              setEditingSale(({ ...editingSale, service: e.target.value }));
                            }}
                            value={editingSale?.service || ''}
                          >
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
                          <Form.Select
                            onChange={(e) => {
                              setEditingSale(({ ...editingSale, paidBy: e.target.value }));
                            }}
                            value={editingSale?.paidBy || ''}
                          >
                            <option>Select...</option>
                            <option>Card</option>
                            <option>Cash</option>
                            <option>Credit</option>
                            <option>TapLink</option>
                            <option>Bank Transfer</option>
                            <option>F.O.C</option>
                          </Form.Select>
                        ) : (
                          sale.paidBy
                        )}
                      </td>
                      <td>{sale.total}</td>
                      <td className='d-flex gap-3 justify-content-center'>
                        {!editingSale || editingSale._id !== sale._id ? (
                          <LuPenLine size={22} onClick={() => handleEdit(sale)} />
                        ) : (
                          <div className='d-flex gap-3 justify-items-between'>
                            <LuCheckCircle2 size={22} onClick={() => updateSale()} />
                            <BsXLg size={22} onClick={() => setEditingSale(null)} /> {/* Cancel Editing */}
                          </div>
                        )}
                        <LuPlusCircle size={22} onClick={() => addSale(sale._id)} />
                        <LuPrinter size={22} onClick={() => handlePrint(sale._id)} />
                        <BsDashCircleFill size={22} onClick={() => cancelSale(sale)} color='red' />
                      </td>
                    </tr>
                  ))}
                  {/* Modal for status change */}
                  <Modal show={statusModal} onHide={() => setStatusModal(false)}>
                    <Modal.Header closeButton>
                      <h3>CHANGE SALE STATUS</h3>
                    </Modal.Header>
                    <Modal.Body>
                      <ListGroup>
                        {['completed', 'pending', 'cancelled'].map((status) => (
                          <ListGroup.Item key={status}>
                            <Button
                              className='btn btn-sm'
                              variant='warning'
                              onClick={() => handleChangeStatus(status)}
                            >
                              {status}
                            </Button>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Modal.Body>
                  </Modal>
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
