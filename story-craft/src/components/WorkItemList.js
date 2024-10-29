import React from 'react';
import List from '@mui/material/List';
import WorkItem from './WorkItem';  // Assuming a WorkItem component exists

function WorkItemList({ items, updateWorkItem }) {
  return (
    <List>
      {items.map((item) => (
        <WorkItem key={item.Title} item={item} updateWorkItem={updateWorkItem} />
      ))}
    </List>
  );
}

export default WorkItemList;
