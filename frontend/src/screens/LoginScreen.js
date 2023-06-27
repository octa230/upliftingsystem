import React, { useContext, useEffect, useState } from 'react'
import {Button, Form} from 'react-bootstrap'
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getError } from '../utils/getError';
import { Store } from '../utils/Store';




export default function LoginScreen() {

  const navigate = useNavigate();
  const {search} = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect')
  const redirect = redirectInUrl ? redirectInUrl : '/dashboard';


  const [name, setUserName ] = useState('')
  const [password, setPassword ] = useState('')

  const {state, dispatch: ctxDispatch} = useContext(Store)
  const {userInfoToken} = state  

  const loginHandler = async(e)=>{
    e.preventDefault()
    try{
      const {data} = await axios.post('/api/user/login', {
        name,
        password
      })
      ctxDispatch({type: 'SIGN_IN', payload: data})
      localStorage.setItem('userInfoToken', JSON.stringify(data))
      navigate(redirect || '/')
      toast.success('Welcome')
    } catch(err) {
      toast.error('incorrect mail or password')
      toast.error(getError(err))
    }
  }

  useEffect(()=> { 
    if(userInfoToken){
      navigate(redirect)
    }
  }, [navigate, redirect, userInfoToken])


  return (
    <Form className='w-50 m-auto pt-4' onSubmit={loginHandler}>
    <Form.Text className='h-2'>LOGIN </Form.Text>
      <Form.Group className='mb-3' controlId='userName'>
        <Form.Label>username</Form.Label>
        <Form.Control placeholder='username' onChange={(e)=> setUserName(e.target.value)}/>
      </Form.Group>

      <Form.Group className='mb-3' controlId='password'>
        <Form.Label>Password</Form.Label>
        <Form.Control placeholder='password' onChange={(e)=> setPassword(e.target.value)}/>
      </Form.Group>
      <Button type='submit' variant='warning' className='w-100'>
        login
      </Button>
    </Form>
  )
}
