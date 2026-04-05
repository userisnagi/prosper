# Prosper Finance Dashboard

Prosper is a modern, interactive finance dashboard designed to help users track and understand their financial activity. Built with React and Vite, it provides a seamless experience for managing transactions, analyzing spending patterns, and gaining financial insights. The application features role-based access, multi-currency support, dark mode, and AI-powered insights.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Assignment Requirements](#assignment-requirements)
- [License](#license)

## Project Overview

Prosper is a personal finance management dashboard where users can view financial summaries, manage transactions, analyze spending patterns, and receive intelligent insights. The application features user authentication with role-based access control (Admin/Viewer/Guest), multi-currency support with real-time conversion, comprehensive transaction filtering and sorting, and AI-powered financial analysis. All data is persisted locally using localStorage for a seamless offline experience.

## Tech Stack

### Frontend

- **React 19** - UI library for building interactive user interfaces
- **Vite 8** - Fast frontend build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for responsive styling
- **Recharts** - Interactive charting library for data visualization
- **Framer Motion** - Animation library for smooth transitions
- **Lucide React** - Beautiful and customizable icon library
- **ExchangeRate-API** - Real-time currency conversion

## Features

Prosper Finance Dashboard provides a comprehensive set of features:

### Dashboard Overview
- **Financial Summary Cards** - Real-time display of net balance, total income, and expenses
- **Balance Trend Chart** - Interactive line chart showing monthly balance trends
- **Spending Breakdown** - Pie chart visualization of expenses by category
- **Global Date Filter** - Analyze any time period with custom date ranges

### Transaction Management
- Complete transaction history with date, category, type, and amount
- **Search & Filter** - Find transactions by category or type (Income/Expense)
- **Sort Options** - Sort by date or amount in ascending/descending order
- **Pagination** - Smooth navigation through large datasets (10 items per page)
- **CSV Export** - Download filtered transaction data

### Role-Based Access Control
- **Admin** - Full control: add, edit, and delete transactions
- **Viewer** - Read-only access to all data and features
- **Guest** - Demo mode with limited functionality
- Switch roles instantly via navbar dropdown

### AI Insights
- Financial health scoring (Excellent/Healthy/Needs Improvement/Risky)
- Spending pattern analysis with top 3 categories
- Personalized recommendations for improving savings
- Period-over-period comparisons (current vs previous)
- Daily spending average and transaction volume analysis

### Multi-Currency Support
- **10 Currencies** - INR, USD, EUR, GBP, JPY, AUD, CAD, CHF, SGD, CNY
- Real-time conversion using ExchangeRate-API
- All charts, values, and transactions update dynamically
- Built-in currency converter tool

### Additional Features
- **Dark Mode** - Complete light/dark theme with smooth transitions
- **Responsive Design** - Mobile-first approach for all screen sizes
- **Data Persistence** - localStorage for transactions and preferences
- **Toast Notifications** - Real-time feedback for user actions
- **Collapsible Sidebar** - Draggable toggle with smooth animations
- **User Profile** - Display with name extraction from email

## Folder Structure

```
src/
├── components/             # Reusable React components
│   ├── Navbar.jsx          # Top navigation bar
│   ├── Sidebar.jsx         # Side navigation menu
│   ├── BalanceChart.jsx    # Monthly balance trend chart
│   ├── ExpenseChart.jsx    # Spending by category pie chart
│   ├── Transactions.jsx    # Transaction list with CRUD
│   ├── Insights.jsx        # AI-powered financial insights
│   ├── CurrencyConverter.jsx # Currency conversion tool
│   ├── SummaryCards.jsx    # Financial summary display
│   ├── Toast.jsx           # Notification component
│   └── ...
│
├── pages/                  # Page components
│   └── DashboardPage.jsx   # Main dashboard page
│
├── layout/                 # Layout wrappers
│   └── DashboardLayout.jsx # Main layout with navbar & sidebar
│
├── utils/                  # Helper functions and utilities
│   ├── finance.js          # Financial calculations & formatting
│   ├── currency.js         # Currency conversion logic
│   └── categories.js       # Category normalization
│
├── services/               # API services
│   └── aiInsights.js       # AI insights generation
│
├── App.jsx                 # Main app component with routing
├── main.jsx                # Application entry point
├── index.css               # Global styles and Tailwind imports
└── LoginPage.jsx           # Authentication page
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173)

## Scripts

### Development

```bash
npm run dev       # Start development server with hot reload
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Run ESLint for code quality checks
```

### Demo Access

No authentication required for demo mode. Simply access the application and:

1. Use the role switcher in the navbar to toggle between Admin/Viewer/Guest
2. Admin mode allows adding, editing, and deleting transactions
3. All data persists in localStorage for your session

## Assignment Requirements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **Dashboard Overview** | ✅ | Summary cards, balance trend chart, spending breakdown pie chart |
| **Transactions Section** | ✅ | Complete list with date, amount, category, type + search, filter, sort |
| **Role-Based UI** | ✅ | Admin/Viewer/Guest modes with different permissions via dropdown |
| **Insights Section** | ✅ | Financial health scoring, spending patterns, AI recommendations |
| **State Management** | ✅ | React hooks (useState, useMemo), localStorage persistence |
| **Responsive Design** | ✅ | Mobile-first design, works on all screen sizes |
| **Dark Mode** | ✅ | Complete theme support with smooth transitions |
| **Data Persistence** | ✅ | localStorage for transactions, preferences, and currency |
| **Export Functionality** | ✅ | CSV export for filtered transactions |
| **Empty States** | ✅ | Graceful handling of no data scenarios |
| **Advanced Filtering** | ✅ | Date range, type filter, category search, sorting |

## Optional Enhancements Included

- ✅ Dark mode with persisted preference
- ✅ Multi-currency support with real-time conversion
- ✅ AI-powered financial insights
- ✅ CSV export functionality
- ✅ Pagination for large datasets
- ✅ Smooth animations and transitions
- ✅ Toast notifications for user feedback
- ✅ Collapsible sidebar with draggable toggle
- ✅ User profile with name display
- ✅ Category normalization for consistent data

## Approach

Data is managed using React state (useState) and persisted to localStorage for seamless user experience across page refreshes. Derived values such as chart data, financial summaries, and insights are computed using useMemo for optimal performance. The role-based access control is implemented on the frontend for demonstration purposes, as specified in the requirements. Currency conversion uses the ExchangeRate-API for real-time rates, and all calculations are memoized to ensure smooth UI performance.

## License

Educational/Portfolio use. Feel free to fork and customize for your own projects.

---

**Built with ❤️ for financial literacy**

