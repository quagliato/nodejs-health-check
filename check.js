const fs = require('fs')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const got = require('got')

const run = async (config) => {
  const {
    targets
    master_smtp_settings
  } = processConfig(config)
  
  return await testTargets(targets)
    .then(filterResponses)
    .then(responses => sendAlerts(responses, master_smtp_settings))
}

const processConfig = (config) => {
  try {
    JSON.parse(config)
  } catch {
    console.log(`${new Date().toISOString()} Config information is not a valid JSON`)
    process.exit(1)
  }
  
  const configObject = JSON.parse(config)

  if (!configObject 
    || !configObject.smtp_settings
    || !configObject.targets 
    || configObject.targets.length === 0) {
    console.log(`${new Date().toISOString()} Not enough configuration to proceed. Please check the targets and the SMTP settings.`)
    process.exit(1)
  }
  
  return {
    targets: configObject.targets,
    master_smtp_settings: configObject.smtp_settings
  } 
}

const testTargets = (targets) => Promise.all(targets.map(target => requestToTarget(target)))

const filterResponses = (responses) => responses.filter(response !== false)

const sendAlerts = (responses, master_smtp_settings) => Promise.all(responses.map((response) => {
  return new Promise({
    const target = response.target
    const subject = `${new Date().toISOString()} ${target.app_name} is down!`
    const content = `${subject}\nStatus Code: ${response.statusCode}\nError: ${body}`
    return sendMail(target.report_email,
      subject,
      target.smtp_settings || master_smtp_settings,
      content)
  })
}))

const requestToTarget = (target) => {
  if (!target.url) throw new Error('URL is mandatory')
  const requestOpts = {
    url: target.url,
    method : target.method || 'GET',
    body : target.body,
    json: true
  }
  
  return got(requestOpts)
    .then(response => {
      console.log(`${new Date().toISOString()} is ok!`)
      return false
    })
    .catch(response => {
      return {
        target,
        statusCode: response.statusCode,
        body: response.error
      }
    })
}

const sendMail = (to, subject, smtp_settings, content) => {

  const transporter = nodemailer.createTransport(smtpTransport({
    host: smtp_settings.host,
    port: smtp_settings.port,
    ignoreTLS: false,
    auth: {
      user: smtp_settings.user,
      pass: smtp_settings.pass
    }
  }))

  const htmlContent = content.replace(/\\n/g)

  const mailOpts = {
    to: to, // list of receivers
    subject: subject, // Subject line
    text: content, // plaintext body
    html: htmlContent// html body
  };

  return transporter.sendMail(mailOpts)
    .then(info => {
      console.log(`${new Date().toISOString()} "${subject}" is sent: ${info.response}`)
    })
}

const readConfigFile = (path) => {
  if (!fs.lstatSync(path)) {
    console.log(`${new Date().toISOString()} ${path} does not exist.`);
    return false
  }
  
  return fs.readFileSync(path)
}

const readConfigFileFromURL = (url) => {
  return got(url)
    .then(response => response)
    .catch(() => {
      console.log(`${new Date().toISOString()} Could not find config file in ${url}`)
      return false;
    })
}

async function start() {
  if (process.env.HEALTH_CHECK_CONFIG) {
    return run(process.env.HEALTH_CHECK_CONFIG)
  } else if (process.env.HEALTH_CHECK_CONFIG_FILE) {
    return run(readConfigFile(process.env.HEALTH_CHECK_CONFIG_FILE))
  } else if (process.env.HEALTH_CHECK_CONFIG_URL) {
    return run(await readConfigFileFromURL(process.env.HEALTH_CHECK_CONFIG_URL))
  } else {
    console.log(`${new Date().toISOString()} No config set.`);
    process.exit(1);
  }
}

start()

// That's all, folks!
