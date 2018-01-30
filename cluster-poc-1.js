var express = require('express');

// Create a new Express application
var app = express();

// Add a basic route – index page
app.get('/', function (request, response) {
    response.send('Hello from Master!' );
});

// Bind to a port
app.listen(80, () => console.log('Master running!'));
