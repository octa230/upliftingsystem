import { useContext, useEffect, useState } from 'react'
import { Button, Container, Form, Spinner, Alert, Col, Image, Card, Row } from 'react-bootstrap'
import { LuMoveRight, LuTrash2 } from 'react-icons/lu'
import { uploadFileHandler } from '../utils/helpers'
import { Store } from '../utils/Store'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getError } from '../utils/getError'

const GalleryScreen = () => {
    const [item, setItem] = useState({
        photo: '',
        price: 0,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [gallery, setGallery] = useState([])

    const { state } = useContext(Store)
    const { userInfoToken } = state

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setLoading(true)
            setError(null)

            const fileUrl = await uploadFileHandler(file, userInfoToken)
            setItem((prev) => ({ ...prev, photo: fileUrl }))

        } catch (err) {
            console.error(err)
            setError('File upload failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handlePriceChange = (e) => {
        setItem((prev) => ({ ...prev, price: Number(e.target.value) }))
    }

    const handleSubmit = async () => {
        try {
            const { data } = await axios.post('/api/product/new', {
                price: item.price,
                photo: item.photo,
                identifier: 'ARRANGEMENT'
            })
            console.log(data)
            toast.success('product added successfully');
            setGallery([...gallery, data.product])
        } catch (error) {
            toast.error(getError(error))
        }
    }


    useEffect(() => {
        const getData = async () => {
            const { data } = await axios.get(`/api/product/gallery`)
            setGallery(data)
        }
        getData()
    }, [])


    const handleDelete = async (_id) => {
        try {
            if (window.confirm('delete item from gallery?')) {
                const { data } = await axios.delete(`/api/product/delete/${_id}`)
                toast.success(data)
                setGallery(gallery.filter(item => item._id !== _id))
            }
        } catch (error) {
            toast.error(getError(error))
        }
    }


    return (
        <Container className='py-4'>
            <Form className="d-flex align-items-center gap-3 border rounded px-3 justify-content-between">
                <Form.Group className='mb-3'>
                    <Form.Label>Upload Photo</Form.Label>
                    <Form.Control
                        type='file'
                        onChange={handleFileUpload}
                        disabled={loading}
                    />
                </Form.Group>

                <Form.Group className='mb-3'>
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                        type='number'
                        value={item.price}
                        onChange={handlePriceChange}
                    />
                </Form.Group>

                {loading && <Spinner animation='border' variant='primary' />}
                {error && <Alert variant='danger'>{error}</Alert>}
                {item.photo && (<Image src={item.photo} alt='gallery-product' className='thumbnail' height={50} width={50} />)}
                <Button variant='danger' className='border border-rounded' onClick={handleSubmit}>
                    <LuMoveRight />
                </Button>
            </Form>
                <Row className="g-4"> {/* g-4 adds some spacing between the columns */}
                    {gallery?.map((pdct, index) => (
                        <Col key={index} xs={12} sm={6} md={4} className='pt-3'>
                            <Card>
                                <Card.Img
                                    variant="top"
                                    src={pdct.photo}
                                    width={280}
                                    height={280}
                                    style={{ objectFit: "contain" }}
                                />
                                <Card.Body className='d-flex justify-content-between'>
                                    <Card.Text>Price: {pdct.price}</Card.Text>
                                    <LuTrash2 size={28} color='tomato' onClick={()=> handleDelete(pdct._id)}/>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
        </Container>
    )
}

export default GalleryScreen
