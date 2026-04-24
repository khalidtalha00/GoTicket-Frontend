# Go Tickets

[Live Link] (https://go-ticket123.vercel.app/))

Go Tickets is a full-stack web application for booking travel tickets (Bus, Cab, Bike). It features a modern React frontend and a robust Node.js/Express backend with MongoDB integration. The application supports user authentication, ticket booking, QR code generation, and profile management.

## Features

- **User Authentication**: Secure Login and Registration for Passengers and Drivers.
- **Dashboard**: Personalized dashboards for different user roles.
- **Ticket Booking**: 
  - Search for source and destination.
  - Select transport mode (Bus AC/Non-AC, Cab, Bike).
  - Dynamic price calculation based on distance.
- **My Tickets**: 
  - View booking history.
  - Generate and view QR codes for tickets.
  - Delete tickets.
- **Profile Management**: 
  - Update user profile.
  - Upload profile picture (stored on server).
  - View ride statistics (Total rides, distance, spent).
- **Interactive Maps**: Integrated Leaflet maps for location visualization.
- **Dark Mode**: Toggle between light and dark themes.

## Screenshots

![App Screenshot 1](src/assets/Screenshot1.png)
![App Screenshot 2](src/assets/Screenshot2.png)
![App Screenshot 3](src/assets/Screenshot3.png)
![App Screenshot 4](src/assets/Screenshot4.png)
![App Screenshot 5](src/assets/Screenshot5.png)
![App Screenshot 6](src/assets/Screenshot6.png)
![App Screenshot 7](src/assets/Screenshot7.png)

## Tech Stack

### Frontend
- **React 19**: UI Library.
- **TypeScript**: Type safety.
- **Vite**: Build tool.
- **Material UI (MUI)**: Component library for styling.
- **React Router**: Navigation.
- **Leaflet / React-Leaflet**: Maps integration.
- **React QR Code**: QR code generation.

### Backend
- **Node.js**: Runtime environment.
- **Express.js**: Web framework.
- **MongoDB**: NoSQL Database.
- **Mongoose**: ODM for MongoDB.
- **Multer**: Middleware for handling file uploads.
- **Cors**: Cross-Origin Resource Sharing.

## Prerequisites

Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Go Tickets
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with your MongoDB connection string:
```env
MONGO_URI=mongodb://localhost:27017/gotickets
PORT=5000
```
*(Replace the URI with your MongoDB Atlas connection string if using cloud database)*

Start the backend server:
```bash
node index.js
# OR if you have nodemon installed
npm run dev
```
The server will run on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal, navigate to the root directory, and install dependencies:
```bash
# If you are in the server directory, go back one level
cd .. 
npm install
```

Start the frontend development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or the port shown in terminal).

## Usage

1.  **Register**: Create a new account as a Passenger or Driver.
2.  **Login**: Sign in with your credentials.
3.  **Book Ticket**: 
    - Enter Source and Destination (or use "Current Location").
    - Select Transport Type.
    - Click "Pay & Book".
4.  **View Tickets**: Go to "My Tickets" to see your bookings. Click the QR icon to view the ticket QR code.
5.  **Profile**: Go to "Profile" to view stats or upload a profile picture.

## Folder Structure

```
Go Tickets/
├── public/             # Static assets
├── server/             # Backend code
│   ├── models/         # Mongoose models (User, Ticket)
│   ├── routes/         # API routes (auth, tickets, upload)
│   ├── uploads/        # User uploaded images
│   ├── index.js        # Server entry point
│   └── ...
├── src/                # Frontend code
│   ├── assets/         # Images and icons
│   ├── components/     # Reusable components (Navbar, Map)
│   ├── context/        # React Context (Auth, Ticket, Theme)
│   ├── pages/          # Application pages
│   │   ├── driver/     # Driver specific pages
│   │   └── passenger/  # Passenger specific pages
│   ├── App.tsx         # Main App component
│   └── main.tsx        # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## License

This project is licensed under the MIT License.
