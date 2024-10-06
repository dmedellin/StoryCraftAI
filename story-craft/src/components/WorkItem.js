import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';

function WorkItem({ item }) {
    const [workItem, setWorkItem] = useState(item);

    const handleChange = (field, value) => {
        setWorkItem({ ...workItem, [field]: value });
    };

    return (
        <Card variant="outlined" style={{ marginBottom: '10px' }}>
            <CardContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Work Item Type</InputLabel>
                    <Select
                        value={workItem.WorkItemType}
                        onChange={(e) => handleChange('WorkItemType', e.target.value)}
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
                        value={workItem.Title}
                        onChange={(e) => handleChange('Title', e.target.value)}
                        variant="outlined"
                    />
                </Box>

                <Box marginBottom={2}>
                    <TextField
                        fullWidth
                        label="Description"
                        value={workItem.Description}
                        onChange={(e) => handleChange('Description', e.target.value)}
                        variant="outlined"
                        multiline
                        rows={3}
                    />
                </Box>

                <Box marginBottom={2}>
                    <TextField
                        fullWidth
                        label="Parent"
                        value={workItem.Parent || ''}
                        onChange={(e) => handleChange('Parent', e.target.value)}
                        variant="outlined"
                    />
                </Box>

                <Box marginBottom={2}>
                    <TextField
                        fullWidth
                        label="Story Points"
                        type="number"
                        value={workItem.StoryPoints || ''}
                        onChange={(e) => handleChange('StoryPoints', e.target.value)}
                        variant="outlined"
                    />
                </Box>

                <Box marginBottom={2}>
                    <TextField
                        fullWidth
                        label="Remaining Work (hrs)"
                        type="number"
                        value={workItem.RemainingWork || ''}
                        onChange={(e) => handleChange('RemainingWork', e.target.value)}
                        variant="outlined"
                    />
                </Box>
            </CardContent>
        </Card>
    );
}

export default WorkItem;
