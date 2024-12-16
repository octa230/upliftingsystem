import { Container, Tabs, Form, Modal, Tab, Button } from 'react-bootstrap';
import Axios  from 'axios';
import React, { useContext, useState } from 'react'
import { toast } from 'react-toastify';
import { getError } from '../utils/getError';
import { Store } from '../utils/Store';
import { redirect, useNavigate } from 'react-router';



const EmployeeTab = () => {


    const navigate = useNavigate()
    const [name, setName ]= useState('');
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setComfirmPassword] = useState('')



    const {ispatch: ctxDispatch} = useContext(Store);




    async function submitHandler(e){
        e.preventDefault()
        if(password !== confirmPassword){
            toast.error('passwords don \'t match')
            return
        }

        try{
            const {data} = await Axios.post('/api/user/register', {
                name,
                email,
                password,
            })
            ctxDispatch({type: 'SIGN_IN', payload: data})
            localStorage.setItem('userInfoToken', JSON.stringify(data))
            toast.success('Account added successfully')
            navigate(redirect || '/dashboard')
        }catch(err){
            toast.error(getError(err))
        }
    }
    return(
        <Form>
            <Form.Text>Employee Tab</Form.Text>
            <Form.Group controlId='email'>
            <Form.Label>email</Form.Label>
            <Form.Control 
            type='email'
            required
            onChange={(e)=> setEmail(e.target.value)}
            />
        </Form.Group>
            
        <Form.Group controlId='userName'>
            <Form.Label>username</Form.Label>
            <Form.Control 
            type='name'   
            required
            onChange={(e)=> setName(e.target.value)}
            />
        </Form.Group>
        <Form.Group controlId='password'>
            <Form.Label>Password</Form.Label>
            <Form.Control 
            type='password'  
            required
            onChange={(e)=> setPassword(e.target.value)}
            />
        </Form.Group>
        <Form.Group controlId='confirmPassword'>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control 
            type='password'
            required
            onChange={(e)=> setComfirmPassword(e.target.value)}
            />
        </Form.Group>
        <Button className='mt-2 w-100' variant='warning' onClick={submitHandler}>submit</Button>
    </Form>
    )
}

const CustomerTab = () =>{
    

    return(
        <Form>
            <Form.Text>Customer Tab</Form.Text>
        </Form>
    )
}

const CompanyTab = () =>{
    

    return(
        <Form>
            <Form.Text>Company Tab</Form.Text>
        </Form>
    )
}



const Register = () => {
    const [show, setShow] = useState(false);
    const [selectedTab, setSelectedTab] = useState('company');
    
    return (
        <>
            <Button onClick={() => setShow(true)}>New Profile</Button>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>NEW PROFILE:{selectedTab.toUpperCase()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tab.Container fluid>
                    <Tabs fill
                        id='profile-tabs' 
                        activeKey={selectedTab}
                        onSelect={(k) => setSelectedTab(k)}
                        className='mb-3'
                    >
                        <Tab eventKey="company" title="Company">
                            <CompanyTab />
                        </Tab>
                        <Tab eventKey="customer" title="Customer">
                            <CustomerTab />
                        </Tab>
                        <Tab eventKey="employee" title="Employee">
                            <EmployeeTab />
                        </Tab>
                    </Tabs>
                    </Tab.Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Close
                    </Button>
{/*                     <Button variant="primary" onClick={handleSubmit}>
                        Submit
                    </Button> */}
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Register;