const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
var morgan = require('morgan');
var methodOverride = require('method-override');

// Connect To Database (OLD CODE)
mongoose.connect(config.database);
// On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to Database '+ config.database);
});
// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error '+ err);
});

const app = express();

const contacts = require('./routes/contacts');
const users = require('./routes/users');

// Port Number process.env.PORT ||
const port = process.env.PORT || 8080;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev')); // log every request to the console

// Body Parser Middleware
app.use(bodyParser.json());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

//add routes to express
app.use('/users', users);
app.use('/contacts', contacts);

// Index Route
app.get('/', (req, res) => {
  res.send('invaild endpoint');
});

// Start Server
app.listen(port, () => {
  console.log('Server started on port '+ port);
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});
