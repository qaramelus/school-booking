const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/userRoutes'); 
const bookingRoutes = require('./routes/bookingRoutes'); 


const app = express();
dotenv.config(); 

// Middlewares
app.use(cors());
app.use(express.json()); 
app.use('/api/activities', activityRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes);
app.use('/api', bookingRoutes);

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
