require("dotenv").config();

const ConfigUtils = require("./src/config-utils");
const got = require("got");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const run = async () => {
  const { targets, masterSmtpSettings } = new ConfigUtils();

  const testResponses = await testTargets(targets);
  const failedTestes = filterResponses(testResponses);
  return sendAlerts(failedTestes, masterSmtpSettings);
};

const testTargets = (targets) =>
  Promise.all(targets.map((target) => requestToTarget(target)));

const filterResponses = (responses) =>
  responses.filter((response) => !!response);

const sendAlerts = (responses, masterSmtpSettings) =>
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
        target.smtp_settings || masterSmtpSettings,
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

  return got(requestOpts)
    .then(() => {
      console.log(`${new Date().toISOString()} ${target.app_name} is ok!`);
      return false;
    })
    .catch((error) => {
      console.log(
        `${new Date().toISOString()} ${
          target.app_name
        } is down! E-mail will be sent.`
      );
      return {
        target,
        statusCode: error?.response?.statusCode,
        body: error?.response?.body,
        error,
      };
    });
};

const sendMail = async (to, subject, smtpSettings, content) => {
  const transporter = nodemailer.createTransport(
    smtpTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.port === 465 ? true : false,
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.pass,
      },
    })
  );

  const mailOpts = {
    to,
    from: smtpSettings.from,
    subject,
    text: content, // plaintext body
    envelope: {
      to,
      from: smtpSettings.from,
    },
  };

  const response = await transporter.sendMail(mailOpts);
  console.log(
    `${new Date().toISOString()} "${subject}" is sent: ${response.response}`
  );
};

(async () => {
  await run();
  process.exit(0);
})();
