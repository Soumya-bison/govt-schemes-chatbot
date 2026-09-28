# Government Schemes Chatbot

A full-stack web application that helps users discover and understand
government schemes using a Marathi/English AI chatbot.

## Features

- Search government schemes
- Marathi and English support
- Natural-language chatbot
- RAG-based scheme retrieval
- Verified scheme information
- Eligibility information
- Required documents
- Application process
- Official scheme links

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- RAG-based retrieval
- Google Gemini API

### Data
- Verified government scheme information stored locally

## Project Structure

```text
startup/
├── client/
│   ├── public/
│   └── src/
│
├── server/
│   ├── data/
│   ├── index.js
│   └── RAGEngine.js
│
├── .gitignore
└── README.md
