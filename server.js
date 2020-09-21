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
  accessKeyId: 'ASIAWI3G2UXHOSQCNTFN',
  secretAccessKey: 'hccKSHkWJVGKMN2rSxG791rZiXxgpK4Bvw2XD6Xe',
  sessionToken: "FwoGZXIvYXdzEHQaDJXqudaEmX/9/tWrEiLDAazNebyzVxT6g9DHasj7SSv5EXHdPYVvaAzSoQz0CAY7q+X8OEJAT8yZ0QPkMhMsvGXfP90rbr6PtX3O/dKjHn9G4N0zUPrxNkxhqzF8y0+k1CrcpjpAixV73aYam7x+lUNnCbDnfDMC+/4QWvXKSUGlbnANK28PX+HQgssT9U5VijSjLW9ssDJhY6iHj1SWi5y1GEOEKaKWJQGUE5BRohJOokAi4G9D6l5mknHcCWhtBjXWMTFQWnBQM5leyZst0D6b2Cj+16P7BTIteOtpzV2s1KfTCJXH04a3M0O1KzxXy3tVvuA+bTyziuou2kadJV7rO9f0R4Tv"
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

