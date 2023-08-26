
export const HandlePrint = (tableRef) => {
    if (tableRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write('<html><head><title>Damages and Display</title></head><body>');
      printWindow.document.write(`<h1>${new Date().toLocaleDateString('en-GB')}</h1>`);
      printWindow.document.write(tableRef.current.outerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };
