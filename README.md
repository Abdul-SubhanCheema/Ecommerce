<div align="center">

# 🛒 E-Commerce Store

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-20.2.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

<p align="center">
  <strong>🎯 Modern full-stack e-commerce platform</strong>
</p>

<p align="center">
  <em>Built with .NET Core API and Angular frontend</em>
</p>

</div>

---

## 🎯 **Quick Overview**

A complete e-commerce solution featuring product management, user authentication, reviews, and file uploads.

**Tech Stack:** .NET 9.0 + Angular 20 + SQLite + JWT

---

## ⚡ **Core Features**

| Feature | Description |
|---------|------------|
| 🔐 **Authentication** | JWT-based secure login/register |
| 📦 **Products** | CRUD operations with categories |
| 🖼️ **Image Upload** | Cloudinary integration |
| ⭐ **Reviews** | User product reviews & ratings |
| 👥 **User Management** | Profile & account management |
| 🏷️ **Categories** | Product categorization |

---

## 🚀 **Quick Start**

### **Backend (.NET API)**
```bash
cd API
dotnet restore
dotnet run
```
**Runs on:** `http://localhost:5000`

### **Frontend (Angular)**
```bash
cd Client
npm install
ng serve
```
**Runs on:** `http://localhost:4200`

---

## 🏗️ **Architecture**

```
📦 E-Commerce Store
├── 🔹 API (Backend)
│   ├── Controllers
│   ├── Entities
│   ├── Services
│   └── Data
└── 🔹 Client (Frontend)
    ├── Components
    ├── Services
    └── Interfaces
```

---

## 🛠️ **Tech Details**

### **Backend Features**
- **Entity Framework Core** with SQLite
- **JWT Authentication** & Authorization
- **RESTful API** design
- **Image Upload** via Cloudinary
- **CORS** enabled for frontend

### **Frontend Features**
- **Angular 20.2.0** with TypeScript
- **Tailwind CSS** for styling
- **Responsive** design
- **HTTP Interceptors** for auth
- **Form Validation** & error handling

---

## 📊 **Database Schema**

| Entity | Key Fields |
|--------|------------|
| **Product** | Name, Price, Description, Category |
| **User** | Username, Email, Password (Hashed) |
| **Category** | Name, Products Collection |
| **Review** | Rating, Comment, User, Product |
| **Photo** | URL, Product Association |

---

## 🔧 **Configuration**

### **Environment Setup**
```json
// API/appsettings.json
{
  "ConnectionString": "Data Source=Ecommerce.db",
  "TokenKey": "your-secret-key",
  "CloudinarySettings": {
    "CloudName": "your-cloud",
    "ApiKey": "your-key"
  }
}
```

### **Dependencies**
- **.NET 9.0** runtime
- **Node.js** (for Angular)
- **Angular CLI** globally installed

---

## 📱 **Key Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/account/register` | User registration |
| `POST` | `/api/account/login` | User login |
| `GET` | `/api/products` | Get all products |
| `POST` | `/api/products` | Create product |
| `POST` | `/api/photo` | Upload product image |
| `GET` | `/api/categories` | Get categories |

---

## 🎨 **Features Highlight**

- **🔒 Secure Auth:** Hashed passwords + JWT tokens
- **📸 Image Upload:** Cloudinary cloud storage
- **⭐ Review System:** User feedback & ratings
- **🏷️ Categorization:** Organized product catalog
- **📱 Responsive UI:** Mobile-first design
- **🔍 Search & Filter:** Easy product discovery

---

## 🚀 **Deployment**

### **Docker Support**
```bash
# Build & run with Docker
docker build -t ecommerce-api ./API
docker build -t ecommerce-client ./Client
```

### **Production Build**
```bash
# Angular production build
ng build --prod

# .NET production build
dotnet publish -c Release
```

---

## 📄 **License**

MIT License - see LICENSE file for details.

---

## 📞 **Contact**

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Abdul-SubhanCheema)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/abdulsubhan303)

<img src="https://user-images.githubusercontent.com/74038190/213910845-af37a709-8995-40d6-be59-724526e3c3d7.gif" width="100">

### 🛒 *"Building modern e-commerce experiences, one feature at a time!"* ✨

**⭐ Enjoyed the project? Give it a star!**

</div>

---

<div align="center">
  <strong>💼 Full-Stack E-Commerce Excellence 💼</strong>
</div>
