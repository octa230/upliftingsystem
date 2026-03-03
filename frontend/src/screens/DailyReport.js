import React, { useEffect, useState } from 'react';
import { Row, Col, Container, Table, Button, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const fmt = (n) => `AED ${(n ?? 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TABS = ['summary', 'sales', 'damages', 'purchases', 'closing'];

// ── Summary cards ─────────────────────────────────────────────────────────────
const SummarySection = ({ report }) => {
  const { summary, sales, damages, purchases } = report;
  const net = summary?.net ?? 0;
  return (
    <>
      <Row className="g-3 mb-4">
        {[
          { label: 'Revenue', value: fmt(summary?.revenue), variant: 'success' },
          { label: 'Purchases', value: fmt(summary?.spent), variant: 'primary' },
          { label: 'Damage Loss', value: fmt(summary?.lostToDamage), variant: 'danger' },
          { label: 'Net', value: fmt(net), variant: net >= 0 ? 'success' : 'danger' },
        ].map(({ label, value, variant }) => (
          <Col key={label} xs={6} md={3}>
            <div className="border rounded p-3">
              <small className="text-muted text-uppercase d-block mb-1" style={{ fontSize: 10, letterSpacing: 1 }}>{label}</small>
              <strong className={`text-${variant}`} style={{ fontSize: 15 }}>{value}</strong>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col md={4}>
          <small className="text-muted text-uppercase fw-semibold d-block mb-2" style={{ fontSize: 10 }}>Sales Breakdown</small>
          <Table bordered size="sm">
            <tbody>
              <tr><td>Invoices</td><td className="text-end">{sales?.invoiceCount ?? 0}</td></tr>
              <tr><td>Items Sold</td><td className="text-end">{sales?.itemsSold ?? 0}</td></tr>
              <tr><td>VAT</td><td className="text-end">{fmt(sales?.totalVat)}</td></tr>
              <tr><td>Discounts</td><td className="text-end">- {fmt(sales?.totalDiscount)}</td></tr>
              <tr><td>Complimentary</td><td className="text-end">{sales?.freeSales ?? 0}</td></tr>
            </tbody>
          </Table>
        </Col>
        <Col md={4}>
          <small className="text-muted text-uppercase fw-semibold d-block mb-2" style={{ fontSize: 10 }}>By Payment Method</small>
          <Table bordered size="sm">
            <tbody>
              {(sales?.byPaymentMethod ?? []).map((p, i) => (
                <tr key={i}><td>{p.method}</td><td className="text-end">{fmt(p.total)}</td></tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col md={4}>
          <small className="text-muted text-uppercase fw-semibold d-block mb-2" style={{ fontSize: 10 }}>By Service</small>
          <Table bordered size="sm">
            <tbody>
              {(sales?.byService ?? []).map((s, i) => (
                <tr key={i}><td>{s.service}</td><td className="text-end">{fmt(s.total)}</td></tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  );
};

// ── Sales ─────────────────────────────────────────────────────────────────────
const SalesTable = ({ sales }) => (
  <Table bordered responsive size="sm">
    <thead className="table-light">
      <tr><th>Method</th><th>Total</th></tr>
    </thead>
    <tbody>
      {(sales?.byPaymentMethod ?? []).map((p, i) => (
        <tr key={i}><td>{p.method}</td><td>{fmt(p.total)}</td></tr>
      ))}
      <tr className="table-light fw-bold">
        <td>Total Revenue</td><td>{fmt(sales?.totalRevenue)}</td>
      </tr>
    </tbody>
  </Table>
);

// ── Damages ───────────────────────────────────────────────────────────────────
const DamagesTable = ({ damages }) => (
  <Table bordered responsive size="sm">
    <thead className="table-light">
      <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Loss</th></tr>
    </thead>
    <tbody>
      {(damages?.breakdown ?? []).length === 0
        ? <tr><td colSpan={4} className="text-muted fst-italic text-center">No damages recorded</td></tr>
        : (damages?.breakdown ?? []).map((d, i) => (
          <tr key={i}>
            <td>{d.productName}</td>
            <td>{d.quantity}</td>
            <td>{fmt(d.purchasePrice)}</td>
            <td className="text-danger">{fmt(d.value)}</td>
          </tr>
        ))}
      <tr className="table-light fw-bold">
        <td colSpan={3}>Total Loss</td>
        <td className="text-danger">{fmt(damages?.totalDamageValue)}</td>
      </tr>
    </tbody>
  </Table>
);

// ── Purchases ─────────────────────────────────────────────────────────────────
const PurchasesTable = ({ purchases }) => (
  <Table bordered responsive size="sm">
    <thead className="table-light">
      <tr><th>Supplier</th><th>Product</th><th>Type</th><th>Qty</th><th>Unit Price</th></tr>
    </thead>
    <tbody>
      {(purchases?.bySupplier ?? []).length === 0
        ? <tr><td colSpan={5} className="text-muted fst-italic text-center">No purchases recorded</td></tr>
        : (purchases?.bySupplier ?? []).flatMap((s, si) =>
          (s.breakdown ?? []).map((b, bi) => (
            <tr key={`${si}-${bi}`}>
              <td>{s.supplier ?? '—'}</td>
              <td>{b.productName}</td>
              <td><Badge bg="secondary" style={{ fontSize: 10 }}>{b.identifier}</Badge></td>
              <td>{b.quantity}</td>
              <td>{fmt(b.purchasePrice)}</td>
            </tr>
          ))
        )}
      <tr className="table-light fw-bold">
        <td colSpan={4}>Total Spent</td>
        <td>{fmt(purchases?.totalSpent)}</td>
      </tr>
    </tbody>
  </Table>
);

// ── Closing Stock ─────────────────────────────────────────────────────────────
const ClosingStockTable = ({ items, totalStockValue }) => (
  <Table bordered responsive size="sm">
    <thead className="table-light">
      <tr><th>Code</th><th>Product</th><th>Type</th><th>Opening</th><th>Purchased</th><th>Sold</th><th>Damaged</th><th>Closing</th><th>Value</th></tr>
    </thead>
    <tbody>
      {(items ?? []).length === 0
        ? <tr><td colSpan={9} className="text-muted fst-italic text-center">No snapshot for this date</td></tr>
        : (items ?? []).map((item, i) => (
          <tr key={i}>
            <td><code style={{ fontSize: 11 }}>{item.code}</code></td>
            <td>{item.name}</td>
            <td><Badge bg="light" text="dark" style={{ fontSize: 10 }}>{item.identifier}</Badge></td>
            <td>{item.openingStock}</td>
            <td className="text-success">{item.purchase}</td>
            <td className="text-primary">{item.sold}</td>
            <td className="text-danger">{item.waste}</td>
            <td><strong>{item.closingStock}</strong></td>
            <td>{fmt(item.closingStock * item.purchasePrice)}</td>
          </tr>
        ))}
      <tr className="table-light fw-bold">
        <td colSpan={8}>Total Stock Value</td>
        <td>{fmt(totalStockValue)}</td>
      </tr>
    </tbody>
  </Table>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const DailyReport = () => {
  const [tab, setTab] = useState('summary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [closing, setClosing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ data: r }, { data: c }] = await Promise.all([
          axios.get(`/api/reports/daily?date=${date}`),
          axios.get(`/api/reports/closing-stock/${date}`).catch(() => ({ data: null }))
        ]);
        setReport(r);
        setClosing(c);
      } catch (e) {
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [date]);

  const handleManualSave = async () => {
  try {
    const { data } = await axios.post('/api/reports/closing-stock/snapshot');
    if (data.message) {
      toast.success(data.message);
    }
  } catch (err) {
    toast.error('Failed to save snapshot');
  }
};

  const handlePrint = async () => {
  try {
    const res = await axios.get(`/api/reports/daily/pdf?date=${date}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${date}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    alert('Failed to generate PDF');
  }
};

  const renderContent = () => {
    if (!report) return null;
    switch (tab) {
      case 'summary':   return <SummarySection report={report} />;
      case 'sales':     return <SalesTable sales={report.sales} />;
      case 'damages':   return <DamagesTable damages={report.damages} />;
      case 'purchases': return <PurchasesTable purchases={report.purchases} />;
      case 'closing':   return <ClosingStockTable items={closing?.items} totalStockValue={closing?.totalStockValue} />;
      default:          return null;
    }
  };

  return (
    <Container fluid className="py-3">

      {/* Header */}
      <Row className="align-items-center mb-3">
        <Col>
          <h5 className="mb-0 fw-bold">Daily Report</h5>
          <small className="text-muted">{new Date(date).toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
        </Col>
        <Col xs="auto" className="d-flex gap-2 align-items-center">
          <input
            type="date"
            className="form-control form-control-sm"
            value={date}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
            style={{ width: 160 }}
          />
          <Button size="sm" variant="outline-secondary" onClick={handleManualSave}>
            Save Now
          </Button>
          <Button size="sm" variant="outline-secondary" onClick={handlePrint}>
            🖨 Print
          </Button>
        </Col>
      </Row>

      {/* Tabs */}
      <div className="d-flex gap-1 mb-3 border-bottom pb-2">
        {TABS.map(t => (
          <Button
            key={t}
            size="sm"
            variant={tab === t ? 'dark' : 'light'}
            onClick={() => setTab(t)}
            className="text-capitalize"
          >
            {t}
          </Button>
        ))}
      </div>

      {/* Body */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" className="me-2" />
          <small className="text-muted">Loading report…</small>
        </div>
      ) : error ? (
        <div className="text-danger text-center py-4">{error}</div>
      ) : (
        <div>{renderContent()}</div>
      )}
    </Container>
  );
};

export default DailyReport;