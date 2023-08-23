import React,{useEffect, useState} from 'react'
import AggregatedDataTable from './AggregatedDamageTable'
import axios from 'axios';
import  Button  from 'react-bootstrap/esm/Button';

export default function Damages() {
  const [aggregatedData, setAggregatedData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    // Fetching aggregated data here and set it using setAggregatedData
   fetchData(currentPage)
  }, [currentPage]);

  async function fetchData(page){
    const {data} = await axios.get(`/api/damages/stats?page=${page}`)
    setAggregatedData(data.result)
    setTotalPages(data.totalPages)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  return (
    <div className="container mt-4">
    <h1>Aggregated Data</h1>
    {aggregatedData ? (
        <>
          <AggregatedDataTable data={aggregatedData} />
          <div>
            {Array.from({ length: totalPages }, (_, index) => (
              <Button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                variant="success"
                className="m-2 btn-sm"
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
  </div>
  )
}
