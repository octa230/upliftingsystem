import React, { useEffect, useState } from 'react'
import Calculator from '../components/Calculator'
import { Container, Spinner } from 'react-bootstrap'
import axios from 'axios'
import {toast} from 'react-toastify'

const Default = () => {

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const getSummary = async () => {
      try {
        setLoading(true)
      const { data } = await axios.get(`/api/transactions/daily-summary`)
      setData(data)
      console.log(data)
      } catch (error) {
        toast.error(error)
      }finally{
        setLoading(false)
      }
    }
    getSummary()
  }, [])


  const paidSales = data?.sales.data.filter(sale => !sale.free);
const freeSales = data?.sales.data.filter(sale => sale.free);
const totalPaid = paidSales?.reduce((sum, sale) => sum + sale.total, 0);
const totalFree = freeSales?.reduce((sum, sale) => sum + sale.total, 0);

  return loading && !data ? <Spinner animation='grow'/> : (
    <Container fluid className='d-flex gap-3'>
      <div className='col-md-3'>
        <Calculator />
      </div>
          <div className="container-fluid p-4" style={{fontFamily: 'Arial, sans-serif'}}>
      <h2 className="mb-3">Daily Summary - {data?.date}</h2>
      
      <div className="row mb-4">
        <div className="col-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h6>Total Sales</h6>
              <h3>{data?.sales.count}</h3>
              <p>AED {data?.sales.total}</p>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h6>Paid Sales</h6>
              <h3>{paidSales?.length}</h3>
              <p>AED {totalPaid}</p>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card text-white" style={{backgroundColor: '#6f42c1'}}>
            <div className="card-body">
              <h6>F.O.C Sales</h6>
              <h3>{freeSales?.length}</h3>
              <p>AED {totalFree}</p>
            </div>
          </div>
        </div>
        <div className="col-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h6>Purchases</h6>
              <h3>{data?.purchases.count}</h3>
              <p>AED {data?.purchases.total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Sales Transactions</h5>
        </div>
        <div className="card-body p-0">
          <table className="table table-striped mb-0">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Payment</th>
                <th className="text-end">Subtotal</th>
                <th className="text-end">VAT</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.sales.data.map(s => (
                <tr key={s._id}>
                  <td>{s.InvoiceCode}</td>
                  <td>{new Date(s.createdAt).toLocaleTimeString()}</td>
                  <td>{s.name}<br/><small>{s.phone}</small></td>
                  <td>{s.service}</td>
                  <td>
                    <span className={`badge ${s.free ? 'bg-secondary' : 'bg-success'}`}>
                      {s.paidBy}
                    </span>
                  </td>
                  <td className="text-end">{s.subTotal.toFixed(2)}</td>
                  <td className="text-end">{s.vat.toFixed(2)}</td>
                  <td className="text-end fw-bold">{s.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="fw-bold">
                <td colSpan="5">Total</td>
                <td className="text-end">{data?.sales.data.reduce((sum, s) => sum + s.subTotal, 0).toFixed(2)}</td>
                <td className="text-end">{data?.sales.data.reduce((sum, s) => sum + s.vat, 0).toFixed(2)}</td>
                <td className="text-end">{data?.sales.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-4">
          <div className="card">
            <div className="card-body">
              <h6>Damages</h6>
              <h4>{data?.damages.count}</h4>
              <p>AED {data?.damages.total}</p>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card-body">
              <h6>Expenses</h6>
              <h4>{data?.expenses.count}</h4>
              <p>AED {data?.expenses.total}</p>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-success">
            <div className="card-body">
              <h6>Net Revenue</h6>
              <h4 className="text-success">AED {(totalPaid - data?.expenses.total - data?.damages.total).toFixed(2)}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Container>
  )
}

export default Default
