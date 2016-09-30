var fs      = require("fs");
var request = require("request");

if (process.env.CONFIG) {
  processConfig(JSON.parse(process.env.CONFIG));
} else if (process.env.CONFIG_FILE) {
  fs.readFile(process.env.CONFIG_FILE, function(err, data){
    if (err) {
      console.log(new Date().toISOString() + " Could not load CONFIG_FILE");
    } else {
      var config = JSON.parse(data);
      processConfig(config);
    }
  });
} else {
  console.log(new Date().toISOString() + " No config setted");
  process.exit(1);
}

var processConfig = function(config){
  if (typeof config !== "object") {
    console.log(new Date().toISOString() + " The config file is not a array.");
  } else if (config.length === 0) {
    console.log(new Date().toISOString() + " The config file is empty.");
  } else {
    var master_smtp_settings = false;
    if (config.hasOwnProperty("smtp_settings")) {
      master_smtp_settings = config.smtp_settings;
    }

    if (config.hasOwnProperty("targets")) {
      if (config.targets.length === 0) {
        console.log(new Date().toISOString() + " No targets in the config");
      } else {
        for (var i = 0; i < config.targets.length; i++) {
          var target = config.targets[i];

          if (master_smtp_settings === false && !target.hasOwnProperty("smtp_settings")) {
            console.log(new Date().toISOString() + " No master SMTP settings and no target's SMTP settings.");
            return;
          }

          requestToTarget(target, master_smtp_settings);
        }
      }
    }
  }
};

var requestToTarget = function(target, master_smtp_settings){
  var requestInfo = {
    "url" : target.url,
    "method" : target.method,
    "body" : target.body,
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

    if (error || request.statusCode !== 200) {
      console.log(new Date().toISOString() + " " + target.app_name + " is down!");
      sendMail(target.report_email, target.app_name + " is down!", master_smtp_settings !== false ? master_smtp_settings : target.smtp_settings);
    } else {
      console.log(new Date().toISOString() + " " + target.app_name + " is ok!");
    }
  });
};

var sendMail = function(to, subject, smtp_settings){
  var nodemailer = require("nodemailer");
  var smtpTransport = require('nodemailer-smtp-transport');

  var transporter = nodemailer.createTransport(smtpTransport({
    host: smtp_settings.host,
    port: smtp_settings.port,
    ignoreTLS: false,
    auth: {
      user: smtp_settings.user,
      pass: smtp_settings.pass
    }
  }));

  var mailOptions = {
    to: to, // list of receivers
    subject: subject, // Subject line
    text: subject, // plaintext body
    html: '<p>' + subject + '</p>' // html body
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log(new Date().toISOString() + ' "' + subject + '" is sent: ' + info.response);
  });
};
