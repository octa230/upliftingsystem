import axios from 'axios'
import React, { useContext, useState } from 'react'
import { Button, Form, ListGroup, Offcanvas, Spinner } from 'react-bootstrap'
import { LuCog } from 'react-icons/lu'
import { toast } from 'react-toastify'
import { uploadFileHandler } from '../utils/helpers'
import { Store } from '../utils/Store'
import { getError } from '../utils/getError'
import Customers from '../screens/Customers'

const Settings = () => {
    const [company, setCompany] = useState({
        name: '',
        controlId: '',
        logo: '',
        poBox: '',
        footerLogo: '',
        description: '',
        mobile: '',
        phone: '',
        address: '',
        email: '',
        trn: '',
        website: '',
    })

    const [showSetting, setShowSetting] = useState(false)
    const [loadingLogo, setLoadingLogo] = useState(false)
    const [activeView, setActiveView] = useState(null)
    const { state } = useContext(Store)
    const { userInfoToken } = state

    const handleUploadLogo = async (e) => {
        const file = e.target.files[0]
        if (!file) return;

        try {
            setLoadingLogo(true)
            const fileUrl = await uploadFileHandler(file, userInfoToken)
            setCompany((prev) => ({ ...prev, logo: fileUrl }))
        } catch (error) {
            toast.error(error)
        } finally {
            setLoadingLogo(false)
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post(`/api/settings/company`, company)
            if (data) toast.success('Done')
        } catch (error) {
            toast.error(error)
        }
    }

    const handleShow = async () => {
        if (!company._id) {
            const { data } = await axios.get(`/api/settings/company`)
            setCompany(data)
        }
        setShowSetting(prev => !prev) // Toggle based on previous state
    }


    const SettingsMenu = ({ onSelect}) => (
        <ListGroup className='flush'>
            <ListGroup.Item className="cursor-pointer" onClick={() => onSelect('company')}>
                company Settings
            </ListGroup.Item>
            <ListGroup.Item className="cursor-pointer" onClick={() => onSelect('customer')}>
                Customer Settings
            </ListGroup.Item>
            <ListGroup.Item className="cursor-pointer" onClick={() => onSelect('employee')}>
                Employees / Users
            </ListGroup.Item>
        </ListGroup>
    )


    const HeaderWithBack = ({ title, onBack }) => (
        <Offcanvas.Header>
            <Button variant="link" onClick={onBack} className="me-2">
                ← Back
            </Button>
            <Offcanvas.Title>{title}</Offcanvas.Title>
        </Offcanvas.Header>
    )


    const renderCompanyForm = () => (
        <>
            <HeaderWithBack title="Company Settings" onBack={() => setActiveView(null)} />
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                        type='text' value={company.name} onChange={
                            (e) => setCompany(prev => ({ ...prev, name: e.target.value }))
                        } />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Logo</Form.Label>
                    <Form.Control type='file' onChange={handleUploadLogo} />
                    {loadingLogo ? <Spinner animation="border" /> : company.logo && (
                        <img src={company.logo} className='img-thumbnail' alt='logo' />
                    )}
                </Form.Group>
                <Form.Group>
                    <Form.Label>PO.Box</Form.Label>
                    <Form.Control type='text' value={company.poBox} onChange={
                        (e) => setCompany(prev => ({ ...prev, poBox: e.target.value }))
                    } />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type='email' value={company.email} onChange={
                        (e) => setCompany(prev => ({ ...prev, email: e.target.value }))
                    } />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Line Phone</Form.Label>
                    <Form.Control
                        type='tel' value={company.phone} onChange={
                            (e) => setCompany(prev => ({ ...prev, phone: e.target.value }))
                        } />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Mobile</Form.Label>
                    <Form.Control
                        type="tel" value={company.mobile} onChange={
                            (e) => setCompany(prev => ({ ...prev, mobile: e.target.value }))
                        } />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Tax Number</Form.Label>
                    <Form.Control
                        max='15'
                        type='text' value={company.trn} onChange={
                            (e) => setCompany(prev => ({ ...prev, trn: e.target.value }))
                        } />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                        type='text' value={company.website} onChange={
                            (e) => setCompany(prev => ({ ...prev, website: e.target.value }))
                        } />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Address</Form.Label>
                    <Form.Control as="textarea"
                        rows={3}
                        type='address' value={company.address} onChange={
                            (e) => setCompany(prev => ({ ...prev, address: e.target.value }))
                        } />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Desc</Form.Label>
                    <Form.Control as="textarea"
                        rows={6}
                        type='text' value={company.description} onChange={
                            (e) => setCompany(prev => ({ ...prev, description: e.target.value }))
                        } />
                </Form.Group>
                <Button type='submit' className='mt-2 w-100' variant='success'>Save</Button>
            </Form>
        </>
    )

    const renderCustomerForm = () => (
        <>
            <HeaderWithBack title="Customer Settings" onBack={() => setActiveView(null)} />
            <Offcanvas.Body>
                
            </Offcanvas.Body>
        </>
    )

    const renderEmployeeForm = () => (
        <>
            <HeaderWithBack title="Employee Settings" onBack={() => setActiveView(null)} />
            <Offcanvas.Body>
                <p>Employee / User management goes here</p>
            </Offcanvas.Body>
        </>
    )

    return (
        <div>
            <Button variant='outline-success' onClick={handleShow}>
                <span className='mx-2'>
                    <LuCog size={22} />
                </span>
            </Button>
            <Offcanvas show={showSetting} onHide={() => setShowSetting(false)} placement="end" className="p-2">
                {!activeView && (
                    <>
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>System Settings</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <SettingsMenu onSelect={setActiveView} />
                        </Offcanvas.Body>
                    </>
                )}

                {activeView === 'company' && renderCompanyForm()}
                {activeView === 'customer' && renderCustomerForm()}
                {activeView === 'employee' && renderEmployeeForm()}
            </Offcanvas>

        </div>
    )


}






export default Settings
