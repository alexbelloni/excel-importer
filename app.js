const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');

// Load environment variables from .env file
require('dotenv').config();

// Set up static file serving in ./public
app.use(express.static(path.join(__dirname, 'public')));

// Set up body-parser middleware. 
//It is parsing the URL-encoded data with the querystring library (when false) or the qs library (when true)
app.use(bodyParser.urlencoded({ extended: false }));

// Use EJS as the templating engine
app.set('view engine', 'ejs');

// Set up flash middleware
//The flash is a special area of the session used for storing messages. req.session.messages
app.use(flash());

// Set up session middleware
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false
}));

//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
const storage = multer.memoryStorage(); // Store the uploaded file in memory
const upload = multer({ storage });

// --------------  Define routes and handlers ----------------------

// Import route modules
const uploadRouter = require('./routes/upload_router')(upload);
const indexRouter = require('./routes/index_router')();

// Use route modules
app.use('/', uploadRouter);
app.use('/', indexRouter);

// Start the server
const port = process.env.PORT || 8888;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
