import { Form, Modal, Button } from 'react-bootstrap';
import Axios from 'axios';
import { useState } from 'react'
import { toast } from 'react-toastify';
import { getError } from '../utils/getError';
import { LuUserPlus2 } from 'react-icons/lu';



const Register = () => {


    const [name, setName] = useState('');
    const [show, setShow] = useState(false)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setComfirmPassword] = useState('')



    const handleShow = ()=> setShow(!show)
    async function submitHandler(e) {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast.error('passwords don \'t match')
            return
        }

        try {
            const { data } = await Axios.post('/api/user/register', {
                name,
                email,
                password,
            })
            toast.success('Account added successfully')
        } catch (err) {
            toast.error(getError(err))
        }
    }
    return (
        <div>
        <Button variant='outline-dark'>
            <LuUserPlus2 onClick={handleShow} size={22}/>
        </Button>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={submitHandler}>
                        <Form.Text>Create a new user / employee of this system</Form.Text>
                        <Form.Group controlId='email'>
                            <Form.Label>email</Form.Label>
                            <Form.Control
                                type='email'
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId='userName'>
                            <Form.Label>username</Form.Label>
                            <Form.Control
                                type='name'
                                required
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId='password'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type='password'
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId='confirmPassword'>
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type='password'
                                required
                                onChange={(e) => setComfirmPassword(e.target.value)}
                            />
                        </Form.Group>
                        <Button className='mt-2 w-100' variant='warning' type='submit'>submit</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    )
}


export default Register