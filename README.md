# 🚀 Sadeed – Concept Creation & Approval Workflow

**Sadeed** is a project management and approval system designed to streamline how engineers initiate concepts, assign teams, and seek multi-level managerial approvals before turning ideas into active projects. With built-in access control, status notifications, and role-based dashboards, Sadeed enables secure and traceable project initiation across organizations.

---

## 📌 Features

- 👷 Engineers can **create, update, and delete** concepts
- 👥 Assign **managers and employee teams** to concepts
- ✅ **Managers approve** concepts via a checklist workflow
- 🔒 **Approved concepts** are locked from further edits
- 🧑‍💼 **Role-based dashboards** for engineers, managers, and admins
- 🔔 **Notifications** for status changes and approvals
- 📊 Scalable structure for multiple approval use-cases with minimal customization

---

## 📂 Project Structure

### 🔧 Backend – `sadeed-backend`
- Node.js + Express.js
- MongoDB with Mongoose
- RESTful API endpoints
- Role-based Access Control (RBAC)
- Notification system
- Modular architecture (controllers, models, middleware)

### 🎨 Frontend – `sadeed-frontend`
- React.js + Vite
- Role-based UI components
- Axios for API integration
- Dashboards and approval UI
- Notifications and real-time updates (planned)

---

## 🚀 Getting Started

### 1. Clone the Repositories

```bash
git clone https://github.com/sedratiaziz/sadeed-backend.git
git clone https://github.com/sedratiaziz/sadeed-frontend.git
```

---

### 2. Backend Setup

```bash
cd sadeed-backend
npm install
npm run dev
```

📌 Configure environment variables in `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

### 3. Frontend Setup

```bash
cd sadeed-frontend
npm install
npm run dev
```

🖥 App runs at: `http://localhost:5173`

---

## 👤 User Roles

| Role      | Description                               |
|-----------|-------------------------------------------|
| Engineer  | Creates and manages concepts              |
| Manager   | Reviews and approves assigned concepts    |
| Employee  | Assign to the operational team            |

---

## ✅ Approval Flow

1. Engineer creates a concept.
2. Engineer assigns managers + employee team.
3. Assigned managers view and approve via dashboard.
4. Concept is marked **approved** once all approvals are complete.
5. Once approved, concept becomes **read-only** for all users.

---

## 📌 Tech Stack

| Frontend         | Backend          | Database   | Other         |
|------------------|------------------|------------|---------------|
| React + Vite     | Node.js + Express| MongoDB    | JWT Auth      |
| Axios            | Mongoose         |            | REST API      |
| Tailwind (planned) | Swagger (planned) |         | Role-based access |

---

## 🧪 Testing

### Backend
```bash
npm test
```

### Frontend
```bash
npm run test
```

---

## 🛠️ Future Enhancements

- 🟢 WebSocket for real-time notifications
- 📁 Export approved concepts as PDF/CSV
- 👥 Admin role & permission dashboard
- 📅 Concept → Project transition module
- 📱 Responsive mobile design

---

---

## 🤝 Contributing

We welcome contributions! Please open issues, suggest features, or submit pull requests. 

---

## 👨‍💼 Maintainers

- [@sedratiaziz](https://github.com/sedratiaziz)
- [@ebrahimalarayedh](https://github.com/ebrahimalarayedh)
- [@adelbh7](https://github.com/adelbh7)

---

## 📬 Contact

Need support or have ideas? [Open an issue](https://github.com/sedratiaziz/sadeed-backend/issues) or reach out via GitHub Discussions.

---

**Sadeed – Empowering structured innovation.** 💡
