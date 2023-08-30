import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Pagination } from 'react-bootstrap';

const AggregatedSaleDetails = () => {
  const [aggregatedData, setAggregatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust as needed

  

  useEffect(() => {
    const fetchData = async () => {
        try {
          const response = await axios.get(`/api/multiple/aggregated-sale-data?page=${currentPage}&itemsPerPage=${itemsPerPage}`);
          setAggregatedData(response.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    fetchData();
  }, [currentPage]);

  const totalPages = Math.ceil(aggregatedData.length / itemsPerPage);

  const handlePaginationClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleData = aggregatedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Container>
      <h1>Aggregated Data View</h1>
      {visibleData.map((aggregationGroup, index) => (
        <div key={index}>
          <h2>Service Aggregation</h2>
          {aggregationGroup.serviceAggregation.map((fieldAggregation, index) => (
            <Card key={index} className="mb-3">
              <Card.Header>{fieldAggregation._id}</Card.Header>
              <Card.Body>
                <Row>
                  <Col>Total Count: {fieldAggregation.totalCount}</Col>
                  <Col>Total Amount: {fieldAggregation.totalAmount}</Col>
                  <Col>Rounded Sum: {fieldAggregation.roundedSum}</Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
            <h2>PreparedBy Aggregation</h2>
          {aggregationGroup.preparedByAggregation.map((fieldAggregation, index) => (
            <Card key={index} className="mb-3">
              <Card.Header>{fieldAggregation._id}</Card.Header>
              <Card.Body>
                <Row>
                  <Col>Total Count: {fieldAggregation.totalCount}</Col>
                  <Col>Total Amount: {fieldAggregation.totalAmount}</Col>
                  <Col>Rounded Sum: {fieldAggregation.roundedSum}</Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

    {/*         <h2>phoneAggregation</h2>
          {aggregationGroup.phoneAggregation.map((fieldAggregation, index) => (
            <Card key={index} className="mb-3">
              <Card.Header>{fieldAggregation._id}</Card.Header>
              <Card.Body>
                <Row>
                  <Col>Total Count: {fieldAggregation.totalCount}</Col>
                  <Col>Total Amount: {fieldAggregation.totalAmount}</Col>
                  <Col>Rounded Sum: {fieldAggregation.roundedSum}</Col>
                </Row>
              </Card.Body>
            </Card>
          ))} */}
          
          

          {/* Similar rendering for preparedByAggregation and phoneAggregation */}
        </div>
      ))}

      <Pagination>
        <Pagination.Prev onClick={() => handlePaginationClick(currentPage - 1)} disabled={currentPage === 1} />
        {Array.from({ length: totalPages }, (_, index) => (
          <Pagination.Item
            key={index}
            active={index + 1 === currentPage}
            onClick={() => handlePaginationClick(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => handlePaginationClick(currentPage + 1)} disabled={currentPage === totalPages} />
      </Pagination>
    </Container>
  );
};

export default AggregatedSaleDetails;
