import React from 'react';
import Container from '@mui/material/Container';
import WorkItemList from './WorkItemList';

const workItems = [
  {
    "WorkItemType": "Epic",
    "Title": "User Management",
    "Description": "Implement user registration and authentication system to handle user onboarding and security.",
    "Parent": null,
    "StoryPoints": null,
    "RemainingWork": null
  },
  {
    "WorkItemType": "Feature",
    "Title": "Azure App Registration",
    "Description": "Set up Azure App Registration to support secure user authentication, including OAuth and social logins.",
    "Parent": "User Management",
    "StoryPoints": null,
    "RemainingWork": null
  },
  {
    "WorkItemType": "User Story",
    "Title": "Implement social login",
    "Description": "As a user, I want to be able to register and log in using my social media accounts so that I can access the application more easily.",
    "Parent": "Azure App Registration",
    "StoryPoints": 5,
    "RemainingWork": null
  },
  {
    "WorkItemType": "Task",
    "Title": "Configure Azure App Registration",
    "Description": "Set up the Azure App Registration portal to handle OAuth configuration for social login integration.",
    "Parent": "Implement social login",
    "StoryPoints": null,
    "RemainingWork": 4
  }
];

function MainSection() {
  return (
    <Container style={{ marginTop: '20px' }}>
       <WorkItemList items={workItems} />
    </Container>
  );
}

export default MainSection;
