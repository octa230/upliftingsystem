import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    poBox: '',
    taxRegNumber: '',
    address: '',
    phone: '',
    email: '',
    paidAmount: 0,
    pendingBalance: 0
  });

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get('/api/customers'); // adjust API endpoint
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('/api/customers', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        logo: '',
        poBox: '',
        taxRegNumber: '',
        address: '',
        phone: '',
        email: '',
        paidAmount: 0,
        pendingBalance: 0
      });
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentUpdate = async () => {
    try {
      await axios.put(`/api/customers/${selectedCustomer._id}`, {
        ...selectedCustomer
      });
      setShowPaymentModal(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Customer Management</h2>
      <Button className="mb-3" onClick={() => setShowCreateModal(true)}>Add Customer</Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Logo</th>
            <th>PO Box</th>
            <th>Tax Reg. No.</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Paid Amount</th>
            <th>Pending Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer._id}>
              <td>{customer.name}</td>
              <td>{customer.logo ? <img src={customer.logo} alt={customer.name} style={{width:50}} /> : '-'}</td>
              <td>{customer.poBox || '-'}</td>
              <td>{customer.taxRegNumber || '-'}</td>
              <td>{customer.address || '-'}</td>
              <td>{customer.phone || '-'}</td>
              <td>{customer.email || '-'}</td>
              <td>${customer.paidAmount || 0}</td>
              <td>${customer.pendingBalance || 0}</td>
              <td>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowPaymentModal(true);
                  }}
                >
                  Update Payment
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Create Customer Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Logo URL</Form.Label>
              <Form.Control 
                type="file" 
                value={formData.logo} 
                onChange={e => setFormData({...formData, logo: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>PO Box</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.poBox} 
                onChange={e => setFormData({...formData, poBox: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Tax Registration Number</Form.Label>
              <Form.Control 
                type="text" 
                max={15}
                value={formData.taxRegNumber} 
                onChange={e => setFormData({...formData, taxRegNumber: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Address</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Paid Amount</Form.Label>
              <Form.Control 
                type="number" 
                value={formData.paidAmount} 
                onChange={e => setFormData({...formData, paidAmount: Number(e.target.value)})} 
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Pending Balance</Form.Label>
              <Form.Control 
                type="number" 
                value={formData.pendingBalance} 
                onChange={e => setFormData({...formData, pendingBalance: Number(e.target.value)})} 
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleCreate}>Create</Button>
        </Modal.Footer>
      </Modal>

      {/* Update Payment Modal */}
      {selectedCustomer && (
        <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Payment for {selectedCustomer.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Paid Amount</Form.Label>
                <Form.Control 
                  type="number" 
                  value={selectedCustomer.paidAmount} 
                  onChange={e => setSelectedCustomer({
                    ...selectedCustomer, 
                    paidAmount: Number(e.target.value)
                  })} 
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Pending Balance</Form.Label>
                <Form.Control 
                  type="number" 
                  value={selectedCustomer.pendingBalance} 
                  onChange={e => setSelectedCustomer({
                    ...selectedCustomer, 
                    pendingBalance: Number(e.target.value)
                  })} 
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Close</Button>
            <Button variant="primary" onClick={handlePaymentUpdate}>Update</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Customers;
