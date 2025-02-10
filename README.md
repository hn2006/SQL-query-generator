# ⚡ SQL Query Generator  

**An AI-powered SQL query generator** that lets users **upload an SQL schema** and generate **complex queries from natural language prompts**. Designed with **a sleek modern UI, dark/light mode, and a chat-like experience**, powered by **Gemini AI & Docker**.

---

## ✨ Features  

✅ **Upload SQL Schema** – Drag & drop SQL schema for metadata extraction  
✅ **AI-Powered Query Generation** – Convert natural language into SQL queries  
✅ **Real-time Query Execution** – Validate AI-generated queries instantly  
✅ **Chat-like UI** – Interactive experience for seamless SQL generation  
✅ **Dark & Light Mode** – Beautiful modern UI with theme toggle  
✅ **Fully Containerized** – Deploy anywhere with **Docker**  


---

## 📂 Project Structure  

```plaintext
sql-query-generator/
│── frontend/                     # React + Vite UI
│   ├── src/
│   │   ├── assets/               # Static assets (icons, images)
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ChatWindow.tsx    # Chat UI for prompts
│   │   │   ├── FileUpload.tsx    # Drag & drop SQL file input
│   │   │   ├── ThemeToggle.tsx   # Dark/light mode switch
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Main page
│   │   ├── App.tsx               # Entry point
│   │   ├── main.tsx              # React root
│   │   ├── styles.css            # Global styles
│   ├── public/                   # Public assets
│   ├── index.html                 # Main HTML file
│   ├── vite.config.ts             # Vite configuration
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│
│── backend/                      # Node.js + Express API
│   ├── routes/
│   │   ├── upload.ts              # File upload API
│   │   ├── query.ts               # SQL query generation API
│   ├── controllers/
│   │   ├── queryController.ts     # Handles query generation
│   │   ├── uploadController.ts    # Handles file uploads
│   ├── utils/
│   │   ├── metadataExtractor.ts   # Parses SQL schema
│   │   ├── aiService.ts           # Connects to Claude/OpenAI
│   ├── server.ts                  # Main Express server
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│
│── docker/                        # Docker setup
│   ├── frontend.Dockerfile        # Frontend container
│   ├── backend.Dockerfile         # Backend container
│   ├── docker-compose.yml         # Multi-container setup
│
│── .gitignore                     # Ignored files
│── README.md                      # Project documentation
