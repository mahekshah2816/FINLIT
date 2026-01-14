# 💰 FinLit - Student Budget & Expense Tracker

A full-stack web application built with the MERN stack to help students and users track their income, expenses, manage budgets, and visualize spending trends.

![FinLit Screenshot](https://via.placeholder.com/800x400/2563eb/ffffff?text=FinLit+Expense+Tracker)

## 🎯 Project Overview

FinLit is designed to be **solo-build friendly** and extremely useful for students. It provides a comprehensive solution for personal finance management with an intuitive interface and powerful analytics.

## ✨ Features

### Core Features (MVP)
- ✅ **Add Income/Expense**: Input title, amount, category, type, and date
- ✅ **List Transactions**: View all records with filtering by category/date/type
- ✅ **Edit/Delete Entries**: Update transactions and confirm before deletion
- ✅ **Monthly Summary with Charts**: Pie charts and bar graphs for spending analysis
- ✅ **Dashboard Overview**: Income, expenses, balance, and budget tracking

### Advanced Features
- 🔐 **User Authentication**: Secure login/signup with JWT
- 📊 **Interactive Charts**: Beautiful visualizations using Recharts
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🎯 **Budget Management**: Set monthly limits with alerts
- 🔍 **Smart Filtering**: Filter transactions by multiple criteria
- 📅 **Date Management**: Easy date selection with react-datepicker
- 🏷️ **Category Management**: Predefined + custom categories

## 🛠️ Tech Stack

| Part | Technology | Why |
|------|------------|-----|
| **Frontend** | React + CSS | Simple, responsive UI with modern components |
| **Backend** | Node.js + Express | Easy REST API handling with middleware |
| **Database** | MongoDB + Mongoose | Flexible and beginner-friendly NoSQL |
| **Charts** | Recharts | Beautiful and responsive chart library |
| **Authentication** | JWT + bcrypt | Secure user authentication |
| **Styling** | CSS Variables | Modern, maintainable styling system |

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd finlit-expense-tracker
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Create backend/config/config.env
   MONGO_URL=mongodb://localhost:27017/finlit
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or run separately:
   npm run server    # Backend only
   npm run client    # Frontend only
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
finlit-expense-tracker/
├── backend/                 # Backend API
│   ├── config/             # Environment configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md               # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/summary` - Get financial summary
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/stats` - Get category statistics

## 🎨 Key Components

- **Dashboard**: Overview with charts and summary cards
- **AddTransaction**: Form for adding new transactions
- **Transactions**: List view with filtering and editing
- **Profile**: User settings and budget management
- **Charts**: Interactive pie charts and bar graphs

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration

## 🚀 Deployment

### Backend (Render/Heroku)
1. Set environment variables
2. Deploy to your preferred platform
3. Update frontend API base URL

### Frontend (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `build` folder
3. Set environment variables if needed

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (if implemented)
cd backend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for students learning full-stack development
- Inspired by modern expense tracking applications
- Uses open-source libraries and tools

## 📞 Support

If you have any questions or need help:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---



*FinLit - Empowering students to take control of their finances through technology.*
