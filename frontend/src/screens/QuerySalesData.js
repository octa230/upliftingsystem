import { useState, useEffect, useContext, useCallback } from 'react';
import { Row, Col, Table, Form, Button, Alert, Card, Modal, ListGroup } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import { getError } from '../utils/getError';
import { toast } from 'react-toastify';
import { BsXLg, BsDashCircleFill } from 'react-icons/bs';
import SaleDetailsModal from '../components/SaleDetailsModal';
import { Store } from '../utils/Store';
import XlsExportBtn from '../components/XlsExportBtn';
import debounce from 'lodash.debounce';
import { LuCheckCircle2, LuPenLine, LuPlusCircle, LuPrinter, LuBuilding2 } from 'react-icons/lu';

const round2 = (num) => Math.round((num || 0) * 100 + Number.EPSILON) / 100;

export default function QuerySalesData() {
  const { state } = useContext(Store);
  const { userInfoToken } = state;

  const [query, setQuery] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate:   new Date().toISOString().split('T')[0],
    paymentMethod: '',
    paymentStatus: '',
  });

  const [sales, setSales]               = useState(null);
  const [selectedSale, setSelectedSale] = useState({});
  const [showModal, setShowModal]       = useState(false);
  const [statusModal, setStatusModal]   = useState(false);
  const [searchText, setSearchText]     = useState('');
  const [editingSale, setEditingSale]   = useState(null);

  // Summary totals from API
  const [totalCount, setTotalCount]       = useState(0);
  const [totalValue, setTotalValue]       = useState(0);
  const [focSales, setFocSales]           = useState(0);
  const [paymentTotals, setPaymentTotals] = useState([]);

  // ── Assign to company modal ───────────────────────────────
  const [companyModal, setCompanyModal]       = useState(false);
  const [companyTarget, setCompanyTarget]     = useState(null); // sale to reassign
  const [companyOptions, setCompanyOptions]   = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyLoading, setCompanyLoading]   = useState(false);

  const paymentMethods = ['Card', 'Cash', 'Credit', 'TapLink', 'Bank Transfer', 'F.O.C'];

  // ── Derived: cancelled totals ─────────────────────────────
  const cancelledSales    = sales?.filter((s) => s.status === 'cancelled') || [];
  const cancelledTotal    = round2(cancelledSales.reduce((a, s) => a + (s.total || 0), 0));
  const activeSales       = sales?.filter((s) => s.status !== 'cancelled') || [];
  const activeTotal       = round2(activeSales.reduce((a, s) => a + (s.total || 0), 0));
  const activeVat         = round2(activeSales.reduce((a, s) => a + (s.vat || 0), 0));
  const searchFoc         = round2(activeSales.filter((s) => s.free).reduce((a, s) => a + (s.total || 0), 0));

  // Use API totals when available, fall back to derived
  const displayTotal = searchText
    ? activeTotal
    : round2((totalValue || activeTotal) - cancelledTotal);

  // ── Fetch companies for modal ─────────────────────────────
  const openCompanyModal = async (sale) => {
    setCompanyTarget(sale);
    setSelectedCompany(null);
    setCompanyModal(true);
    if (companyOptions.length === 0) {
      setCompanyLoading(true);
      try {
        const { data } = await axios.get('/api/customers');
        setCompanyOptions(
          data.map((c) => ({ value: c._id, label: c.name, trn: c.taxRegNumber }))
        );
      } catch {
        toast.error('Could not load companies');
      } finally {
        setCompanyLoading(false);
      }
    }
  };

  const handleAssignCompany = async () => {
    if (!selectedCompany) return;
    toast.promise(
      axios.post(
        `/api/sale/print-sale/${companyTarget._id}`,
        { companyId: selectedCompany.value },
        { responseType: 'blob', headers: { Accept: 'application/pdf' } }
      ).then((res) => {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        window.open(window.URL.createObjectURL(blob), '_blank');
        setCompanyModal(false);
      }),
      { pending: 'Generating invoice…', success: 'Done!', error: 'Failed' }
    );
  };

  // ── View / edit / print ───────────────────────────────────
  const handleViewSale = async (saleId) => {
    try {
      const { data } = await axios.get(`/api/sale/get-sale/${saleId}`);
      setSelectedSale(data);
      setShowModal(true);
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const handlePrint = async (saleId) => {
    if (!window.confirm('Print invoice?')) return;
    toast.promise(
      axios.post(`/api/sale/print-sale/${saleId}`, {}, {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      }).then((res) => {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        window.open(window.URL.createObjectURL(blob), '_blank');
      }),
      { pending: '…please wait', success: '…done!', error: 'Oops! try again' }
    );
  };

  const handleEdit = (sale) => {
    if (userInfoToken.isAdmin) {
      toast.error("YOUR ACCOUNT CAN'T COMPLETE THIS ACTION");
      return;
    }
    setEditingSale({ ...sale });
  };

  const handleChangeStatus = async (str) => {
    setEditingSale(null);
    const { data } = await axios.patch(`/api/sale/status/${selectedSale._id}`, { status: str });
    setSales((prev) => prev.map((s) => (s._id === data._id ? data : s)));
    setStatusModal(false);
  };

  const updateSale = async () => {
    try {
      const { data } = await axios.put(`/api/sale/edit/${editingSale._id}`, {
        date:    editingSale?.date,
        service: editingSale?.service,
        paidBy:  editingSale?.paidBy,
      });
      if (data) {
        toast.success('Done');
        setSales((prev) => prev.map((s) => (s._id === data._id ? { ...s, ...data } : s)));
      }
    } catch (error) {
      console.error('Error updating sale:', error);
    } finally {
      setEditingSale(null);
    }
  };

  const clearFilters = () => {
    setQuery({
      startDate: new Date().toISOString().split('T')[0],
      endDate:   new Date().toISOString().split('T')[0],
      paymentMethod: '',
      paymentStatus: '',
    });
    setSearchText('');
  };

  const addSale = async (saleId) => {
    const { data } = await axios.get(`/api/sale/get-sale/${saleId}`);
    if (data?._id) {
      localStorage.setItem('selectedSale', JSON.stringify(data));
      toast.success('Successfully attached');
    }
  };

  const cancelSale = (sale) => {
    setSelectedSale(sale);
    setStatusModal(true);
  };

  // ── Search (debounced) ────────────────────────────────────
  const handleSearch = useCallback(
    debounce(async (text) => {
      const { data } = await axios.get(`/api/sale/search?searchText=${text}`);
      setSales(data);
    }, 300),
    []
  );

  // ── Fetch sales ───────────────────────────────────────────
  useEffect(() => {
    if (searchText) { handleSearch(searchText); return; }
    const fetchSales = async () => {
      try {
        const params = new URLSearchParams({ startDate: query.startDate, endDate: query.endDate });
        if (query.paymentMethod) params.append('paymentMethod', query.paymentMethod);
        if (query.paymentStatus) params.append('paymentStatus', query.paymentStatus);
        const { data } = await axios.get(`/api/sale/for?${params}`);
        setSales(data.sales);
        setTotalCount(data.totalCount);
        setTotalValue(data.totalValue);
        setFocSales(data.focSales);
        setPaymentTotals(data.paymentTotals);
      } catch (error) {
        toast.error(getError(error));
      }
    };
    fetchSales();
  }, [query.startDate, query.endDate, query.paymentMethod, query.paymentStatus,
      userInfoToken, editingSale?._id, searchText]);

  const statusColors = { cancelled: '#ffe5e5', pending: '#fff3cd', completed: 'white' };

  return (
    <div>
      <div className="mb-3 p-3">

        {/* ── Filters ── */}
        <div className="d-flex flex-wrap gap-3 mb-3 align-items-end">
          <Form.Group>
            <Form.Label>STARTING</Form.Label>
            <Form.Control type="date" value={query.startDate}
              onChange={(e) => setQuery((p) => ({ ...p, startDate: e.target.value }))} />
          </Form.Group>
          <Form.Group>
            <Form.Label>END</Form.Label>
            <Form.Control type="date" value={query.endDate}
              onChange={(e) => setQuery((p) => ({ ...p, endDate: e.target.value }))} />
          </Form.Group>
          <Form.Group>
            <Form.Label>PAYMENT METHOD</Form.Label>
            <Form.Select value={query.paymentMethod}
              onChange={(e) => setQuery((p) => ({ ...p, paymentMethod: e.target.value }))}>
              <option value="">All Methods</option>
              {paymentMethods.map((m) => <option key={m}>{m}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>PAYMENT STATUS</Form.Label>
            <Form.Select value={query.paymentStatus}
              onChange={(e) => setQuery((p) => ({ ...p, paymentStatus: e.target.value }))}>
              <option value="">All</option>
              <option value="paid">Paid Only</option>
              <option value="free">F.O.C Only</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>SEARCH SALE</Form.Label>
            <Form.Control type="text" value={searchText}
              placeholder="name, phone or invoice number"
              onChange={(e) => setSearchText(e.target.value)} />
          </Form.Group>
          <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <XlsExportBtn data={sales} />
          <Button>PDF</Button>
        </div>
      </div>

      <Row>
        <Col>
          {sales !== null ? (
            <div>

              {/* ── Summary Cards ── */}
              <div className="row g-2 mb-3">
                {/* Left: core totals */}
                <div className="col-md-6">
                  <div className="row g-2">
                    <div className="col-6">
                      <Card className="p-3 text-center h-100">
                        <Card.Title className="small text-muted mb-1">Total Results</Card.Title>
                        <h4 className="fw-bold">{totalCount || sales?.length}</h4>
                      </Card>
                    </div>
                    <div className="col-6">
                      <Card className="p-3 text-center h-100 border-success">
                        <Card.Title className="small text-muted mb-1">Net Total</Card.Title>
                        <h4 className="fw-bold text-success">{displayTotal}</h4>
                        {cancelledTotal > 0 && (
                          <small className="text-danger">− {cancelledTotal} cancelled</small>
                        )}
                      </Card>
                    </div>
                    <div className="col-6">
                      <Card className="p-3 text-center h-100">
                        <Card.Title className="small text-muted mb-1">VAT Value</Card.Title>
                        <h4 className="fw-bold text-primary">{activeVat}</h4>
                      </Card>
                    </div>
                    <div className="col-6">
                      <Card className="p-3 text-center h-100">
                        <Card.Title className="small text-muted mb-1">F.O.C.</Card.Title>
                        <h4 className="fw-bold text-danger">{round2(focSales || searchFoc)}</h4>
                      </Card>
                    </div>
                    {cancelledTotal > 0 && (
                      <div className="col-12">
                        <Card className="p-3 text-center h-100 border-danger bg-danger bg-opacity-10">
                          <Card.Title className="small text-danger mb-1">
                            Cancelled ({cancelledSales.length} sale{cancelledSales.length !== 1 ? 's' : ''})
                          </Card.Title>
                          <h4 className="fw-bold text-danger">− AED {cancelledTotal}</h4>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: payment method breakdown */}
                <div className="col-md-6">
                  <div className="row g-2">
                    {paymentTotals?.slice(0, 4).map((pm, i) => (
                      <div key={i} className="col-6">
                        <Card className="p-3 text-center h-100">
                          <Card.Title className="small text-muted mb-1">{pm.paymentMethod}</Card.Title>
                          <h4 className="fw-bold text-secondary">{round2(pm.total)}</h4>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Sales Table ── */}
              <Table bordered striped hover size="sm" responsive className="mt-2">
                <thead>
                  <tr>
                    <th>INV Code</th>
                    <th>DATE</th>
                    <th>CUSTOMER</th>
                    <th>STATUS</th>
                    <th>SERVICE</th>
                    <th>PAID BY</th>
                    <th>TOTAL</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {sales?.map((sale) => (
                    <tr key={sale._id}
                      style={{
                        background: statusColors[sale?.status] || 'white',
                        textDecoration: sale.status === 'cancelled' ? 'line-through' : 'none',
                        opacity: sale.status === 'cancelled' ? 0.7 : 1,
                      }}>
                      <td>
                        <Button size="sm" onClick={() => handleViewSale(sale._id)}>
                          {sale.InvoiceCode}
                        </Button>
                      </td>
                      <td>
                        {editingSale?._id === sale._id ? (
                          <Form.Control type="date" size="sm"
                            value={editingSale.date?.split('T')[0] || ''}
                            onChange={(e) => setEditingSale((p) => ({ ...p, date: e.target.value }))} />
                        ) : new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td>{sale.name}</td>
                      <td style={{ backgroundColor: sale.free ? '#FF9999' : 'transparent' }}>
                        {sale.status === 'cancelled' ? (
                          <span className="text-danger fw-bold">CANCELLED</span>
                        ) : sale.free ? 'F.O.C' : 'PAID'}
                      </td>
                      <td>
                        {editingSale?._id === sale._id ? (
                          <Form.Select size="sm" value={editingSale.service || ''}
                            onChange={(e) => setEditingSale((p) => ({ ...p, service: e.target.value }))}>
                            <option>Select...</option>
                            {['Delivery','Store Pick Up','Website','Insta-Shop','Delivero','Careem']
                              .map((o) => <option key={o}>{o}</option>)}
                          </Form.Select>
                        ) : sale.service}
                      </td>
                      <td>
                        {editingSale?._id === sale._id ? (
                          <Form.Select size="sm" value={editingSale.paidBy || ''}
                            onChange={(e) => setEditingSale((p) => ({ ...p, paidBy: e.target.value }))}>
                            <option>Select...</option>
                            {paymentMethods.map((m) => <option key={m}>{m}</option>)}
                          </Form.Select>
                        ) : sale.paidBy}
                      </td>
                      <td>{sale.total}</td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center align-items-center">
                          {editingSale?._id === sale._id ? (
                            <>
                              <LuCheckCircle2 size={20} style={{ cursor: 'pointer', color: 'green' }}
                                onClick={updateSale} />
                              <BsXLg size={18} style={{ cursor: 'pointer' }}
                                onClick={() => setEditingSale(null)} />
                            </>
                          ) : (
                            <LuPenLine size={20} style={{ cursor: 'pointer' }}
                              onClick={() => handleEdit(sale)} />
                          )}
                          <LuBuilding2 size={20} style={{ cursor: 'pointer', color: '#0d6efd' }}
                            title="Assign to company & reprint"
                            onClick={() => openCompanyModal(sale)} />
                          <LuPlusCircle size={20} style={{ cursor: 'pointer' }}
                            onClick={() => addSale(sale._id)} />
                          <LuPrinter size={20} style={{ cursor: 'pointer' }}
                            onClick={() => handlePrint(sale._id)} />
                          <BsDashCircleFill size={20} color="red" style={{ cursor: 'pointer' }}
                            onClick={() => cancelSale(sale)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* ── Status Change Modal ── */}
              <Modal show={statusModal} onHide={() => setStatusModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Change Sale Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <ListGroup>
                    {['completed', 'pending', 'cancelled'].map((status) => (
                      <ListGroup.Item key={status} className="d-flex align-items-center justify-content-between">
                        <span className="text-capitalize">{status}</span>
                        <Button size="sm" variant="warning"
                          onClick={() => handleChangeStatus(status)}>
                          Set {status}
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Modal.Body>
              </Modal>

              {/* ── Assign to Company Modal ── */}
              <Modal show={companyModal} onHide={() => setCompanyModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>
                    Assign to Company & Reprint
                    {companyTarget && (
                      <div className="small text-muted fw-normal mt-1">
                        {companyTarget.InvoiceCode}
                      </div>
                    )}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form.Label className="small text-uppercase text-muted mb-2"
                    style={{ letterSpacing: '.06em' }}>
                    Select Company
                  </Form.Label>
                  <Select
                    classNamePrefix="rs"
                    options={companyOptions}
                    isLoading={companyLoading}
                    isClearable
                    placeholder="Search companies…"
                    value={selectedCompany}
                    onChange={setSelectedCompany}
                    formatOptionLabel={(opt) => (
                      <div>
                        <div className="fw-semibold">{opt.label}</div>
                        {opt.trn && <small className="text-muted">TRN: {opt.trn}</small>}
                      </div>
                    )}
                  />
                  <small className="text-muted d-block mt-2">
                    This will reprint the invoice with the selected company's TRN and address.
                    The original sale record is not modified.
                  </small>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setCompanyModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" disabled={!selectedCompany}
                    onClick={handleAssignCompany}>
                    Reprint with Company Details
                  </Button>
                </Modal.Footer>
              </Modal>

              <SaleDetailsModal show={showModal} onHide={() => setShowModal(false)}
                selectedSale={selectedSale} />
            </div>
          ) : (
            <Alert variant="warning">No data</Alert>
          )}
        </Col>
      </Row>
    </div>
  );
}