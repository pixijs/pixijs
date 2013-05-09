var express = require('express');
var app = express();

var PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.directory(__dirname));

app.listen(PORT);

console.log("Examples server started at: http://localhost:" + PORT);
