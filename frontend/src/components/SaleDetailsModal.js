import React from 'react';
import Button from 'react-bootstrap/esm/Button';
import Modal from 'react-bootstrap/esm/Modal';
import Table from 'react-bootstrap/esm/Table';
import {PDFDownloadLink } from '@react-pdf/renderer'
import Invoice from '../utils/Invoice'


export default function SaleDetailsModal({selectedSale, show, onHide}) {
    
  return (
    <Modal size="lg" centered aria-labelledby="sale-details" show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title id='sale-model'>
          Sale Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <p>Code: {selectedSale.InvoiceCode}</p>
          <p>Prepared By: {selectedSale.preparedBy}</p>
          <p>Paid By: {selectedSale.paidBy}</p>
          <p>Date: {selectedSale.date}</p>
          <p>Service: {selectedSale.service}</p>
          <p>Customer: {selectedSale.name}</p>
          <p>Phone: {selectedSale.phone}</p>
          <p>Subtotal: {selectedSale.subTotal}</p>
          <p>Total: {selectedSale.total}</p>
        </div>
        <div>
          <h4>Sale Items:</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Arrangement</th>
                <th>Photo</th>
              </tr>
            </thead>
            <tbody>
              {selectedSale.saleItems?.map((item, index) => (
                <tr key={index}>
                  <td>{item.productName}</td>
                  <td>{item.price}</td>
                  <td>{item.quantity}</td>
                  <td>{item.arrangement}</td>
                  <td>{item.photo && <img src={item.photo} className='img-thumbnail' alt='product' />}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h4>Units:</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Arrangement</th>
                <th>Products</th>
              </tr>
            </thead>
            <tbody>
              {selectedSale.units?.map((unit, index) => (
                <tr key={index}>
                  <td>{unit.arrangement}</td>
                  <td>
                    <ul>
                      {unit.products.map((product, idx) => (
                        <li key={idx}>{product.quantity}<small className='px-2'>{product.productName}</small></li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <>
        {selectedSale && (
                <PDFDownloadLink document={<Invoice sale={selectedSale} />} fileName={`Invoice_${selectedSale.InvoiceCode}.pdf`}>
                <Button>Print</Button>
              </PDFDownloadLink>
            )}
        </>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
