import React from 'react';
import WorkItem from './WorkItem';

function WorkItemList({ items }) {
  return (
    <div>
      {items.map((item) => (
        <WorkItem key={item.Title} item={item} />
      ))}
    </div>
  );
}

export default WorkItemList;
