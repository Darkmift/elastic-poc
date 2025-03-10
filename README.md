# Street Search Application

A full-stack application for searching and managing street data, built with Elasticsearch, Node.js, and React.

## Prerequisites

- Docker and Docker Compose
- Node.js (v16 or higher)
- npm (v8 or higher)

## Installation & Setup

### 1. Start Elasticsearch and Kibana

```bash
# Start the Docker containers
docker-compose up -d
```

This will start:
- Elasticsearch on port 9200
- Kibana on port 5601

### 2. Install and Start the Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the development server
npm run dev
```

The server will run on http://localhost:3000

### 3. Install and Start the Client

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The client will run on http://localhost:5173

## Features

- 🔍 Three search types: Free, Accurate, and Phrase
- 📁 CSV file upload with automatic index creation
- 🌐 Hebrew text support
- ⚡ Real-time search results
- 🗑️ Record deletion capability
- 📊 Kibana integration for data visualization

## API Endpoints

- `POST /search/upload` - Upload CSV file
- `GET /search/search` - Search records
- `DELETE /search/:indexName/records/:recordId` - Delete a record
- `GET /search/list-indexes` - List all indexes