import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Form from 'react-bootstrap/esm/Form';
import Table from 'react-bootstrap/esm/Table';
import Button from 'react-bootstrap/esm/Button';
import Badge from 'react-bootstrap/esm/Badge';
import ListGroup from 'react-bootstrap/esm/ListGroup';
import MessageBox from './MessageBox'
import { useReactToPrint } from 'react-to-print';
import Select from 'react-select'
import _ from 'lodash'

export default function ProductsData() {

  const [date, setDate] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [results, setResults] = useState([])
  const [summary, setSummary] = useState(null)
  const [type, setType] = useState('')
  const [limit, setLimit] = useState(100)
  const [productName, setProductName] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const tableRef = useRef()

  const handleSearch = useCallback(
    _.debounce(async (query) => {
      // Add validation
      if (!query || typeof query !== 'string' || query.trim().length < 1) {
        setProducts([]);
        return;
      }

      try {
        console.log('Searching for:', query);
        const { data } = await axios.get(`/api/product/search?searchName=${encodeURIComponent(query.trim())}`);
        console.log('Search results:', data);
        setProducts(data || []);
      } catch (err) {
        console.error('Search error:', err);
        setProducts([]);
      }
    }, 300), // Reduced debounce time
    []
  );


  useEffect(() => {
    const getData = async () => {
      const params = new URLSearchParams({
        productName: productName,
        startDate: date.startDate,
        endDate: date.endDate,
        type: type || '',
        limit: limit.toString()
      })
      const { data } = await axios.get(`/api/transactions/records?${params}`)
      setResults(data.data || []);
      setSummary(data.totals);
    }
    getData()
  }, [productName, date.startDate, date.endDate, limit, type])


  const RoundTo = (num) => Math.round(num * 100 + Number.EPSILON) / 100 //====> 123.4567 - 123.45;
  const types = ['sale', 'display', 'damage', 'purchase']
  const limitsArr = [5, 10, 25, 50, 100]

  return (
    <div>
      <div className='my-3 d-flex flex-row gap-3 p-2'>
        <Form.Group>
          <Form.Label>Transaction</Form.Label>
          <Form.Control as='select' value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">---select---</option>
            {types.map((x, index) => (
              <option key={index} value={x}>
                {x}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Product</Form.Label>
          <Form.Control
            type="text"
            value={productQuery}
            onChange={(e) => {
              const value = e.target.value;
              setProductQuery(value);
              handleSearch(value);
              setShowDropdown(true); // 👈 toggle visibility
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search product"
          />

          {showDropdown && (
            <ListGroup style={{height: 100, zIndex: 100, borderWidth: 1, overflowY: "scroll"}}>
              {products.map(product => (
                <ListGroup.Item key={product._id} onClick={() => {
                  setProductName(product.name);
                  setProductQuery(product.name);
                  setShowDropdown(false);
                }}>
                  {product.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

        </Form.Group>
        <Form.Group>
          <Form.Label>Starting</Form.Label>
          <Form.Control type='date' value={date.startDate}
            onChange={(e) => setDate(prev => ({ ...prev, startDate: e.target.value }))} />
        </Form.Group>

        <Form.Group>
          <Form.Label>End</Form.Label>
          <Form.Control type='date' value={date.endDate}
            onChange={(e) => setDate(prev => ({ ...prev, endDate: e.target.value }))} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Limit</Form.Label>
          <Form.Control as='select' onChange={(e) => setLimit(Number(e.target.value))}>
            <option value="">---select---</option>
            {limitsArr.map((x, index) => (
              <option key={index} value={x}>
                {x}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        {summary !== null && (
        <div className='d-flex gap-3'>
          <Badge>Total Price: {RoundTo(summary.totalPrice)}</Badge>
          <Badge>Total Quantity: {summary.totalQuantity}</Badge>
        </div>
      )}
      </div>
      <Table striped bordered ref={tableRef}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Buying</th>
            <th>Selling</th>
            <th>Type</th>
            <th>Qty</th>
            <th className='d-flex justify-content-between'>
              <span>
                Date
              </span>
              <Button onClick={useReactToPrint({ content: () => tableRef.current })}>Print</Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {results && results.map(row => (
            <tr key={row._id}>
              <td>{row.productName}</td>
              <td>{row.purchasePrice}</td>
              <td>{row.sellingPrice}</td>
              <td>{row.type}</td>
              <td>{row.quantity}</td>
              <td>{new Date(row.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

    </div>
  )
}
