import { useState, useContext, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/esm/Form';
import Button from 'react-bootstrap/esm/Button';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';
import axios from 'axios';
import { Store } from '../utils/Store';
import { getError } from '../utils/getError';
import { BsCamera } from 'react-icons/bs';
import { round2 } from '../utils/helpers';
import { LuBan, LuCloud } from 'react-icons/lu'
import { toast } from 'react-toastify';
import { BsPlusSquare, BsFillTrash3Fill } from 'react-icons/bs';
import { Container } from 'react-bootstrap';
import CreatableSelect from 'react-select/creatable';

const SaleTable = () => {
  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [paidBy, setPaidBy] = useState('');
  const [service, setService] = useState('');
  const [name, setCustomerName] = useState(null); // Changed to null
  const [phone, setPhoneNumber] = useState(null); // Changed to null
  const [preparedBy, setPreparedBy] = useState('');
  const [discount, setDiscount] = useState(0);


  const time = new Date().toLocaleDateString('en-GB');
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfoToken } = state;

  const handleAddRow = () => {
    setProducts((prev) => [...prev, {name: null, price: 0, quantity: 1, arrangement: null, photo:'', loading: false }]);
  };

  const handleRemove = (idx) => {
    setProducts(prev => prev.filter((product, index) => index !== idx));
  }

  const handleReset = () => {
    setProducts([]);
  };

  const handleProductChange = (index, selectedOption) => {
    const newProducts = [...products];
    newProducts[index].name = selectedOption; // Store the whole object
    setProducts(newProducts);
  };

  //Table Arrangement Change
  const handleArrangementChange = (index, selectedOption) => {
    const newProducts = [...products];
    newProducts[index].arrangement = selectedOption; // Store the whole object
    setProducts(newProducts)
  }

  const handleQuantityChange = (index, event) => {
    const newProducts = [...products];
    newProducts[index].quantity = parseInt(event.target.value, 10) || 0;
    setProducts(newProducts);
  };
  
  const handlePriceChange = (index, event) => {
    const newProducts = [...products];
    newProducts[index].price = parseFloat(event.target.value, 10) || 0;
    setProducts(newProducts);
  };

  const uploadFileHandler = async (file) => {
    try {
      const bodyFormData = new FormData();
      bodyFormData.append('file', file);
      const { data } = await axios.post('/api/upload/', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userInfoToken.token}`,
        }
      });
      return data.secure_url;
    } catch (error) {
      getError(error);
    }
  };

  const handleCaptureImage = async (index, image) => {
    if (image) {
      // Create new products array and update loading state immediately
      setProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], loading: true };
        return newProducts;
      });

      try {
        const photoUrl = await uploadFileHandler(image);
        setProducts(prev => {
          const newProducts = [...prev];
          newProducts[index] = { ...newProducts[index], photo: photoUrl, loading: false };
          return newProducts;
        });
      } catch (error) {
        toast.error(error || 'Error occurred');
        setProducts(prev => {
          const newProducts = [...prev];
          newProducts[index] = { ...newProducts[index], loading: false };
          return newProducts;
        });
      }
    }
  };

  let totalWithoutVat = 0;
  const calculateSubTotal = () => {
    const itemsTotalWithVat = products.reduce((accumulator, product) => accumulator + (product.quantity * product.price), 0);
    let subTotal = itemsTotalWithVat;
    if (discount) {
      subTotal -= discount;
    }
    return totalWithoutVat = subTotal / 1.05;
  };

  const calculateVat = () => {
    const vat = round2(totalWithoutVat * (5 / 100));
    return vat;
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateVat();
  };

  const total = calculateTotal().toFixed(2);
  const subTotal = calculateSubTotal().toFixed(2);
  const vat = calculateVat().toFixed(2);

  const handleSave = async (e) => {
    e.preventDefault();
    if (window.confirm('Save & print invoice?')) {
      const selectFields = [name, phone, service, paidBy, preparedBy];
      // Extract values from select objects
      const submitProducts = products.map(p => ({
        ...p,
        name: p.name?.value || p.name,
        arrangement: p.arrangement?.value || p.arrangement
      }));
      
      const hasEmptyValues = selectFields.some((value) => !value);
      const hasNullValues = submitProducts.some(row => 
        !row.name || !row.arrangement || !row.price || !row.quantity || !row.photo
      );

      if (hasEmptyValues) {
        toast.error('Check Sale Fields for empty data');
        return;
      }
      if (hasNullValues) {
        toast.error('Check Table Data for empty values');
        return;
      }

      toast.promise(
        axios.post('/api/sale/new-sale', {
          products: submitProducts, 
          discount, 
          paidBy, 
          service, 
          name: name?.value || name, 
          phone: phone?.value || phone, 
          preparedBy, 
          total,
          time, 
          subTotal, 
          vat, 
        },
          { responseType: "blob", headers: { 'Accept': 'application/pdf' } }
        ).then((response) => {
          ctxDispatch({ type: "ADD_NEW_SALE", payload: response.data.sale });
          const blob = new Blob([response.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        }),
        {
          pending: "...please wait",
          success: "..success",
          error: "Oops try again"
        }
      );
    }
  };

  useEffect(() => {
    const getOptions = async () => {
      setIsLoading(true);
      const { data } = await axios.get(`/api/sale/options`);
      setOptions(data);
      setIsLoading(false);
    };
    getOptions();
  }, []);

  return (
    <Container fluid className=''>
      <Row className='d-flex justify-content-between p-3'>
        {/* Payment Method, Service, and Prepared By Selectors */}
        <Col sm={2}>
          <Form.Label>Paid By</Form.Label>
          <Form.Select onChange={(e) => setPaidBy(e.target.value)}>
            <option>Select...</option>
            <option>Card</option>
            <option>Cash</option>
            <option>Credit</option>
            <option>TapLink</option>
            <option>Bank Transfer</option>
            <option>F.O.C</option>
          </Form.Select>
        </Col>
        <Col sm={2}>
          <Form.Label>Service</Form.Label>
          <Form.Select onChange={(e) => setService(e.target.value)} required>
            <option>Select...</option>
            <option>Delivery</option>
            <option>Store Pick Up</option>
            <option>Website</option>
            <option>Insta-Shop</option>
            <option>Delivero</option>
            <option>Careem</option>
          </Form.Select>
        </Col>
        <Col sm={2}>
          <Form.Label>Prepared By</Form.Label>
          <Form.Select onChange={(e) => setPreparedBy(e.target.value)} required>
            <option>Choose...</option>
            <option>Joe</option>
            <option>Almira</option>
            <option>Allan</option>
            <option>Mahel</option>
          </Form.Select>
        </Col>

        {/* Customer Name and Phone Selectors */}
        <Col sm={2}>
          <Form.Label>Customer Name</Form.Label>
          <CreatableSelect
            options={options.names?.map(option => ({ value: option, label: option })) || []}
            isClearable
            isDisabled={isLoading}
            value={name}
            onChange={(selectedOption) => setCustomerName(selectedOption)}
          />
        </Col>
        <Col sm={2}>
          <Form.Label>Customer Tel</Form.Label>
          <CreatableSelect
            options={options.phones?.map(option => ({ value: option, label: option })) || []}
            isClearable
            value={phone}
            onChange={(selectedOption) => setPhoneNumber(selectedOption)}
          />
        </Col>
      </Row>

      <div style={{ display: 'flex', flexDirection: "column", maxWidth: 100, marginLeft: "auto", gap: 3 }}>
        <Button variant='warning' onClick={handleAddRow}>
          <BsPlusSquare size={18} /><span className='m-2'>Add</span>
        </Button>
        <Button variant='danger' onClick={handleReset}>
          <BsFillTrash3Fill size={18} />
        </Button>
        <Button disabled={!products.length} onClick={handleSave} variant='success'>
          <LuCloud size={18} /><span className='m-2'>Save</span>
        </Button>
      </div>

      <Table striped bordered responsive className='p-3 mt-3'>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Arrangement</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Photo</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td>
                <CreatableSelect
                  options={options.products?.map(option => ({ value: option, label: option })) || []}
                  value={product.name}
                  onChange={(selectedOption) => handleProductChange(index, selectedOption)}
                />
              </td>
              <td>
                <CreatableSelect
                  options={options.arrangements?.map(option => ({ value: option, label: option })) || []}
                  value={product.arrangement}
                  onChange={(selectedOption) => handleArrangementChange(index, selectedOption)}
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  name="price"
                  value={product.price || ''}
                  onChange={(event) => handlePriceChange(index, event)}
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  value={product.quantity || ''}
                  onChange={(event) => handleQuantityChange(index, event)}
                />
              </td>
              <td className='d-flex gap-3 justify-content-between'>
                <label htmlFor={`fileInput-${index}`} style={{ cursor: 'pointer' }}>
                  <BsCamera size={20} />
                </label>
                <input
                  id={`fileInput-${index}`}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(event) => handleCaptureImage(index, event.target.files[0])}
                  style={{ display: 'none' }}
                />
                {product.loading ? (<span>wait...</span>) : (product.photo && !product.loading && (<span>Done</span>))}
                <LuBan size={22} onClick={() => handleRemove(index)} color='tomato' style={{ cursor: 'pointer' }} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="p-3" aria-colspan={5}>
          <tr>
            <th>NET AMOUNT</th>
            <td>{subTotal}</td>
          </tr>
          <tr>
            <th>Discount</th>
            <td>
              <Form.Control
                type="number"
                style={{ width: '12rem' }}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="Discount"
              />
            </td>
          </tr>
          <tr>
            <th>VAT</th>
            <td>{vat}</td>
          </tr>
          <tr>
            <th>Total</th>
            <td>{total}</td>
          </tr>
        </tfoot>

      </Table>
    </Container>
  );
};

export default SaleTable;