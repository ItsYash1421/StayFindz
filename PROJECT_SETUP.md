# StayFinder Project Setup Guide

This document provides comprehensive setup instructions and project understanding for the StayFinder application, which consists of a React Native mobile application (App-Frontend) and a unified backend server (Unified-Backend) that serves mobile, web, and admin panel interfaces.

## Project Overview

StayFinder is a comprehensive accommodation booking platform with the following components:

- Mobile Application (React Native)
- Unified Backend (Node.js/Express)
- Multiple Interface Support (Mobile, Web, Admin Panel)

## 1. Frontend Setup (App-Frontend)

### Technology Stack

- React Native with Expo
- React Navigation for routing
- Google Authentication
- Maps Integration
- UI Components with react-native-paper
- State Management with Context API

### Prerequisites

- Node.js (LTS version)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

### Setup Instructions

1. **Install Dependencies**

   ```bash
   cd App-Frontend
   npm install
   ```

2. **Environment Setup**

   - Set up your Google Maps API key (See MAPS_SETUP.md)
   - Configure Google Sign-In credentials
   - Set up environment variables

3. **Running the App**

   ```bash
   # Start the Expo development server
   npm start

   # Run on iOS
   npm run ios

   # Run on Android
   npm run android
   ```

### Key Features and Components

- Authentication (Google Sign-in, Email)
- Property Listings and Search
- Booking Management
- User Profiles
- Wishlist functionality
- Real-time chat
- Maps Integration
- Admin Dashboard

### Project Structure

- `assets/` - Images and static assets
- `components/` - Reusable UI components
- `screens/` - Main application screens
- `context/` - React Context for state management
- `constants/` - Configuration and theme constants
- `hooks/` - Custom React hooks

## 2. Backend Setup (Unified-Backend)

### Technology Stack

- Node.js with Express
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT Authentication
- Cloudinary for media storage
- Multiple route handlers for different interfaces (web/app/admin)

### Prerequisites

- Node.js (LTS version)
- MongoDB installed locally or MongoDB Atlas account
- npm or yarn
- Environment variables configuration

### Setup Instructions

1. **Install Dependencies**

   ```bash
   cd Unified-Backend
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file with the following variables:

   ```
   PORT=8000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

3. **Running the Server**

   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

### Backend Architecture

#### Directory Structure

- `controllers/` - Request handlers for different interfaces
  - `web/` - Web interface controllers
  - `app/` - Mobile app controllers
  - `admin/` - Admin panel controllers
- `models/` - MongoDB schema definitions
- `routes/` - API route definitions
- `middlewares/` - Custom middleware functions
- `services/` - Business logic and external service integrations
- `socket/` - Real-time communication handlers

#### Key Features

1. **Authentication & Authorization**

   - JWT-based authentication
   - Role-based access control
   - Social authentication (Google, Facebook)

2. **Data Management**

   - CRUD operations for properties
   - User management
   - Booking system
   - Review and rating system

3. **Real-time Features**

   - Chat system
   - Notification system
   - Live booking updates

4. **File Handling**
   - Image upload and management
   - Document processing
   - Media optimization

## Development Workflow

1. **Local Development**

   - Run both frontend and backend servers
   - Use appropriate environment variables
   - Test features across different interfaces

2. **Testing**

   - Implement unit tests
   - Perform integration testing
   - Manual testing across platforms

3. **Deployment**
   - Set up CI/CD pipelines
   - Configure production environment
   - Monitor application performance

## Additional Resources

- Check `MAPS_SETUP.md` for Google Maps integration details
- Review `PRIVACY_POLICY.md` for privacy guidelines
- Refer to individual component documentation in the code
- Check the official documentation of major dependencies:
  - [Expo Documentation](https://docs.expo.dev/)
  - [React Navigation](https://reactnavigation.org/)
  - [Express.js](https://expressjs.com/)
  - [Mongoose](https://mongoosejs.com/)

## Common Issues and Solutions

1. **Maps Integration**

   - Ensure proper API key configuration
   - Check platform-specific setup requirements

2. **Authentication**

   - Verify social auth credentials
   - Check token expiration handling

3. **Image Upload**
   - Verify Cloudinary configuration
   - Check file size limits and formats

## Support and Maintenance

- Regular updates of dependencies
- Security patch management
- Performance optimization
- Bug tracking and resolution

---

For specific setup issues or questions, please refer to the project documentation or contact the development team.
