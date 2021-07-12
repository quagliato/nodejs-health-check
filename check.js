require("dotenv").config();

const ConfigUtils = require("./src/ConfigUtils");
const got = require("got");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const run = async () => {
  const { targets, master_smtp_settings } = new ConfigUtils();

  return await testTargets(targets)
    .then(filterResponses)
    .then((responses) => sendAlerts(responses, master_smtp_settings));
};

const testTargets = (targets) =>
  Promise.all(targets.map((target) => requestToTarget(target)));

const filterResponses = (responses) =>
  responses.filter((response) => response !== false);

const sendAlerts = (responses, master_smtp_settings) =>
  Promise.all(
    responses.map((response) => {
      const target = response.target;
      const subject = `${target.app_name} is down!`;
      const content = `${new Date().toISOString()}\n${subject}\nStatus Code: ${
        response.statusCode
      }\nError:\n${response.body}\nFull stack:\n${response.error}`;
      return sendMail(
        target.report_email,
        subject,
        target.smtp_settings || master_smtp_settings,
        content
      );
    })
  );

const requestToTarget = (target) => {
  if (!target.url) throw new Error("URL is mandatory");
  let requestOpts = {
    url: target.url,
    method: target.method || "GET",
  };

  /*
  if (target.body) {
    requestOpts = {
      ...requestOpts,
      body: target.body,
      json: true
    }
  }
  */

  return got(requestOpts)
    .then((response) => {
      console.log(`${new Date().toISOString()} ${target.app_name} is ok!`);
      return false;
    })
    .catch((error) => {
      return {
        target,
        statusCode: error?.response?.statusCode,
        body: error?.response?.body,
        error
      };
    });
};

const sendMail = (to, subject, smtp_settings, content) => {
  const transporter = nodemailer.createTransport(
    smtpTransport({
      host: smtp_settings.host,
      port: smtp_settings.port,
      secure: smtp_settings.port === 465 ? true : false,
      auth: {
        user: smtp_settings.user,
        pass: smtp_settings.pass,
      },
    })
  );

  const mailOpts = {
    to: to, // list of receivers
    subject: subject, // Subject line
    text: content, // plaintext body
  };

  return transporter.sendMail(mailOpts).then((info) => {
    console.log(
      `${new Date().toISOString()} "${subject}" is sent: ${info.response}`
    );
  });
};

async function start() {
  return run();
}

start();

// That's all, folks!
