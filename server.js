const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./backend/config/db');
const seedSuperAdmin = require('./backend/config/seedAdmin');

dotenv.config();
connectDB().then(seedSuperAdmin);

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',       require('./backend/routes/auth'));
app.use('/api/students',   require('./backend/routes/students'));
app.use('/api/classes',    require('./backend/routes/classes'));
app.use('/api/subjects',   require('./backend/routes/subjects'));
app.use('/api/attendance', require('./backend/routes/attendance'));
app.use('/api/reports',    require('./backend/routes/reports'));
app.use('/api/profiles',   require('./backend/routes/profiles'));
app.use('/api/users',      require('./backend/routes/users'));   // was missing entirely

app.get('/', (req, res) => res.json({ message: 'Student Management System API Running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));