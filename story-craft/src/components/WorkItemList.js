import React from 'react';
import WorkItem from './WorkItem';

function WorkItemList({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <WorkItem key={index} item={item} />
      ))}
    </div>
  );
}

export default WorkItemList;
