# StoryCraftAI

StoryCraftAI is a tool designed to assist software development teams by automatically generating epics, features, user stories, and tasks for a given project using AI services. It provides a streamlined interface for editing and approving generated content, allowing for quick adaptation to project needs.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **AI-Driven Planning**: Automatically generate a comprehensive list of epics, features, user stories, and tasks.
- **User-Friendly Interface**: Edit and approve generated content with ease in a simple UI.
- **In-Memory Data Management**: Keep responses in memory for quick access and editing.
- **Customizable Prompts**: Define and adjust prompts to suit the specific needs of your project.

## Installation

To get started with StoryCraftAI, follow these steps:

1. **Clone the Repository**

    ```bash
    git clone https://github.com/dmedellin/StoryCraftAI.git
    cd StoryCraftAI
    ```

2. **Install Dependencies**

- Navigate to story-craft 
- Run
    ```bash
    npm install
    ```

## Usage

1. **Run the Application**

    ```bash
    npm start
    ```

2. **Access the UI**

    Open your web browser and go to `http://localhost:3000` to start generating and managing project stories.

3. **Run with Docker**

    Alternatively, you can run the application using Docker:

    ```bash
    docker run -d -p 3000:80 dmedellin/story-craft:latest
    ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
