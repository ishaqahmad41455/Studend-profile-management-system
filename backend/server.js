const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/students',   require('./routes/students'));
// app.use('/api/classes',    require('./routes/classes'));
// app.use('/api/subjects',   require('./routes/subjects'));
// app.use('/api/attendance', require('./routes/attendance'));
// app.use('/api/reports',    require('./routes/reports'));
app.use('/api/profiles',   require('./routes/profiles'));

app.get('/', (req, res) => {
  res.json({ message: 'Student Management System API Running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
