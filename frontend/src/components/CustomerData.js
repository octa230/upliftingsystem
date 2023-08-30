import React, { useEffect, useState } from 'react'
import TableComponent from './Table'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function CustomerData() {
  const [data, setData] = useState([])

  const columns = ['_id', 'name', 'totalInvoices', 'totalAmount']

  async function getCustomerData(){
    try{
      const response = await axios.get('/api/multiple/customer-data')
      console.log(response.data)
      setData(response.data)
    }catch(error){
      toast.error(error)
    }
  }
  useEffect(()=> {
    getCustomerData()
  }, []) 


  return (
      <TableComponent data={data} columns={columns}/>
  )
}
