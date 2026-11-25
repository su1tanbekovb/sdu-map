# 🗺️ SDU Map — Smart University Navigation

**SDU Map** is a web-based university navigation platform designed to help students, teachers, and visitors navigate Suleyman Demirel University (SDU) more easily.

The platform provides an interactive campus map, classroom search, navigation assistance, and useful university services in one place.

🌐 **Live Demo:** https://su1tanbekovb.github.io/sdu-map/

---

## ✨ Features

- 🗺️ **Interactive Campus Map** — Explore SDU buildings and university areas.
- 🔍 **Room Search** — Quickly find classrooms by their room codes.
- 🧭 **Navigation System** — Find your way between university locations.
- 🤖 **AI Assistant** — Get assistance with finding classrooms and navigating campus.
- 👤 **User Authentication** — Register and log in to your account.
- 📅 **Events Management** — View and manage university events.
- 👥 **Friends System** — Connect with other students.
- ⚙️ **User Profiles** — Manage your personal account.
- 🔐 **Role Management** — Different permissions for administrators and students.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Website structure |
| CSS3 | Styling and responsive design |
| JavaScript | Application functionality |
| Supabase | Database and authentication |
| GitHub Pages | Website hosting |

## 📁 Project Structure

```text
sdu-map/
│
├── index.html
├── style.css
├── config.js
│
├── js/
│   ├── map.js
│   ├── api.js
│   ├── app.js
│   └── assistant.js
│
└── database/
    └── schema.sql
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/su1tanbekovb/sdu-map.git
```

### 2. Open the project

```bash
cd sdu-map
```

Open the project folder in Visual Studio Code.

### 3. Run the website

Install the Live Server extension in VS Code.

Open `index.html` and click **Go Live**.

The website will open in your browser.

## 🗄️ Database Configuration

The project uses Supabase for database management and authentication.

**Note:** The application also supports a demo mode without Supabase. In this mode, data is stored locally in the browser.

Never expose your Supabase `service_role` key in frontend code.

## 🌍 Deployment

The project is hosted using GitHub Pages.

Live website:

https://su1tanbekovb.github.io/sdu-map/

To deploy your own version:

1. Upload the project files to a GitHub repository.
2. Open repository Settings.
3. Navigate to Pages.
4. Select the `main` branch and `/root` folder.
5. Save your settings.

## 🎯 Project Goal

The main goal of SDU Map is to improve the university experience by making campus navigation faster, simpler, and more accessible.

Instead of spending time searching for classrooms and university locations, students can use one platform to find the information they need.

## 👨‍💻 Developer

**Baqdaulet Sultanbekov**

Project: SDU Map

GitHub: [@su1tanbekovb](https://github.com/su1tanbekovb)

---

⭐ If you find this project useful, consider giving it a star on GitHub!
