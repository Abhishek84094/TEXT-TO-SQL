# Text-To-SQL SaaS Platform

A full-stack application that transforms natural language questions into SQL queries using multiple LLM providers (Ollama, Gemini, and Groq).

## Features

- **NL2SQL Engine**: Supports Ollama (local), Google Gemini, and Groq.
- **Multi-Database Support**: Connect to PostgreSQL, MySQL, and SQLite.
- **Query History**: Persistent history powered by Supabase.
- **Responsive UI**: Modern dashboard built with React and Vite.

## Project Structure

- `backend/`: Node.js Express server with LLM integration.
- `frontend/`: React application for the user interface.

## Setup

1. **Backend**:
   - `cd backend`
   - `npm install`
   - Create `.env` (see `backend/.env` for required variables).
   - `npm run dev`

2. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## LLM Configuration

The application uses a robust fallback chain:
1. **Ollama** (Local Llama 3)
2. **Google Gemini** (1.5 Flash / Pro)
3. **Groq** (Llama 3.3 70B)
