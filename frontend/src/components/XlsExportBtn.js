import React, { useState } from 'react'
import { Button } from 'react-bootstrap';
import * as xlsx from 'xlsx'

const XlsExportBtn = ({title='export', worksheetName="Sheet1", data=[], keysToInclude=null }) => {

    const [loading, setLoading] = useState(false);

    const handleExport = () => {

        setLoading(true);
        try {
            if(!data || !Array.isArray(data) || data.length === 0){
                console.error('Invalid data provided for export');
                return;
            }
            const filteredData = keysToInclude ? data.map(item => {
                const newItem = {};
                keysToInclude.forEach(key => {
                    newItem[key] = item[key];
                });
                return newItem;
            }) : data;
            const worksheet = xlsx.utils.json_to_sheet(filteredData);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, worksheetName);
            const fileName = `${title}.xlsx`;
            xlsx.writeFile(workbook, fileName);
            setLoading(false);
            console.log('Export successful:', fileName);
        } catch (error) {
            console.error("Error exporting to XLSX:", error);
            setLoading(false);
            return;
            
        }

        setLoading(false);
    }
  return <Button className='btn btn-success btn-md'
            onClick={handleExport}
            value={title}
            disabled={loading}>
        {title || 'Excel Export' (loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>)}
  </Button>
}

export default XlsExportBtn
