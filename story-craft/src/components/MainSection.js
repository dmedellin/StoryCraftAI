import React, { useState } from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import WorkItemList from './WorkItemList';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import axios from 'axios';

function MainSection() {
  const [filter, setFilter] = useState('');
  const [workItems, setWorkItems] = useState([]);

  // State variables for the push to Azure DevOps dialog
  const [openPushDialog, setOpenPushDialog] = useState(false);
  const [pat, setPat] = useState('');
  const [organization, setOrganization] = useState('');
  const [project, setProject] = useState('');
  const [isPushing, setIsPushing] = useState(false);

  // State variables for the OpenAI generation dialog
  const [openAIDialog, setOpenAIDialog] = useState(false);
  const [useAzureOpenAI, setUseAzureOpenAI] = useState(false);
  const [openAIKey, setOpenAIKey] = useState('');
  const [workloadDescription, setWorkloadDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  // Additional Azure OpenAI fields
  const [azureResourceName, setAzureResourceName] = useState('');
  const [azureDeploymentName, setAzureDeploymentName] = useState('');
  const [azureAPIVersion, setAzureAPIVersion] = useState('2023-03-15-preview'); // adjust as needed

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

  // Functions for the push to Azure DevOps dialog
  const handleOpenPushDialog = () => {
    setOpenPushDialog(true);
  };

  const handleClosePushDialog = () => {
    setOpenPushDialog(false);
  };

  // Function to push a work item to Azure DevOps
  const pushWorkItem = async (workItem, parentId = null) => {
    const workItemType =
      workItem.WorkItemType.toLowerCase() === 'user story'
        ? 'User%20Story'
        : workItem.WorkItemType;
    const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/$${workItemType}?api-version=7.0`;

    const headers = {
      'Content-Type': 'application/json-patch+json',
      Authorization: `Basic ${btoa(`:${pat}`)}`,
    };

    const body = [
      { op: 'add', path: '/fields/System.Title', value: workItem.Title },
      { op: 'add', path: '/fields/System.Description', value: workItem.Description || '' },
    ];

    if (workItem.StoryPoints !== undefined && workItem.StoryPoints !== null) {
      body.push({
        op: 'add',
        path: '/fields/Microsoft.VSTS.Scheduling.StoryPoints',
        value: Number(workItem.StoryPoints),
      });
    }

    if (workItem.RemainingWork !== undefined && workItem.RemainingWork !== null) {
      body.push({
        op: 'add',
        path: '/fields/Microsoft.VSTS.Scheduling.RemainingWork',
        value: Number(workItem.RemainingWork),
      });
    }

    if (workItem.AcceptanceCriteria) {
      body.push({
        op: 'add',
        path: '/fields/Microsoft.VSTS.Common.AcceptanceCriteria',
        value: workItem.AcceptanceCriteria,
      });
    }

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

      if (workItem.children && workItem.children.length > 0) {
        for (const childItem of workItem.children) {
          await pushWorkItem(childItem, createdWorkItemId);
        }
      }
    } catch (error) {
      console.error(
        `Failed to push work item: ${workItem.Title}`,
        error.response?.data || error.message
      );
    }
  };

  // Handle submitting the push to Azure DevOps dialog
  const handleSubmitPush = async () => {
    if (!pat || !organization || !project) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsPushing(true);
    for (const workItem of workItems) {
      await pushWorkItem(workItem);
    }
    setIsPushing(false);
    setOpenPushDialog(false);
  };

  // Functions for the OpenAI generation dialog
  const handleOpenAIDialog = () => {
    setOpenAIDialog(true);
  };

  const handleCloseAIDialog = () => {
    setOpenAIDialog(false);
  };

  const handleGenerate = async () => {
    if (!openAIKey || !workloadDescription) {
      alert('Please fill in all required fields.');
      return;
    }

    if (useAzureOpenAI && (!azureResourceName || !azureDeploymentName || !azureAPIVersion)) {
      alert('Please fill in all Azure OpenAI fields.');
      return;
    }

    setIsGenerating(true);

    const prompt = `
Generate a JSON structure representing epics, features, user stories, and tasks based on the following description:

"${workloadDescription}"

The JSON should follow this schema:
[
  {
    "WorkItemType": "Epic",
    "Title": "Epic Title",
    "Description": "Epic Description",
    "children": [
      {
        "WorkItemType": "Feature",
        "Title": "Feature Title",
        "Description": "Feature Description",
        "AcceptanceCriteria": "Acceptance criteria for the feature.",
        "children": [
          {
            "WorkItemType": "User Story",
            "Title": "User Story Title",
            "Description": "User Story Description",
            "AcceptanceCriteria": "Acceptance criteria for the user story.",
            "StoryPoints": Number,
            "children": [
              {
                "WorkItemType": "Task",
                "Title": "Task Title",
                "Description": "Task Description",
                "RemainingWork": Number
              }
            ]
          }
        ]
      }
    ]
  }
]

Ensure the output is valid JSON and matches the schema exactly.
`;


    try {
      let response;
      if (useAzureOpenAI) {
        // Use Azure OpenAI endpoint
        const url = `https://${azureResourceName}.openai.azure.com/openai/deployments/${azureDeploymentName}/chat/completions?api-version=${azureAPIVersion}`;
        response = await axios.post(
          url,
          {
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2048,
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-key': openAIKey,
            },
          }
        );
      } else {
        // Use OpenAI endpoint
        response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openAIKey}`,
            },
          }
        );
      }

      const aiOutput = response.data.choices[0].message.content.trim();
      const generatedWorkItems = JSON.parse(aiOutput);
      setWorkItems(generatedWorkItems);
      setIsGenerating(false);
      setOpenAIDialog(false);
    } catch (error) {
      console.error('Error generating work items:', error);
      alert('Failed to generate work items. Please check your API key and inputs, and try again.');
      setIsGenerating(false);
    }
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
        <Button variant="contained" onClick={handleOpenAIDialog} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate with AI'}
        </Button>
        <Button variant="contained" onClick={handleOpenPushDialog} disabled={isPushing}>
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

      {/* Dialog for OpenAI API key and workload description */}
      <Dialog open={openAIDialog} onClose={handleCloseAIDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Work Items with AI</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={useAzureOpenAI}
                onChange={(e) => setUseAzureOpenAI(e.target.checked)}
                color="primary"
              />
            }
            label="Use Azure OpenAI"
          />
          <TextField
            autoFocus
            margin="dense"
            label="API Key"
            type="password"
            fullWidth
            value={openAIKey}
            onChange={(e) => setOpenAIKey(e.target.value)}
          />
          {useAzureOpenAI && (
            <>
              <TextField
                margin="dense"
                label="Azure Resource Name"
                type="text"
                fullWidth
                value={azureResourceName}
                onChange={(e) => setAzureResourceName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Azure Deployment Name"
                type="text"
                fullWidth
                value={azureDeploymentName}
                onChange={(e) => setAzureDeploymentName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Azure API Version"
                type="text"
                fullWidth
                value={azureAPIVersion}
                onChange={(e) => setAzureAPIVersion(e.target.value)}
              />
            </>
          )}
          <TextField
            margin="dense"
            label="Workload Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={workloadDescription}
            onChange={(e) => setWorkloadDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAIDialog} disabled={isGenerating}>Cancel</Button>
          <Button onClick={handleGenerate} variant="contained" color="primary" disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Azure DevOps inputs */}
      <Dialog open={openPushDialog} onClose={handleClosePushDialog}>
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
          <Button onClick={handleClosePushDialog} disabled={isPushing}>Cancel</Button>
          <Button onClick={handleSubmitPush} variant="contained" color="primary" disabled={isPushing}>
            {isPushing ? 'Pushing...' : 'Push'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MainSection;
