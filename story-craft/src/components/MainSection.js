import React, { useState } from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import WorkItemList from './WorkItemList';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import axios from 'axios';

function MainSection() {
  const [filter, setFilter] = useState('');
  const [workItems, setWorkItems] = useState([]);

  // New state variables for the dialog and inputs
  const [openDialog, setOpenDialog] = useState(false);
  const [pat, setPat] = useState('');
  const [organization, setOrganization] = useState('');
  const [project, setProject] = useState('');
  const [isPushing, setIsPushing] = useState(false);

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

  // Handle opening the dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Function to push a work item to Azure DevOps
  const pushWorkItem = async (workItem, parentId = null) => {
    // Corrected URL with '$' before the work item type
    const workItemType = workItem.WorkItemType.toLowerCase() === 'user story' ? 'User%20Story' : workItem.WorkItemType;
    const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/$${workItemType}?api-version=7.0`;

    const headers = {
      'Content-Type': 'application/json-patch+json',
      Authorization: `Basic ${btoa(`:${pat}`)}`,
    };

    const body = [
      { op: 'add', path: '/fields/System.Title', value: workItem.Title },
      { op: 'add', path: '/fields/System.Description', value: workItem.Description || '' },
    ];

    // Add Story Points if applicable
    if (workItem.StoryPoints !== undefined && workItem.StoryPoints !== null) {
      body.push({
        op: 'add',
        path: '/fields/Microsoft.VSTS.Scheduling.StoryPoints',
        value: Number(workItem.StoryPoints),
      });
    }

    // Add Remaining Work if applicable
    if (workItem.RemainingWork !== undefined && workItem.RemainingWork !== null) {
      body.push({
        op: 'add',
        path: '/fields/Microsoft.VSTS.Scheduling.RemainingWork',
        value: Number(workItem.RemainingWork),
      });
    }

    // Link to parent if parentId is provided
    if (parentId) {
      body.push({
        op: 'add',
        path: '/relations/-',
        value: {
          rel: 'System.LinkTypes.Hierarchy-Reverse',
          url: `https://dev.azure.com/${organization}/_apis/wit/workItems/${parentId}`,
        },
      });
    }

    try {
      const response = await axios.post(url, body, { headers });
      const createdWorkItemId = response.data.id;
      console.log(`Successfully pushed work item: ${workItem.Title} (ID: ${createdWorkItemId})`);

      // Recursively push child work items if any
      if (workItem.children && workItem.children.length > 0) {
        for (const childItem of workItem.children) {
          await pushWorkItem(childItem, createdWorkItemId);
        }
      }
    } catch (error) {
      console.error(`Failed to push work item: ${workItem.Title}`, error.response?.data || error.message);
    }
  };

  // Handle submitting the dialog
  const handleSubmit = async () => {
    if (!pat || !organization || !project) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsPushing(true);
    for (const workItem of workItems) {
      await pushWorkItem(workItem);
    }
    setIsPushing(false);
    setOpenDialog(false);
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
        <Button variant="contained" onClick={handleOpenDialog} disabled={isPushing}>
          {isPushing ? 'Pushing...' : 'Push to Azure DevOps'}
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

      {/* Dialog for Azure DevOps inputs */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Push to Azure DevOps</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Personal Access Token"
            type="password"
            fullWidth
            value={pat}
            onChange={(e) => setPat(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Organization"
            type="text"
            fullWidth
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Project"
            type="text"
            fullWidth
            value={project}
            onChange={(e) => setProject(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isPushing}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isPushing}>
            {isPushing ? 'Pushing...' : 'Push'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MainSection;
