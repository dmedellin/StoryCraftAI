import React from 'react';
import List from '@mui/material/List';
import WorkItem from './WorkItem';

function WorkItemList({ items, filter, updateWorkItem, level = 0 }) {
  return (
    <List>
      {items
        .filter((item) =>
          item.Title.toLowerCase().includes(filter.toLowerCase())
        )
        .map((item) => (
          <WorkItem
            key={item.Title}
            item={item}
            level={level}
            filter={filter}
            updateWorkItem={updateWorkItem}
          />
        ))}
    </List>
  );
}

export default WorkItemList;
