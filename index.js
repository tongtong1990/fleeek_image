const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

var upload = multer({dest: './tmp_images'});
var app = express();
app.use(bodyParser.json());

var uploadImageFlow = require('./imageUpload');

app.post('/uploadimage', upload.array('images', 12), uploadImageFlow);

app.listen(3000, function() {
   console.log('Server started.');
});