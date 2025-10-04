import React, { useState, useEffect } from 'react'
import { Button, Card, Form, Table } from 'react-bootstrap'
import { BsCardText, BsCheck2Circle, BsInfoCircle, BsPrinterFill } from 'react-icons/bs'
import axios from 'axios'
import Chart from 'react-google-charts'
import Calculator from '../components/Calculator'

const Expenses = () => {
  const [account, setAccount] = useState({
    name: '',
    type: '',
  })

  const [expense, setExpense] = useState({
    amount: Number,
    account: '',
    employee: '',
    submittedOn: new Date().toISOString().split('T')[0],
    billFile: '',
    notes: '',
  })
  const [selectedFile, setSelectedFile] = useState('')
  const [expenses, setExpenses] = useState([])
  const [showNotes, setShowNotes] = useState(false)
  const [users, setUsers] = useState([])
  const [expense_Accs, setExpense_Accs] = useState([])
  const [file, setFile] = useState(Boolean)
  const [summaryData, setSummaryData] = useState({ PieData: [], ColumnData: [] });
  const [queryKeys, setQueryKeys] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    account: ""
  })

  const types = ['Utilities', 'Supplies', 'Personal', 'Others']

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Just store the File object
      setFile(true);
    }
  };

  const uploadBill = async () => {
    if (file && selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile); // Append the actual file

      try {
        const response = await axios.post('/api/upload/bill', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data) {
          setExpense(prev => ({ ...prev, billFile: response.data.filePath }));
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const [users, Exp_Accs, Expenses] = await Promise.all([
        axios.get(`/api/user`),
        axios.get(`/api/expenses/accounts`),
        axios.get(`/api/expenses`, {
          params: {
            startDate: queryKeys.startDate,
            endDate: queryKeys.endDate
          }
        }),
      ])
      setUsers(users.data)
      setExpense_Accs(Exp_Accs.data)
      setExpenses(Expenses.data)
    }
    fetchData()
  }, [queryKeys.startDate, queryKeys.endDate])

  useEffect(() => {
    const fetchSummaryData = async () => {
      const { data } = await axios.get('/api/expenses/summary', {
        params: {
          account: queryKeys.account,
          startDate: queryKeys.startDate,
          endDate: queryKeys.endDate
        }
      });
      setSummaryData(data);
    };

    fetchSummaryData();
  }, [queryKeys.account, queryKeys.startDate, queryKeys.endDate]);


  const submitAccount = async () => {
    const { data } = await axios.post('/api/expenses/new-account', account)
    setExpense_Accs((prev => ([...prev, data])))
    setAccount({ name: '', type: '' })
  }

  const submitExpense = async () => {
    const { data } = await axios.post(`/api/expenses/new-expense`, expense)
    setExpenses((prev => ([...prev, data])))
  }


  const getBill = async (expenseId) => {
    const { data } = await axios.get(`/api/expenses/bill/${expenseId}`, {
      responseType: "blob"
    })
    const fileURL = URL.createObjectURL(data)
    window.open(fileURL, '_blank')
  }


  const exportExpenses =async()=>{
    const {data} = await axios.post(`/api/expenses/print-report`,{
      expenses
    },
    {responseType: 'blob'})
    const fileURL = URL.createObjectURL(data)
    window.open(fileURL, '_blank')
  }


  return (
    <>
      <div className='d-flex gap-3 p-md-3 justify-content-between'>
        <div className='border p-2 rounded shadow-sm w-25'>

          {/**CREATE EXPENSE ACCOUNT */}
          <Form className='mb-2'>
            <div className='d-flex justify-content-between'>
              <Form.Text>New Expense Account</Form.Text>
              {account.name && account.type && (
                <Button variant='success btn-sm' onClick={submitAccount}>
                  <BsCheck2Circle size={33} color='#fafafa' />
                </Button>
              )}
            </div>
            <Form.Group>
              <Form.Label>Expense Account Name</Form.Label>
              <Form.Control value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Expense Account Type</Form.Label>
              <Form.Select onChange={(e) => setAccount({ ...account, type: e.target.value })}>
                <option>--select--</option>
                {types?.map((t) => (
                  <option value={t}>{t}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>

          {/**CALCULATOR */}

          <Calculator/>
        </div>


        {/**MONTHLY EXPENSE SUMMARY*/}

        <div className='rounded p-2 w-50 border shadow-sm'>
          <div className='d-flex justify-content-between gap-2 p-2'>
            <div className='w-50'>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type='date'
                value={queryKeys.startDate}
                onChange={(e) => setQueryKeys((prev => ({ ...prev, startDate: e.target.value })))}
              />


              <Chart chartType='PieChart'
                options={{ title: "Expense Summary", pieHole: 0.4, is3D: true, legend: { position: "bottom", alignment: "center" } }}
                data={summaryData.PieData}
                width={"100%"}
                height={"400px"}
              />
            </div>
            <div className='w-50'>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type='date'
                value={queryKeys.endDate}
                onChange={(e) => setQueryKeys((prev => ({ ...prev, endDate: e.target.value })))}
              />
              <Chart chartType="ColumnChart"
                options={{ title: "Accounts Summary", legend: { position: "bottom", alignment: "center" } }}
                data={summaryData.ColumnData}
                width={"100%"}
                height={"400px"}
              />
            </div>
          </div>
          <Card.Text className='bottom-1'>
            <h3>Total: {((expenses.reduce((acc, curr) => acc + (curr.amount), 0)))}</h3>
          </Card.Text>
        </div>

        {/**CREATE NEW EXPENSE */}

        <div className='border p-2 rounded w-25 shadow-sm'>
          <Form className='flex-grow-1'>
            <Form.Text as='h3'>New Expense</Form.Text>
            <Form.Group>
              <Form.Label>Expense Amount</Form.Label>
              <Form.Control value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Expense Account</Form.Label>
              <Form.Select onChange={(e) => setExpense({ ...expense, account: e.target.value })}>
                <option>--select--</option>
                {expense_Accs?.map((t, index) => (
                  <option value={t._id} key={index}>{t.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Employee</Form.Label>
              <Form.Select
                value={expense.employee}
                onChange={(e) => setExpense({ ...expense, employee: e.target.value })}>
                <option>--select--</option>
                {users?.map((employee, index) => (
                  <option key={index} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
                value={expense.submittedOn}
                type='date'
                onChange={(e) => setExpense({ ...expense, submittedOn: e.target.value })} />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>UploadBill</Form.Label>
              <Form.Control
                type='file'
                accept='image/*,application/pdf'
                onChange={handleFileChange}
              />
              {file &&
                <Button disabled={!file} onClick={uploadBill}>
                  upload File
                </Button>
              }
            </Form.Group>
            {showNotes && (
              <Form.Control className='mb-2'
                as='textarea'
                rows={6}
                placeholder='Add Notes for this Expense '
                value={expense.notes}
                onChange={(e) => setExpense({ ...expense, notes: e.target.value })}
              />
            )}
            <div className='gap-2'>
              <Button variant='outline-success' onClick={submitExpense}>Submit</Button>
              <Button className='mx-2' variant='outline-success' onClick={() => setShowNotes(!showNotes)}>Add Notes</Button>
            </div>
          </Form>
        </div>
      </div>

      {/**DAILY EXPENSE TABLE */}

      <div className='d-flex justify-content-end mx-3'>
        {expenses?.length && (
          <Button onClick={exportExpenses} variant='outline-primary'>
            Export <BsPrinterFill />
          </Button>
        )}
      </div>
      <Table striped responsive className='table-sm'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Bill</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {expenses?.map((expense, index) => (
            <tr key={index}>
              <td className='text-capitalize'>{expense?.account.name}</td>
              <td>{expense?.amount}</td>
              <td>{new Date(expense?.submittedOn).toDateString()}</td>
              <td>{expense?.billFile ? <BsCardText size={22} color='green' onClick={() => getBill(expense?._id)} /> : <BsInfoCircle size={22} color='tomato' />}</td>
              <td>{expense?.status || "Pending"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default Expenses
