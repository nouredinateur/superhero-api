# Fastify Superheroes API

## Overview

This is a simple **Fastify API** that allows users to retrieve and add superheroes with attributes such as `name`, `superpower`, `humilityScore`, and `avatar`. The project is built using **Fastify** and follows best practices for API development, including **schema validation** and **CORS handling**.

## Installation

### Prerequisites

- **Node.js v18+** (recommended: latest stable version)
- **npm or yarn**

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/fastify-superheroes.git
   cd fastify-superheroes
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm run start
   ```
   The API will be running on `http://localhost:3001`.

## API Endpoints

### **GET /superheroes**

Retrieves a sorted list of superheroes by their humility score (highest first).

#### Response:

```json
[
  {
    "name": "Captain Humility",
    "superpower": "Self-awareness",
    "humilityScore": 10,
    "avatar": "https://api.dicebear.com/9.x/micah/svg?seed=CaptainHumility"
  }
]
```

### **POST /superheroes**

Adds a new superhero. The request body must match the schema.

#### Request Body:

```json
{
  "name": "Modesty Woman",
  "superpower": "Power Reflection",
  "humilityScore": 9
}
```

#### Response:

```json
{
  "name": "Modesty Woman",
  "superpower": "Power Reflection",
  "humilityScore": 9,
  "avatar": "https://api.dicebear.com/9.x/micah/svg?seed=ModestyWoman"
}
``` 
## Collaboration & Teamwork

If working with a teammate, I would:

- **Use GitHub Issues & PRs** for structured discussion and code review.
- **Ensure clear commit messages** to maintain transparency.
- **Write modular code** to allow for easy expansion.
- **Hold short sync meetings** to align on improvements.
- **Encourage feedback** on PRs and documentation.

## If I Had More Time

- **Add authentication** (e.g., JWT) for secure superhero creation.
- **Improve error handling** with detailed API responses.
- **Implement a database** (PostgreSQL or MongoDB) instead of using an in-memory array.
- **Implement AI capabilites (maybe generate superheroes with 1 click / Add speech capabilites with unique voices, tones, using prompts)
