# Blood Vault APP 🩸

A comprehensive Blood Bank Management System with AI-powered insights for efficient blood inventory management, donor tracking, and recipient matching.

## 🌟 Features

- **Donor Management**: Register and track blood donors with complete medical history
- **Recipient Management**: Manage blood recipients and track their requirements
- **Inventory Control**: Real-time blood inventory tracking with expiry monitoring
- **Order Processing**: Streamlined blood request and fulfillment workflow
- **ML-Powered Insights**:
  - Demand forecasting for different blood types
  - Intelligent donor-recipient matching
  - Blood loss prediction for surgeries
  - Risk assessment for transfusions
  - Location optimization for blood collection drives
  - Priority modeling for critical cases
- **Authentication & Authorization**: Secure role-based access control
- **Dashboard Analytics**: Real-time statistics and visualizations
- **Automated Notifications**: Alerts for low inventory and expiring blood units

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Custom middleware

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router
- **State Management**: React Hooks

### ML Service
- **Framework**: FastAPI
- **Language**: Python 3.x
- **ML Libraries**: scikit-learn, pandas, numpy
- **API Documentation**: Automatic with FastAPI/Swagger

## 📁 Project Structure

```
Blood-Vault-APP/
├── final/
│   ├── backend/              # Node.js backend server
│   │   ├── src/
│   │   │   ├── config/       # Configuration files
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── middleware/   # Custom middleware
│   │   │   ├── models/       # MongoDB models
│   │   │   ├── routes/       # API routes
│   │   │   └── services/     # Business logic
│   │   └── package.json
│   │
│   ├── frontend/             # React frontend application
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── hooks/        # Custom hooks
│   │   │   └── services/     # API services
│   │   └── package.json
│   │
│   └── ml-service/           # Python ML service
│       ├── app/
│       │   ├── models/       # ML models
│       │   ├── routes/       # API endpoints
│       │   └── utils/        # Utility functions
│       └── requirements.txt
│
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd final/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blood-vault
JWT_SECRET=your_jwt_secret_key
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd final/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ML_API_URL=http://localhost:8000
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### ML Service Setup

1. Navigate to the ML service directory:
```bash
cd final/ml-service
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the ML service:
```bash
uvicorn app.main:app --reload --port 8000
```

The ML service will run on `http://localhost:8000`

## 📚 API Documentation

### Backend API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Donors
- `GET /api/donors` - Get all donors
- `POST /api/donors` - Create new donor
- `GET /api/donors/:id` - Get donor by ID
- `PUT /api/donors/:id` - Update donor
- `DELETE /api/donors/:id` - Delete donor

#### Recipients
- `GET /api/recipients` - Get all recipients
- `POST /api/recipients` - Create new recipient
- `GET /api/recipients/:id` - Get recipient by ID
- `PUT /api/recipients/:id` - Update recipient
- `DELETE /api/recipients/:id` - Delete recipient

#### Inventory
- `GET /api/inventory` - Get all blood units
- `POST /api/inventory` - Add blood unit
- `PUT /api/inventory/:id` - Update blood unit
- `DELETE /api/inventory/:id` - Remove blood unit

#### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status

### ML Service Endpoints

- `POST /predictions/blood-loss` - Predict blood loss for surgery
- `POST /predictions/demand-forecast` - Forecast blood demand
- `POST /matching/donor-recipient` - Match donors with recipients
- `GET /insights/recommendations` - Get AI-powered recommendations
- `POST /predictions/risk-assessment` - Assess transfusion risks

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI)

## 🎯 Usage

### Admin Dashboard
1. Login with admin credentials
2. Access the dashboard to view:
   - Total donors, recipients, and blood units
   - Blood type distribution
   - Expiring units alerts
   - Recent orders

### Managing Donors
1. Navigate to "Donors" section
2. Click "Add Donor" to register new donor
3. Fill in donor details including blood type and medical history
4. View and update donor information as needed

### Blood Inventory
1. Go to "Inventory" section
2. Add blood units after collection
3. Monitor expiry dates
4. Track blood type availability

### Processing Orders
1. Navigate to "Orders" section
2. Create new order with recipient details
3. System suggests matching blood units
4. Track order fulfillment status

### ML Insights
1. Access "ML Insights" section
2. View demand forecasts for different blood types
3. Get donor matching recommendations
4. Analyze risk assessments for transfusions

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS protection
- Environment variable management

## 🧪 Testing

### Backend Tests
```bash
cd final/backend
npm test
```

### Frontend Tests
```bash
cd final/frontend
npm test
```


---

**Made with ❤️ for saving lives**
