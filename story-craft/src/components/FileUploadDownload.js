import React from 'react';
import Button from '@mui/material/Button';

function FileUploadDownload({ handleUpload, handleDownload }) {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
      <Button variant="contained" component="label">
        Upload JSON
        <input type="file" hidden accept=".json" onChange={handleUpload} />
      </Button>
      <Button variant="contained" onClick={handleDownload}>
        Download JSON
      </Button>
    </div>
  );
}

export default FileUploadDownload;
