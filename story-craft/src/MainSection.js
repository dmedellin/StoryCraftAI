import React, { useState } from 'react';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WorkItemList from './components/WorkItemList';
import OpenAIDialog from './components/OpenAIDialog';
import AzureDevOpsPushDialog from './components/AzureDevOpsPushDialog';
import axios from 'axios';

function MainSection() {
  const [workItems, setWorkItems] = useState([]);
  const [openPushDialog, setOpenPushDialog] = useState(false);
  const [openAIDialog, setOpenAIDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pat, setPat] = useState('');
  const [organization, setOrganization] = useState('');
  const [project, setProject] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [openAIKey, setOpenAIKey] = useState('');
  const [workloadDescription, setWorkloadDescription] = useState('');
  const [useAzureOpenAI, setUseAzureOpenAI] = useState(false);
  const [azureOpenAIUrl, setAzureOpenAIUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Update work items
  const updateWorkItem = (updatedItem) => {
    const updateItems = (items) =>
      items.map((item) =>
        item.Title === updatedItem.Title
          ? updatedItem
          : { ...item, children: updateItems(item.children || []) }
      );
    setWorkItems(updateItems(workItems));
  };

  // Handle pushing to Azure DevOps
  const handleSubmitPush = async () => {
    if (!pat || !organization || !project) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsPushing(true);

    // Function to push each work item
    const pushWorkItem = async (workItem, parentId = null) => {
      const workItemType = workItem.WorkItemType.toLowerCase() === 'user story'
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

        // Recursively push child work items
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

    for (const workItem of workItems) {
      await pushWorkItem(workItem);
    }

    setIsPushing(false);
    setOpenPushDialog(false);
  };

  // Handle generating work items with OpenAI
  const handleGenerate = async () => {
    if (!openAIKey || !workloadDescription) {
      alert('Please fill in all required fields.');
      return;
    }

    if (useAzureOpenAI && !azureOpenAIUrl) {
      alert('Please provide the Azure OpenAI URL.');
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
              "children": [
                {
                  "WorkItemType": "User Story",
                  "Title": "User Story Title",
                  "Description": "User Story Description",
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
    `;

    try {
      let response;
      if (useAzureOpenAI) {
        // Use Azure OpenAI endpoint
        response = await axios.post(
          azureOpenAIUrl,
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

  // Menu handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container style={{ marginTop: '20px' }}>
      {/* Menu button to handle actions */}
      <IconButton
        aria-label="more"
        aria-controls="action-menu"
        aria-haspopup="true"
        onClick={handleMenuOpen}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="action-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem>
          <label style={{ cursor: 'pointer' }}>
            Upload JSON
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleUpload}
              onClick={handleMenuClose}
            />
          </label>
        </MenuItem>
        <MenuItem onClick={() => { handleDownload(); handleMenuClose(); }}>Download JSON</MenuItem>
        <MenuItem onClick={() => { setOpenAIDialog(true); handleMenuClose(); }}>Generate with AI</MenuItem>
        <MenuItem onClick={() => { setOpenPushDialog(true); handleMenuClose(); }}>Push to Azure DevOps</MenuItem>
      </Menu>

      <WorkItemList items={workItems} updateWorkItem={updateWorkItem} />

      {/* OpenAI Generation Dialog */}
      <OpenAIDialog
        open={openAIDialog}
        onClose={() => setOpenAIDialog(false)}
        openAIKey={openAIKey}
        setOpenAIKey={setOpenAIKey}
        workloadDescription={workloadDescription}
        setWorkloadDescription={setWorkloadDescription}
        useAzureOpenAI={useAzureOpenAI}
        setUseAzureOpenAI={setUseAzureOpenAI}
        azureOpenAIUrl={azureOpenAIUrl}
        setAzureOpenAIUrl={setAzureOpenAIUrl}
        handleGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

      {/* Azure DevOps Push Dialog */}
      <AzureDevOpsPushDialog
        open={openPushDialog}
        onClose={() => setOpenPushDialog(false)}
        pat={pat}
        setPat={setPat}
        organization={organization}
        setOrganization={setOrganization}
        project={project}
        setProject={setProject}
        handleSubmitPush={handleSubmitPush}
        isPushing={isPushing}
      />
    </Container>
  );
}

export default MainSection;
