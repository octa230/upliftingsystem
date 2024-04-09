
import React, { useReducer } from 'react';
import axios from 'axios'
import { toast } from 'react-toastify'
import  Table  from 'react-bootstrap/esm/Table';
import  Button  from 'react-bootstrap/esm/Button';
import  Form  from 'react-bootstrap/esm/Form';



const reducer =(state, action)=> {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return {...state, data: action.payload}
    case "FETCH_REQUEST":
      return {...state, loading: true};
    case "FETCH_FALSE":
      return {...state, loading: false, error: ''}
    default:
      return state;
  }
};


const CustomerDataTable = () => {

  const [state, dispatch] = useReducer(reducer,{
    error:"",
    data:[],
    loading: false
  })

  async function getCustomerData(){
    dispatch({type: "FETCH_REQUEST"})
    try{
      const {data} = await axios.get('/api/multiple/customer-data')
      dispatch({type: "FETCH_SUCCESS", payload: data})

    }catch(error){
      dispatch({type: "FETCH_FALSE"})
      toast.error(error)
    }
  }

  return (
    <div className='mt-2'>
      <h3>Aggregated CustomerData</h3>
      <Button onClick={()=>getCustomerData()}>View All</Button>
      <ul className='d-flex'>
        <li className='m-3'><strong>GREEN:</strong> BIGGEST TOTAL</li>
        <li className='m-3'><strong>ORANGE:</strong> NEXT TOP 5 TOTALS</li>
        <li className='m-3'><strong>PALE:</strong> NEXT 10 TOTALS</li>
      </ul>
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
          {state.data.map((item, index) => {
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

