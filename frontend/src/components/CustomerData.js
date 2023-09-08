/* import React, { useEffect, useState } from 'react'
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
} */

import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { toast } from 'react-toastify'
import { Table } from 'react-bootstrap';

const CustomerDataTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  async function getCustomerData(){
    try{
      const response = await axios.get('/api/multiple/customer-data')
      //console.log(response.data)
      setData(response.data)
    }catch(error){
      toast.error(error)
    }
  }
  useEffect(()=> {
    getCustomerData()
  }, []) 

  // Assuming 'data' is an array of customer summary objects
  const sortedData = data
    .slice()
    .sort((a, b) => b.totalAmount - a.totalAmount);

  // Number of rows to display per page
  const rowsPerPage = 10;

  // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Get the data for the current page
  const currentData = sortedData.slice(startIndex, endIndex);

  // Total number of pages
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Total Invoices</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item, index) => {
            let rowStyle = {}; // Default row style
            if (index === 0) {
              rowStyle = { backgroundColor: 'green' }; // First row in green
            } else if (index <= 5) {
              rowStyle = { backgroundColor: 'orange' }; // Next 5 rows in orange
            } else if (index <= 15) {
              rowStyle = { backgroundColor: '#f0f0f0' }; // Next 10 rows in pale color
            }

            return (
              <tr key={item._id} style={rowStyle}>
                <td>{item.name}</td>
                <td>{item._id}</td>
                <td>{item.totalInvoices}</td>
                <td>{item.totalAmount}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default CustomerDataTable;

