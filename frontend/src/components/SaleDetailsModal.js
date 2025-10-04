import Modal from 'react-bootstrap/esm/Modal';
import Table from 'react-bootstrap/esm/Table';


export default function SaleDetailsModal({ selectedSale, show, onHide }) {

  return (
    <Modal size="lg" centered aria-labelledby="sale-details" show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title id='sale-model'>
          Sale Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table responsive striped>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Code</strong></td>
              <td>{selectedSale.InvoiceCode}</td>
            </tr>
            <tr>
              <td><strong>Prepared By</strong></td>
              <td>{selectedSale.preparedBy}</td>
            </tr>
            <tr>
              <td><strong>Paid By</strong></td>
              <td>{selectedSale.paidBy}</td>
            </tr>
            <tr>
              <td><strong>Date</strong></td>
              <td>{selectedSale.date}</td>
            </tr>
            <tr>
              <td><strong>Service</strong></td>
              <td>{selectedSale.service}</td>
            </tr>
            <tr>
              <td><strong>Customer</strong></td>
              <td>{selectedSale.name}</td>
            </tr>
            <tr>
              <td><strong>Phone</strong></td>
              <td>{selectedSale.phone}</td>
            </tr>
            <tr>
              <td><strong>Status</strong></td>
              <td>{selectedSale.free ? "F.O.C" : "CHARGED"}</td>
            </tr>
            <tr>
              <td><strong>Subtotal</strong></td>
              <td>{selectedSale.subTotal}</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td>{selectedSale.total}</td>
            </tr>
          </tbody>
        </Table>
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
                  <td>{item.photo && <img src={item.photo} alt='product' style={{ width: '100px' }} />}</td>
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
      </Modal.Body >
    </Modal >
  );
}
