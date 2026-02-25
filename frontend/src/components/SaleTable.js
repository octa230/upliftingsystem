import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Store } from '../utils/Store';
import { round2 } from '../utils/helpers';
import { toast } from 'react-toastify';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { BsCamera, BsPlusSquare, BsFillTrash3Fill } from 'react-icons/bs';
import { LuBan, LuCloud } from 'react-icons/lu';
import {
  Container, Row, Col, Button, Form,
  Badge, Card, Table,
} from 'react-bootstrap';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcTotals(products, discount) {
  const gross = products.reduce((s, p) => s + p.quantity * p.price, 0);
  const afterDiscount = gross - (parseFloat(discount) || 0);
  const subTotal = afterDiscount / 1.05;
  const vat = round2(subTotal * 0.05);
  const total = subTotal + vat;
  return {
    subTotal: subTotal.toFixed(2),
    vat: vat.toFixed(2),
    total: total.toFixed(2),
  };
}

const CUSTOMER_TYPES = [
  { id: 'cash',    icon: '💵', label: 'Cash',    desc: 'Walk-in · no details required' },
  { id: 'card',    icon: '💳', label: 'Card',    desc: 'Name & phone optional' },
  { id: 'company', icon: '🏢', label: 'Company', desc: 'Invoice with TRN & address' },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ current, onBack }) => {
  const steps = ['Customer', 'Products', 'Checkout'];
  return (
    <div className="d-flex border-bottom mb-4">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <button
            key={n}
            onClick={() => done && onBack(n)}
            className={[
              'flex-fill d-flex align-items-center gap-2 py-3 px-3 border-0 bg-transparent',
              i < steps.length - 1 ? 'border-end' : '',
              active ? 'fw-semibold text-warning' : '',
              done   ? 'text-success' : '',
              !active && !done ? 'text-secondary' : '',
            ].join(' ')}
            style={{ cursor: done ? 'pointer' : 'default', fontSize: 13 }}
          >
            <span
              className={[
                'd-flex align-items-center justify-content-center rounded-circle border fw-bold flex-shrink-0',
                active ? 'bg-warning text-dark border-warning' : '',
                done   ? 'bg-success text-white border-success' : '',
                !active && !done ? 'text-secondary border-secondary' : '',
              ].join(' ')}
              style={{ width: 26, height: 26, fontSize: 12 }}
            >
              {done ? '✓' : n}
            </span>
            <span className="d-none d-sm-inline text-uppercase" style={{ letterSpacing: '.08em', fontSize: 11 }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SaleTable = () => {
  const [step, setStep] = useState(1);

  // Step 1
  const [customerType, setCustomerType] = useState(null);
  const [name, setName]       = useState(null);
  const [phone, setPhone]     = useState(null);
  const [company, setCompany] = useState(null);

  // Step 2
  const [products, setProducts] = useState([]);

  // Step 3
  const [paidBy, setPaidBy]         = useState('');
  const [service, setService]       = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [discount, setDiscount]     = useState(0);

  const [options, setOptions]       = useState({});
  const [customers, setCustomers]   = useState([]);
  const [isLoading, setIsLoading]   = useState(false);

  const { state } = useContext(Store);
  const { userInfoToken } = state;
  const totals = calcTotals(products, discount);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [optionsRes, customersRes] = await Promise.all([
          axios.get('/api/sale/options'),
          axios.get('/api/customers'),
        ]);
        setOptions(optionsRes.data);
        setCustomers(customersRes.data);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Product helpers ──────────────────────────────────────────────────────
  const addRow = () =>
    setProducts((p) => [...p, { name: null, price: 0, quantity: 1, arrangement: null, photo: '', loading: false }]);

  const removeRow = (i) => setProducts((p) => p.filter((_, idx) => idx !== i));

  const updateProduct = (i, key, val) =>
    setProducts((p) => { const n = [...p]; n[i] = { ...n[i], [key]: val }; return n; });

  const uploadFileHandler = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await axios.post('/api/upload/', form, {
      headers: { 'Content-Type': 'multipart/form-data', authorization: `Bearer ${userInfoToken.token}` },
    });
    return data.secure_url;
  };

  const handleCapture = async (i, file) => {
    if (!file) return;
    updateProduct(i, 'loading', true);
    try {
      const url = await uploadFileHandler(file);
      setProducts((p) => { const n = [...p]; n[i] = { ...n[i], photo: url, loading: false }; return n; });
    } catch {
      toast.error('Photo upload failed');
      updateProduct(i, 'loading', false);
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const step1Valid = () => {
    if (!customerType) return false;
    if (customerType === 'company') return !!company;
    return true;
  };

  const step2Valid = () =>
    products.length > 0 &&
    products.every((p) => p.name && p.arrangement && p.price > 0 && p.quantity > 0 && p.photo);

  const step3Valid = () => paidBy && service && preparedBy;

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!window.confirm('Save & print invoice?')) return;
    const submitProducts = products.map((p) => ({
      ...p,
      name: p.name?.value || p.name,
      arrangement: p.arrangement?.value || p.arrangement,
    }));

    toast.promise(
      axios.post(
        '/api/sale/new-sale',
        {
          products: submitProducts,
          discount,
          paidBy,
          service,
          name: customerType === 'company' ? (company?.label || '') : (name?.value || name || ''),
          phone: customerType === 'company'? (company?.phone || '') : (phone?.value || phone || ''),
          companyId: customerType === 'company' ? company?.value : undefined,
          companyTRN: customerType === 'company' ? company?.taxRegNumber : undefined,
          companyAddress: customerType === 'company' ? company?.address : undefined,
          companyPoBox: customerType === 'company' ? company?.poBox : undefined,
          preparedBy,
          ...totals,
        },
        { responseType: 'blob', headers: { Accept: 'application/pdf' } }
      ).then((res) => {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        window.open(window.URL.createObjectURL(blob), '_blank');
      }),
      { pending: 'Saving…', success: 'Invoice ready!', error: 'Oops, try again' }
    );
  };

  const rsProps = { classNamePrefix: 'rs' };

  return (
    <Container fluid className="py-3 px-3 px-md-4">

      <StepIndicator current={step} onBack={setStep} />

      {/* ════════ STEP 1 — Customer ════════ */}
      {step === 1 && (
        <>
          <h5 className="fw-bold mb-1">Who's buying?</h5>
          <p className="text-muted small text-uppercase mb-4" style={{ letterSpacing: '.08em' }}>Select customer type</p>

          <Row className="g-3 mb-4">
            {CUSTOMER_TYPES.map(({ id, icon, label, desc }) => (
              <Col xs={12} sm={4} key={id}>
                <Card
                  onClick={() => { setCustomerType(id); setCompany(null); setName(null); setPhone(null); }}
                  border={customerType === id ? 'warning' : undefined}
                  className="h-100"
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="p-3">
                    <div style={{ fontSize: 24 }} className="mb-2">{icon}</div>
                    <div className="fw-semibold mb-1">{label}</div>
                    <div className="text-muted small">{desc}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {(customerType === 'cash' || customerType === 'card') && (
            <Row className="g-3 mb-4">
              <Col xs={12} sm={6}>
                <Form.Label className="small text-uppercase text-muted" style={{ letterSpacing: '.06em' }}>
                  Customer Name <Badge bg="secondary" className="ms-1 fw-normal">optional</Badge>
                </Form.Label>
                <CreatableSelect
                  {...rsProps}
                  options={options.names?.map((o) => ({ value: o, label: o })) || []}
                  isClearable
                  placeholder="Type or search…"
                  value={name}
                  onChange={setName}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Form.Label className="small text-uppercase text-muted" style={{ letterSpacing: '.06em' }}>
                  Phone <Badge bg="secondary" className="ms-1 fw-normal">optional</Badge>
                </Form.Label>
                <CreatableSelect
                  {...rsProps}
                  options={options.phones?.map((o) => ({ value: o, label: o })) || []}
                  isClearable
                  placeholder="Type or search…"
                  value={phone}
                  onChange={setPhone}
                />
              </Col>
            </Row>
          )}

          {customerType === 'company' && (
            <Row className="mb-4">
              <Col xs={12} sm={6}>
                <Form.Label className="small text-uppercase text-muted" style={{ letterSpacing: '.06em' }}>
                  Search Company
                </Form.Label>
                <Select
                  {...rsProps}
                  options={customers.map((c) => ({
                    value: c._id,
                    label: c.name,
                    phone: c.phone,
                    email: c.email,
                    address: c.address,
                    taxRegNumber: c.taxRegNumber,
                    poBox: c.poBox,
                  }))}
                  isClearable
                  isLoading={isLoading}
                  placeholder="Search registered companies…"
                  value={company}
                  onChange={setCompany}
                  formatOptionLabel={(opt) => (
                    <div>
                      <div className="fw-semibold">{opt.label}</div>
                      {opt.taxRegNumber && (
                        <small className="text-muted">TRN: {opt.taxRegNumber}</small>
                      )}
                    </div>
                  )}
                />
              </Col>
            </Row>
          )}

          <div className="d-flex justify-content-end">
            <Button variant="warning" disabled={!step1Valid()} onClick={() => { setStep(2); if (!products.length) addRow(); }}>
              Add Products →
            </Button>
          </div>
        </>
      )}

      {/* ════════ STEP 2 — Products ════════ */}
      {step === 2 && (
        <>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="fw-bold mb-0">Products</h5>
              <small className="text-muted">{products.length} item{products.length !== 1 ? 's' : ''}</small>
            </div>
            <Button variant="outline-danger" size="sm" onClick={() => setProducts([])} title="Clear all">
              <BsFillTrash3Fill />
            </Button>
          </div>

          <Table responsive bordered className="align-middle mb-2" size="sm" style={{overflow:"visible"}}>
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Arrangement</th>
                <th style={{ width: 110 }}>Price</th>
                <th style={{ width: 80 }}>Qty</th>
                <th style={{ width: 60 }} className="text-center">Photo</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr key={idx} className={product.loading ? 'opacity-50' : ''}>
                  <td>
                    <CreatableSelect
                      {...rsProps}
                      menuPosition="fixed"
                      options={options.products?.map((o) => ({ value: o, label: o })) || []}
                      value={product.name}
                      placeholder="Product…"
                      onChange={(v) => updateProduct(idx, 'name', v)}
                    />
                  </td>
                  <td>
                    <CreatableSelect
                      {...rsProps}
                      menuPosition="fixed"
                      options={options.arrangements?.map((o) => ({ value: o, label: o })) || []}
                      value={product.arrangement}
                      placeholder="Arrangement…"
                      onChange={(v) => updateProduct(idx, 'arrangement', v)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      size="sm"
                      placeholder="0.00"
                      value={product.price || ''}
                      onChange={(e) => updateProduct(idx, 'price', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      size="sm"
                      min="1"
                      value={product.quantity || ''}
                      onChange={(e) => updateProduct(idx, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td className="text-center">
                    <label
                      htmlFor={`photo-${idx}`}
                      className={`btn btn-sm mb-0 ${product.photo ? 'btn-success' : 'btn-outline-secondary'}`}
                      style={{ cursor: 'pointer' }}
                      title={product.photo ? 'Photo uploaded ✓' : 'Take photo'}
                    >
                      {product.loading ? '…' : <BsCamera />}
                    </label>
                    <input
                      id={`photo-${idx}`}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={(e) => handleCapture(idx, e.target.files[0])}
                    />
                  </td>
                  <td>
                    <Button variant="outline-danger" size="sm" onClick={() => removeRow(idx)}>
                      <LuBan />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Button variant="outline-secondary" size="sm" className="w-100 mb-4" onClick={addRow}>
            <BsPlusSquare className="me-2" /> Add another item
          </Button>

          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button variant="warning" disabled={!step2Valid()} onClick={() => setStep(3)}>
              Checkout →
            </Button>
          </div>
        </>
      )}

      {/* ════════ STEP 3 — Checkout ════════ */}
      {step === 3 && (
        <>
          <h5 className="fw-bold mb-1">Checkout</h5>
          <p className="text-muted small text-uppercase mb-4" style={{ letterSpacing: '.08em' }}>Review & confirm</p>

          {/* Customer summary pill */}
          <Card className="mb-3 border">
            <Card.Body className="py-2 px-3">
              <small className="text-muted">
                <strong className="text-body">
                  {customerType === 'company'
                    ? (company?.label || 'Company')
                    : (name?.label || (customerType === 'cash' ? 'Cash Customer' : 'Card Customer'))}
                </strong>
                {phone && <> · {phone?.label}</>}
                {' '}—{' '}
                {products.length} item{products.length !== 1 ? 's' : ''}
              </small>
            </Card.Body>
          </Card>

          {/* Totals */}
          <Table bordered size="sm" className="mb-4">
            <tbody>
              <tr>
                <td className="text-muted">Net Amount (excl. VAT)</td>
                <td className="text-end fw-semibold">AED {totals.subTotal}</td>
              </tr>
              <tr>
                <td className="text-muted">Discount</td>
                <td className="text-end">
                  <Form.Control
                    type="number"
                    size="sm"
                    min="0"
                    style={{ width: 110, marginLeft: 'auto' }}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                  />
                </td>
              </tr>
              <tr>
                <td className="text-muted">VAT 5%</td>
                <td className="text-end">AED {totals.vat}</td>
              </tr>
              <tr className="table-warning">
                <td className="fw-bold">Total</td>
                <td className="text-end fw-bold fs-5">AED {totals.total}</td>
              </tr>
            </tbody>
          </Table>

          {/* Sale fields */}
          <Row className="g-3 mb-4">
            <Col xs={12} sm={4}>
              <Form.Label className="small text-uppercase text-muted" style={{ letterSpacing: '.06em' }}>Payment Method</Form.Label>
              <Form.Select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                <option value="">Select…</option>
                {['Cash','Card','Credit','TapLink','Bank Transfer','F.O.C'].map((o) => <option key={o}>{o}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Label className="small text-uppercase text-muted" style={{ letterSpacing: '.06em' }}>Service / Channel</Form.Label>
              <Form.Select value={service} onChange={(e) => setService(e.target.value)}>
                <option value="">Select…</option>
                {['Delivery','Store Pick Up','Website','Insta-Shop','Delivero','Careem'].map((o) => <option key={o}>{o}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Label className="small text-uppercase text-muted" style={{ letterSpacing: '.06em' }}>Prepared By</Form.Label>
              <Form.Select value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)}>
                <option value="">Select…</option>
                {['Joe','Almira','Allan','Mahel'].map((o) => <option key={o}>{o}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center">
            <Button variant="outline-secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button variant="success" size="lg" disabled={!step3Valid()} onClick={handleSave}>
              <LuCloud className="me-2" /> Save & Print Invoice
            </Button>
          </div>
        </>
      )}

    </Container>
  );
};

export default SaleTable;