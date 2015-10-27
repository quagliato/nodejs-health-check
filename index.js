var request = require("./node_modules/request/index.js");

var url = "http://url-to-request.com";
var method = "POST";
var appName = "app name";
var reportEmail = "user@domain.tld";
var body = {};

var emailSettings = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'health-check@domain.tld',
  smtpPass: 'XXXXXXXXXXXXXXXXXXXXXXX'
};

var requestInfo = {
  "url" : url,
  "method" : method,
  "body" : body,
  "json": true
};

request(requestInfo, function(error, request, body){
  var parseTry = false;

  try {
    if (typeof body === "string") {
      parseTry = JSON.parse(body);
    } else if (typeof body === "object") {
      parseTry = JSON.stringify(body);
    }
  } catch (e) {
    parseTry = false;
  }

  if (error || !parseTry || request.statusCode !== 200) {
    console.log(new Date().toISOString() + " " + appName + " is down!");
    sendMail(appName + " id down!");
  } else {
    console.log(new Date().toISOString() + " " + appName + " is ok!");
  }
  console.log(body);
});


function sendMail(status){
  var nodemailer = require("nodemailer");
  var smtpTransport = require('nodemailer-smtp-transport');
   
  var transporter = nodemailer.createTransport(smtpTransport({
    host: emailSettings.smtpHost,
    port: emailSettings.smtpPort,
    ignoreTLS: false,
    auth: {
      user: emailSettings.smtpUser,
      pass: emailSettings.smtpPass
    }
  }));
   
  var mailOptions = {
    to: reportEmail, // list of receivers 
    subject: status, // Subject line 
    text: status, // plaintext body 
    html: '<p>' + status + '</p>' // html body 
  };
   
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}
