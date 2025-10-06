import { useContext, useState, useEffect } from 'react'
import { Store } from '../utils/Store'
import Col from 'react-bootstrap/esm/Col'
import Stack from 'react-bootstrap/esm/Stack'
import Form from 'react-bootstrap/esm/Form'
import ListGroup from 'react-bootstrap/esm/ListGroup'
import Container from 'react-bootstrap/esm/Container'
import Button from 'react-bootstrap/esm/Button'
import { toast } from 'react-toastify'
import { BsXCircle } from 'react-icons/bs'
import axios from 'axios'
import Alert from 'react-bootstrap/esm/Alert'
import { BsPaperclip } from 'react-icons/bs'
import SaleDetailsModal from '../components/SaleDetailsModal'
import MessageBox from '../components/MessageBox'
import { FaEye } from 'react-icons/fa'
import { getError } from '../utils/getError'
import { LuCheckCircle2, LuTrash2 } from 'react-icons/lu'

const FilingScreen = () => {
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const { selectedItems, todaySales } = state

  const recordTypes = ['purchase', 'sale', 'damage', 'hotel', 'returned', 'purchase_order']

  const [recordType, setRecordType] = useState('')
  const [itemQuantities, setItemQuantities] = useState({})
  const [deliveryNote, setdeliveryNote] = useState('')
  const [orderFrom, setOrderFrom] = useState('')
  const [invoices, setInvoices] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState({})
  const [arrangement, setArrangement] = useState('')
  const [showSale, setShow] = useState({})
  const [purchase, setPurchase] = useState({})
  const [newTotal, setNewTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (recordType === 'sale') {
      (async () => {
        const { data } = await axios.get(`/api/sale/today-sales`)
        setInvoices(data)
        const storedSale = await JSON.parse(localStorage.getItem('selectedSale'))
        if (storedSale && !selectedSale._id) {
          setSelectedSale(storedSale)
        }
      })()
    }
  }, [recordType, todaySales])

  const getPurchase = async (e) => {
    if (deliveryNote !== '') {
      try {
        const { data } = await axios.get(`/api/transactions/${deliveryNote}`)
        setPurchase(data)
      } catch (error) {
        toast.error(getError(error))
      }
    }
  }

  const handleQuantityChange = (itemId, value) => {
    setItemQuantities(prevState => ({
      ...prevState,
      [itemId]: value
    }))
  }

  const handleViewSale = async (saleId) => {
    try {
      const result = await axios.get(`/api/sale/get-sale/${saleId}`)
      setShow(result.data)
      setShowModal(true)
    } catch (error) {
      toast.error(getError(error))
    }
  }

  // FIX: Properly map selectedItems array
  const selectedProducts = selectedItems?.map(item => ({
    product: item._id,
    productName: item.name,
    purchasePrice: item.purchasePrice,
    quantity: itemQuantities[item._id] || 0
  }))
  
  const calculateTotal = (products) => {
    return products.reduce((total, product) => {
      return total + (product.quantity * product.purchasePrice)
    }, 0)
  }

  const handleSubmit = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      switch (recordType) {
        case "purchase":
          const total = calculateTotal(selectedProducts)
          if (!deliveryNote) {
            toast.error('Add delivery note number')
            setLoading(false)
            return
          }
          await axios.post('/api/transactions/purchase', {
            selectedProducts,
            deliveryNote,
            total
          })
          toast.success('Done')
          break

        case "sale":
          await axios.post(`/api/sale/${selectedSale._id}/add-units`, {
            selectedProducts,
            unitName: arrangement
          })
          localStorage.removeItem('selectedSale')
          toast.success('Done')
          break

        case "damage":
          await axios.post('/api/transactions/damages', {
            selectedProducts
          })
          toast.success('Done')
          break

        case "hotel":
          toast.error('still building')
          break

        case "returned":
          if (purchase.Items && deliveryNote) {
            await axios.put(`/api/transactions/${deliveryNote}`, {
              purchase,
              total: newTotal,
              type: recordType
            })
            toast.success('Done')
          }
          break

        case "purchase_order":
          if (purchase.Items && deliveryNote) {
            await axios.put(`/api/transactions/${deliveryNote}`, {
              purchase,
              total: newTotal,
              type: recordType
            })
            toast.success('Done')
          }
          break

        default:
          toast.error('Unknown action')
          break
      }
    } catch (error) {
      toast.error('Something went wrong')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const removeItemHandler = (item) => {
    const newselectedItems = selectedItems.filter((x) => x._id !== item._id)
    ctxDispatch({ type: "REMOVE_SELECTED_ITEM", payload: newselectedItems })
  }

  const removePurchaseItem = (item) => {
    const newItems = purchase?.Items.filter((x) => x.product !== item.product)
    const total = newItems.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0)

    setPurchase(prevState => ({
      ...prevState,
      Items: newItems,
      total: total
    }))

    setNewTotal(total)
  }

  const handleReturnChange = (productId, newQuantity) => {
    setPurchase(prevState => {
      const updatedItems = prevState.Items.map(item =>
        item.product === productId ? { ...item, quantity: parseInt(newQuantity) } : item
      )
      const updatedTotal = updatedItems.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0)

      setNewTotal(updatedTotal)
      return {
        ...prevState,
        Items: updatedItems,
        total: updatedTotal
      }
    })
  }

  const addSale = async (saleId) => {
    try {
      const { data } = await axios.get(`/api/sale/get-sale/${saleId}`)
      setSelectedSale(data)
      localStorage.setItem('selectedSale', JSON.stringify(data))
      toast.success('Sale attached successfully')
    } catch (error) {
      toast.error(getError(error))
    }
  }

  const clearSelectedItems = () => {
    ctxDispatch({ type: "CLEAR_SELECTED_ITEMS" })
    setItemQuantities({})
  }

  return (
    <Container fluid className='my-2'>
      <div className='d-flex justify-content-between'>
        <div>
          <Form.Label>Record Type</Form.Label>
          <Form.Select as='select' onChange={(e) => setRecordType(e.target.value)} value={recordType}>
            <option>---select---</option>
            {recordTypes.map((record, index) => (
              <option key={index}>{record}</option>
            ))}
          </Form.Select>
        </div>

        <div>
          {(() => {
            switch (recordType) {
              case "purchase":
                return (
                  <Form.Group>
                    <Form.Label>Delivery Note Number</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='invoice / Delivery Note Number'
                      value={deliveryNote}
                      onChange={(e) => setdeliveryNote(e.target.value)}
                    />
                  </Form.Group>
                )

              case "returned":
                return (
                  <Form.Group>
                    <Form.Label>Delivery Note Number</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='invoice / Delivery Note Number'
                      value={deliveryNote}
                      onChange={(e) => setdeliveryNote(e.target.value)}
                    />
                    <Button onClick={getPurchase} className='p-1 m-2'>Find</Button>
                  </Form.Group>
                )

              case "purchase_order":
                return (
                  <Form.Group>
                    <Form.Label>Send Purchase Order To</Form.Label>
                    <Form.Control
                      type='text'
                      value={orderFrom}
                      onChange={(e) => setOrderFrom(e.target.value)}
                    />
                  </Form.Group>
                )

              case "damage":
                return <div>File Selected Items As Damage</div>

              case "sale":
                return selectedSale && (
                  <div>
                    <Alert variant="success">
                      {selectedSale.InvoiceCode || "No Invoice"}
                    </Alert>
                    <Form.Group>
                      <Form.Label>Arrangement</Form.Label>
                      <Form.Control
                        as='select'
                        value={arrangement}
                        onChange={(e) => setArrangement(e.target.value)}
                      >
                        <option>--select--</option>
                        {selectedSale.saleItems?.map((item) => (
                          <option key={item._id}>{item.arrangement}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </div>
                )

              default:
                return <div>Select Record Type</div>
            }
          })()}
        </div>

        <div>
          <Stack className='gap-3'>
            <Button
              className='btn-sm'
              onClick={clearSelectedItems}
              variant='warning'>
              Clear <LuTrash2 size={22} color='red' />
            </Button>
            <Button onClick={handleSubmit} variant='danger' disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'} <LuCheckCircle2 size={22} color='#eaefef'/>
            </Button>
          </Stack>
        </div>
      </div>

      <ListGroup className='my-3'>
        {/* FIX: Check if selectedItems exists and has length */}
        {selectedItems && selectedItems.length > 0 && selectedItems.map((item) => (
          <ListGroup.Item key={item._id} className='d-flex my-1 justify-content-between'>
            <Col>{item.name}</Col>
            {/* FIX: Corrected condition - was using || instead of === */}
            {(recordType === 'purchase' || recordType === 'purchase_order') ? (
              <Col>
                <Form.Control 
                  type='number'
                  value={itemQuantities[item._id] || ''}
                  onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                  placeholder='input qty'
                />
              </Col>
            ) : (
              <Col>
                <Form.Control 
                  as="select"
                  value={itemQuantities[item._id] || ''}
                  onChange={(e) => handleQuantityChange(item._id, e.target.value)}>
                  <option>--select--</option>
                  {[...Array(item?.inStock || 0).keys()].map((val) => (
                    <option key={val + 1} value={val + 1}>{val + 1}</option>
                  ))}
                </Form.Control>
              </Col>
            )}
            <Col>
              <Button variant='outline-secondary' onClick={() => removeItemHandler(item)}>
                <BsXCircle />
              </Button>
            </Col>
          </ListGroup.Item>
        ))}
      </ListGroup>

      <div className='my-3'>
        {recordType === "sale" ? (
          <ListGroup className='my-3'>
            {invoices?.map((invoice) => (
              <ListGroup.Item className='d-flex justify-content-between' key={invoice?.InvoiceCode}>
                <Button onClick={() => handleViewSale(invoice._id)} className='bg-primary border'>
                  <span className='px-1'>
                    <FaEye />
                  </span>
                  {invoice?.InvoiceCode}
                </Button>
                <div>
                  <Button variant='warning' onClick={() => addSale(invoice._id)}>
                    <BsPaperclip />
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <MessageBox>Not Required</MessageBox>
        )}
        <SaleDetailsModal show={showModal} onHide={() => setShowModal(false)} selectedSale={showSale} />
      </div>

      {recordType === 'returned' && purchase.Items && (
        <ListGroup>
          {purchase.Items.map((item) => (
            <ListGroup.Item key={item.product} className='d-flex my-1 justify-content-between'>
              <Col>{item.productName}</Col>
              <Col>
                <Form.Control 
                  as="select"
                  value={itemQuantities[item.product] || item.quantity}
                  onChange={(e) => handleReturnChange(item.product, e.target.value)}>
                  <option>--select--</option>
                  {[...Array(item.quantity).keys()].map((val) => (
                    <option key={val + 1} value={val + 1}>{val + 1}</option>
                  ))}
                </Form.Control>
              </Col>
              <Col>
                <Button variant='' onClick={() => removePurchaseItem(item)}>
                  <BsXCircle />
                </Button>
              </Col>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  )
}

export default FilingScreen