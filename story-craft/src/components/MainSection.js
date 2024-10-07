import React, { useState } from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import WorkItemList from './WorkItemList';

function MainSection() {
  const [filter, setFilter] = useState('');
  const [workItems, setWorkItems] = useState([]);

  // Handle file upload
  const handleUpload = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const json = JSON.parse(event.target.result);
      setWorkItems(json);
    };
    fileReader.readAsText(e.target.files[0]);
  };

  // Handle JSON download
  const handleDownload = () => {
    const dataStr = JSON.stringify(workItems, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workItems.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Update a work item
  const updateWorkItem = (updatedItem) => {
    const updateItems = (items) =>
      items.map((item) =>
        item.Title === updatedItem.Title
          ? updatedItem
          : { ...item, children: updateItems(item.children || []) }
      );
    setWorkItems(updateItems(workItems));
  };

  return (
    <Container style={{ marginTop: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <Button variant="contained" component="label">
          Upload JSON
          <input type="file" hidden accept=".json" onChange={handleUpload} />
        </Button>
        <Button variant="contained" onClick={handleDownload}>
          Download JSON
        </Button>
      </div>
      <TextField
        fullWidth
        label="Filter by Title"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        variant="outlined"
        style={{ marginBottom: '20px' }}
      />
      <WorkItemList
        items={workItems}
        filter={filter}
        updateWorkItem={updateWorkItem}
      />
    </Container>
  );
}

export default MainSection;
