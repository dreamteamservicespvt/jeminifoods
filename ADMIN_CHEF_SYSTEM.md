# 🧑‍🍳 Admin & Chef Order Management System

A complete, production-ready order management system built with React, TypeScript, Firebase, and modern UI components. This system provides real-time order tracking, chef assignment, status updates, and comprehensive analytics.

## ✨ Features

### 🔐 **Authentication System**
- **Admin Authentication**: Secure login for restaurant administrators
- **Chef Authentication**: Email/password login for kitchen staff
- **Role-based Access Control**: Protected routes based on user roles
- **Session Management**: Persistent login sessions with automatic logout

### 📊 **Admin Dashboard**
- **Real-time Analytics**: Live order counts, chef statistics, revenue tracking
- **Chef Management**: Add new chefs with specialties and contact information
- **Order Assignment**: Assign orders to specific chefs with dropdown selection
- **Live Filtering**: Filter orders by status (Booked, Taken, Making, Ready)
- **Search Functionality**: Search orders by customer name, email, or order ID
- **Status Management**: Update order status with automatic notifications

### 👨‍🍳 **Chef Dashboard**
- **Assigned Orders**: View all orders assigned to the logged-in chef
- **Status Updates**: Progress orders through cooking stages (Taken → Making → Ready)
- **Real-time Sync**: Automatic updates when new orders are assigned
- **Sound Notifications**: Audio alerts for new order assignments
- **Auto-refresh**: Live dashboard updates every 30 seconds
- **Mobile Optimized**: Tablet and mobile-friendly interface for kitchen use

### 🔄 **Order Lifecycle**
1. **Customer Places Order** → Status: "Booked"
2. **Admin Assigns Chef** → Status: "Taken"
3. **Chef Starts Cooking** → Status: "Making"
4. **Chef Completes Order** → Status: "Ready"
5. **Real-time Updates** → All dashboards sync instantly

## 🛠️ Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Radix UI, Shadcn/ui
- **Animations**: Framer Motion
- **Backend**: Firebase Firestore (Real-time Database)
- **Authentication**: Firebase Auth
- **State Management**: React Hooks, Context API
- **Routing**: React Router v6
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/
│   │   └── AdminAnalytics.tsx      # Analytics dashboard
│   ├── layout/
│   │   └── ChefLayout.tsx          # Chef-specific layout
│   └── ui/
│       └── OrderTracker.tsx        # Order status tracker
├── pages/
│   ├── admin/
│   │   ├── AdminLogin.tsx          # Admin authentication
│   │   ├── AdminDashboard.tsx      # Admin main dashboard
│   │   └── AdminPreOrders.tsx      # Order management
│   ├── chef/
│   │   ├── ChefLogin.tsx           # Chef authentication
│   │   └── ChefDashboard.tsx       # Chef main dashboard
│   └── UserDashboard.tsx           # Customer order tracking
├── lib/
│   └── firebase.ts                 # Firebase configuration
└── routes.tsx                      # Application routing
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone and Install**
   ```bash
   cd jemini
   npm install
   ```

2. **Firebase Setup**
   - Create a Firebase project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Update `src/lib/firebase.ts` with your config

3. **Database Collections**
   Create these Firestore collections:
   ```
   - preOrders (customer orders)
   - chefs (chef profiles)
   - menuItems (restaurant menu)
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access the System**
   - Main site: `http://localhost:5173`
   - Admin dashboard: `http://localhost:5173/admin/dashboard`
   - Chef dashboard: `http://localhost:5173/chef/dashboard`

## 👥 User Roles & Access

### 🔧 **Admin Functions**
- View comprehensive analytics and reports
- Add and manage chef accounts
- Assign orders to available chefs
- Monitor all order statuses in real-time
- Search and filter orders by various criteria
- Update order status when needed

### 👨‍🍳 **Chef Functions**
- View orders assigned to them
- Update order status through cooking stages
- Receive notifications for new assignments
- Track cooking progress with visual indicators
- Access mobile-optimized kitchen interface

### 👤 **Customer Functions**
- Place pre-orders through the main website
- Track order status in real-time
- View order history and details
- Receive automatic status notifications

## 🎨 UI/UX Features

### **Design Principles**
- **Kitchen-First**: Chef dashboard optimized for tablet/kitchen use
- **Real-time Updates**: Live status changes across all interfaces
- **Color-coded Status**: Consistent visual language for order states
- **Mobile Responsive**: Perfect experience on all device sizes
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### **Status Color Coding**
- 🔵 **Booked** - New orders ready for assignment
- 🟡 **Taken** - Orders assigned to chefs
- 🟣 **Making** - Orders currently being prepared
- 🟢 **Ready** - Orders completed and ready for pickup

### **Animations & Feedback**
- Smooth page transitions with Framer Motion
- Status change animations and confirmations
- Loading states for all async operations
- Toast notifications for user feedback
- Sound alerts for chef notifications

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **Firebase Security Rules**
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Orders: Read/write for authenticated users
    match /preOrders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    // Chefs: Read for authenticated users, write for admins
    match /chefs/{chefId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 📊 Analytics Features

### **Real-time Metrics**
- Total orders and revenue
- Active chef count
- Pending vs completed orders
- Average order value
- Daily trends and patterns

### **Status Breakdown**
- Orders by current status
- Chef workload distribution
- Peak order times
- Customer satisfaction metrics

## 🔄 Real-time Updates

The system uses Firebase's real-time listeners to ensure instant updates across all dashboards:

- **Order Assignment**: Instantly appears on chef dashboard
- **Status Changes**: Real-time updates for admin and customer views
- **New Orders**: Immediate notifications to admin panel
- **Analytics**: Live updating dashboard metrics

## 🧪 Testing

### **Manual Testing Checklist**
1. **Admin Flow**
   - [ ] Login as admin
   - [ ] View analytics dashboard
   - [ ] Add a new chef
   - [ ] Assign order to chef
   - [ ] Monitor real-time updates

2. **Chef Flow**
   - [ ] Login as chef
   - [ ] View assigned orders
   - [ ] Update order status
   - [ ] Verify notifications
   - [ ] Test mobile interface

3. **Customer Flow**
   - [ ] Place a pre-order
   - [ ] Track order status
   - [ ] Verify real-time updates

### **Integration Testing**
```bash
node test-system.js
```

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
```

### **Deploy to Vercel**
```bash
vercel --prod
```

### **Deploy to Firebase Hosting**
```bash
firebase deploy
```

## 🛡️ Security Considerations

- **Authentication**: Firebase Auth with email/password
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **API Security**: Firestore security rules
- **Session Management**: Automatic token refresh

## 🔮 Future Enhancements

- [ ] Push notifications for mobile apps
- [ ] Inventory management integration
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Voice commands for chef dashboard
- [ ] Kitchen display system integration

## 🎉 Success Metrics

The system has been designed to achieve:
- **99.9% Uptime** - Reliable order processing
- **<2s Load Times** - Fast dashboard performance
- **Real-time Updates** - Instant status synchronization
- **Mobile Optimized** - Perfect kitchen tablet experience
- **User Friendly** - Intuitive interface for all roles

---

## 📞 Support

For technical support or feature requests, contact the development team or create an issue in the project repository.

**Built with ❤️ for culinary excellence by the Jemini development team**
