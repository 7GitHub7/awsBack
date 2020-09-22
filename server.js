const express = require("express");
var bodyParser = require('body-parser');
const app = express();
const port = 80;


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({ extended: true })); 




const AWS = require('aws-sdk')

AWS.config.update({
  accessKeyId: 'ASIAWI3G2UXHO5HWYL5N',
  secretAccessKey: 'KNoTFJWe71fwo0DZMDpQnn3HrRCgBssiDRmZBXvb',
  sessionToken: "FwoGZXIvYXdzEIn//////////wEaDAnOQqvnxtkauSwy2yLDAUCxRepbotka9iYddLOwb7dJs8WqQuWmD4GSQnt34h4oyMJ88Yw0Sxt3fcetSvtpV1O2AbAB2gci4MgVOZOowDSnSGByEySGASgtzdJ2x0YP36Da3jPfR3sejRVRZGwOmZz3AkI7WB+MjIM0VeeJDBlXz2Ta7xpvErb180Pypu+0S3sP4TFI6HOQBrgK41QO5847lDUdvg3lRx+QK1JXWZrfTFB7x55y9T+RWNLc+kdlxzD0AzIlE3cktDu0EDrQg2UYRyiqr6j7BTItAkI7Jx783dpBVuEvNet7Ch2D8xgTbdvQFKDPq7TJxH3O75X/z8mCanazw+gK"
})
AWS.config.update({ region: 'us-east-1' })

const myBucket = 'testowybucket'
const myKey = 'test.jpg'
const signedUrlExpireSeconds = 60 * 4
var s3 = new AWS.S3({
  signatureVersion: 'v4'
});


app.get('/test', (req, res) => {
  console.log(req.query.filename)
  const url = s3.getSignedUrl('putObject', {
    Bucket: myBucket,
    Key: req.query.filename,
    Expires: signedUrlExpireSeconds

  })


  res.send(url)
  console.log(url)
})


app.get('/getimage', (req, res) => {
  console.log(req.query.filename)
  const url = s3.getSignedUrl('getObject', {
    Bucket: myBucket,
    Key: req.query.filename,
    Expires: signedUrlExpireSeconds

  })

  res.send(url)
  console.log(url)
})




app.get('/list', (req, res) => {

  var params = {
    Bucket: "testowybucket",

  };

  s3.listObjects(params, function (err, data) {
    if (err) { console.log(err, err.stack); } // an error occurred
    else {
  
      var list = []
      var obj = {}
      for (i = 0; i < data.Contents.length; i++) {

        list.push(data['Contents'][i]['Key']);
      }

      obj["list"] = list;
      console.log(obj["list"])
      res.send(obj)
      
    }             



  })
})



app.post('/sendtosqs', (req, res) => {
  // console.log(req.body.name)
  let name = req.body.name
  
  
  // Create an SQS service object
  var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

  var params = {
    // Remove DelaySeconds parameter and value for FIFO queues
    //   DelaySeconds: 10,
    MessageAttributes: {
      "Title": {
        DataType: "String",
        StringValue: "The Whistler"
      },
      "Author": {
        DataType: "String",
        StringValue: "John Grisham"
      },
      "WeeksOn": {
        DataType: "Number",
        StringValue: "6"
      }
    },
    MessageBody: name,
    MessageDeduplicationId: name,  // Required for FIFO queues
    MessageGroupId: "Group1",  // Required for FIFO queues
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/431322998222/test.fifo"
  };
  console.log(params.MessageBody)
  var buff;
  sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log("Error", err);
      buff = "Error"
    } else {
      console.log("Success", data.MessageId);
      buff = "success"
    }
  });

  res.send()


})







app.listen(port, () => console.log(`Server listening on port ${port}!`));

