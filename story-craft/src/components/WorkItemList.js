import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import WorkItem from './WorkItem';

function WorkItemList({ items }) {
    // Build a map of items
    const itemMap = {};
    items.forEach((item) => {
        itemMap[item.Title] = { ...item, children: [] };
    });

    // Establish parent-child relationships
    items.forEach((item) => {
        if (item.Parent) {
            const parent = itemMap[item.Parent];
            if (parent) {
                parent.children.push(itemMap[item.Title]);
            }
        }
    });

    // Get root items (no parent)
    const rootItems = items
        .filter((item) => !item.Parent)
        .map((item) => itemMap[item.Title]);

    // Recursive component to render items
    const RenderItem = ({ node, level = 0 }) => {
        const [open, setOpen] = React.useState(false);

        const hasChildren = node.children.length > 0;

        const handleClick = () => {
            setOpen(!open);
        };

        return (
            <>
                <ListItem
                    style={{ paddingLeft: level * 20, width: '100%' }}
                    disableGutters
                >
                    {hasChildren ? (
                        <div
                            onClick={handleClick}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                            }}
                        >
                            {open ? <ExpandLess /> : <ExpandMore />}
                            <div style={{ width: '100%' }}>
                                <WorkItem item={node} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ width: '100%' }}>
                            <WorkItem item={node} />
                        </div>
                    )}
                </ListItem>
                {hasChildren && (
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <List disablePadding>
                            {node.children.map((child) => (
                                <RenderItem key={child.Title} node={child} level={level + 1} />
                            ))}
                        </List>
                    </Collapse>
                )}
            </>
        );
    };

    return (
        <List>
            {rootItems.map((item) => (
                <RenderItem key={item.Title} node={item} />
            ))}
        </List>
    );
}

export default WorkItemList;
