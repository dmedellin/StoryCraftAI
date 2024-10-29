import React, { useState } from 'react';
import ListItem from '@mui/material/ListItem';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import WorkItemList from './WorkItemList';

function WorkItem({ item, level, filter, updateWorkItem }) {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleChange = (field, value) => {
    const updatedItem = { ...item, [field]: value };
    updateWorkItem(updatedItem);
  };

  return (
    <>
      <ListItem style={{ paddingLeft: level * 20, width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {item.children && item.children.length > 0 ? (
            <IconButton onClick={handleToggle} size="small">
              {open ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          ) : (
            <div style={{ width: 40 }} />
          )}
          <div style={{ width: '100%' }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Work Item Type</InputLabel>
              <Select
                value={item.WorkItemType}
                onChange={(e) =>
                  handleChange('WorkItemType', e.target.value)
                }
                label="Work Item Type"
              >
                {['Epic', 'Feature', 'User Story', 'Task'].map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box marginBottom={2}>
              <TextField
                fullWidth
                label="Title"
                value={item.Title}
                onChange={(e) => handleChange('Title', e.target.value)}
                variant="outlined"
              />
            </Box>

            <Box marginBottom={2}>
              <TextField
                fullWidth
                label="Description"
                value={item.Description}
                onChange={(e) => handleChange('Description', e.target.value)}
                variant="outlined"
                multiline
                rows={3}
              />
            </Box>

            {/* Conditionally render Acceptance Criteria for User Story and Feature */}
            {['User Story', 'Feature'].includes(item.WorkItemType) && (
              <Box marginBottom={2}>
                <TextField
                  fullWidth
                  label="Acceptance Criteria"
                  value={item.AcceptanceCriteria || ''}
                  onChange={(e) =>
                    handleChange('AcceptanceCriteria', e.target.value)
                  }
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Box>
            )}

            <Box marginBottom={2}>
              <TextField
                fullWidth
                label="Story Points"
                type="number"
                value={item.StoryPoints || ''}
                onChange={(e) =>
                  handleChange('StoryPoints', e.target.value)
                }
                variant="outlined"
              />
            </Box>

            <Box marginBottom={2}>
              <TextField
                fullWidth
                label="Remaining Work (hrs)"
                type="number"
                value={item.RemainingWork || ''}
                onChange={(e) =>
                  handleChange('RemainingWork', e.target.value)
                }
                variant="outlined"
              />
            </Box>
          </div>
        </div>
      </ListItem>
      {item.children && item.children.length > 0 && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <WorkItemList
            items={item.children}
            filter={filter}
            updateWorkItem={updateWorkItem}
            level={level + 1}
          />
        </Collapse>
      )}
    </>
  );
}

export default WorkItem;
