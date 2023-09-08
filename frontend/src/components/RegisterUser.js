import Axios  from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { toast } from 'react-toastify';
import { getError } from '../utils/getError';
import { Store } from '../utils/Store';
import { redirect, useNavigate } from 'react-router';

export default function RegisterUser() {

    const navigate = useNavigate()

    const [name, setName ]= useState('');
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setComfirmPassword] = useState('')

    const {state, dispatch: ctxDispatch} = useContext(Store);
    //const {userInfoToken} = state;

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
            navigate(redirect || '/sales')
        }catch(err){
            toast.error(getError(err))
        }
    }
  return (
    <Form className='w-50 m-auto p-md-4' onSubmit={submitHandler}>

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
        <Button className='mt-2 w-100' variant='warning' type='submit'>submit</Button>
      
    </Form>
  )
}
