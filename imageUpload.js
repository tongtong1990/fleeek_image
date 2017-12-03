const path = require('path');
const fs = require('fs');
var multer = require('multer');
var mysqlUtils = require('./mysqlUtils');
var aws = require('aws-sdk');

const tmpImagePath = './tmp_images';
aws.config.loadFromPath('./aws_config.json');
var s3 = new aws.S3();
const s3RetryTime = 3;
const s3Prefix = 'post_images/';

var uploadImageFlow = function(req, res) {
    var userid = req.body.userid;
    console.log(userid);
    var files = req.files;
    var nameMapping = {};
    for (var i = 0; i < files.length; i++) {
        var curTimestamp = Date.now();
        var tmpFile = files[i];
        var base64Name = Buffer.from(userid + '_' + curTimestamp + '_' + tmpFile.originalname).toString('base64');
        var updatedFileName = s3Prefix + base64Name + path.extname(tmpFile.originalname);
        var meta = tmpFile.mimetype;
        nameMapping[tmpFile.originalname] = updatedFileName;
    }
    res.send(nameMapping);
    files.forEach(function(tmpFile) {
        var s3FileName = nameMapping[tmpFile.originalname];
        uploadFile(s3FileName, tmpFile, s3RetryTime);
    });
};

function uploadFile(s3FileName, localTmpFile, retryTime) {
    var localDst = localTmpFile.destination + '/' + localTmpFile.filename;
    var fileBuf = fs.readFileSync(localDst);
    var s3UploadConfig = {
        ACL: 'public-read',
        Bucket: 'fleeekio',
        Key: s3FileName,
        Body: fileBuf,
        ContentType: localTmpFile.mimetype
    };
    s3.putObject(s3UploadConfig, function(error, response) {
      if (error) {
          if (retryTime > 0) {
              uploadFile(s3FileName, localTmpFile, retryTime - 1);
          } else {
              console.log("Upload file to s3 fail: " + error);
          }
      } else {
          fs.unlink(localDst, function(err) {
              if (err) {
                  console.log("Delete file fail, file: " + localDst + " with error: " + err);
              }
          });
      }
    });
}

module.exports = uploadImageFlow;