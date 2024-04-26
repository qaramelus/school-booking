// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const activityBasicRoutes = require('./routes/activityBasicRoutes');
const activitySessionRoutes = require('./routes/activitySessionRoutes');
const activityParticipantRoutes = require('./routes/activityParticipantRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const locationRoutes = require('./routes/locationRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // Import notification routes

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

// Activity Routes
app.use('/api/activities', activityBasicRoutes);
app.use('/api/activity-sessions', activitySessionRoutes);
app.use('/api/activity-participants', activityParticipantRoutes);

// Other Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notifications', notificationRoutes); // Apply notification routes

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connected");
}).catch(err => console.log(err));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
