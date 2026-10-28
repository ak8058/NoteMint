# 🚀 AI Exam Notes Generator  
### 📚 Smart Notes | ⚡ Revision Mode | 📊 Diagrams & Charts | 💳 Stripe Integration  

🔗 **Live Demo:**  
👉 
---

## 🧠 Overview  

AI Exam Notes Generator is a full-stack MERN application that helps students generate **exam-focused, structured notes instantly using AI**.  

It goes beyond basic summaries by providing:

- 🎯 Exam-oriented formatting  
- 📌 Priority-based subtopics  
- ❓ Important questions (short & long)  
- ⚡ Quick Revision Mode  
- 📊 Optional diagrams & charts  
- 📄 PDF export  

---

## ✨ Features  

### 🧾 AI-Powered Notes Generation  
- Generate structured notes from any topic  
- Tailored for exams (CBSE, JEE, etc.)  
- Clean formatting using Markdown  

### ⚡ Quick Revision Mode  
- 5-minute revision summaries  
- Focus on key concepts only  

### 📊 Diagrams & Charts  
- Optional visual explanations  
- Improves conceptual clarity  

### 📌 Smart Sidebar  
- Priority-based subtopics ⭐⭐⭐  
- Important exam questions  
- Exam importance insights  

### 💳 Credits System (Stripe Integrated)  
- Pay-as-you-use model  
- Secure payments via Stripe  
- Credit tracking per user  

### 📄 PDF Export  
- Download notes as clean PDFs  
- Ready for printing  

### 🔐 Authentication System  
- JWT-based authentication  
- Cookie-based secure sessions  

---

## 🏗️ Tech Stack  

### 💻 Frontend  
- ⚛️ React.js  
- 🎨 Tailwind CSS  
- 🎞️ Framer Motion  
- 📦 Redux Toolkit  
- 🌐 Axios  

### 🖥️ Backend  
- 🟢 Node.js  
- 🚀 Express.js  
- 🍃 MongoDB (Mongoose)  
- 🔐 JWT Authentication  
- 🍪 Cookie Parser  

### 💳 Payments  
- 💰 Stripe API  

### ☁️ Deployment  
- 🌍 Render (Frontend + Backend)  

---

## 📂 Project Structure  

```
client/
 ├── src/
 │   ├── components/
 │   ├── pages/
 │   ├── redux/
 │   ├── services/
 │   └── utils/

server/
 ├── controllers/
 ├── routes/
 ├── models/
 ├── middleware/
 ├── services/
 └── utils/
```

---

## 🚧 Future Improvements  

- 📱 Mobile optimization  
- 🧠 Personalized learning insights  
- 🗂️ Notes categorization  
- 🔎 Search & filtering  
- 🧾 Multi-format exports  

---


## ⭐ Support  

If you found this project useful, consider giving it a ⭐ on GitHub.

## Render deployment configuration

Set these variables on the **backend** service (never commit `.env` files):

- `MONGODB_URL` — MongoDB connection string; allow the Render service to reach the Atlas cluster.
- `JWT_SECRET` — long random signing secret.
- `GEMINI_API_KEY` — key with Gemini API access enabled.
- `STRIPE_SECRET_KEY` — Stripe secret key for the same mode (test or live) as Checkout.
- `STRIPE_WEBHOOK_SECRET` — signing secret for `/api/credits/webhook`.
- `CLIENT_URL` — exact deployed frontend origin, such as `https://your-client.onrender.com` (no path or trailing slash).

Set `VITE_SERVER_URL` on the **frontend** service to the backend origin, such as `https://notemint-yg7h.onrender.com`, then redeploy the frontend. Vite embeds this value at build time. Add `notemintai.vercel.app` to Firebase Authentication → Settings → Authorized domains, and make sure Google is enabled under Authentication → Sign-in method. In Stripe, register `https://your-server.onrender.com/api/credits/webhook` for the `checkout.session.completed` event.
