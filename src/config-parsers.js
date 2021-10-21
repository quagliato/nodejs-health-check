const fs = require("fs");
const got = require("got");

const readConfigFile = (path) => {
  if (!fs.lstatSync(path)) {
    throw new Error(`${new Date().toISOString()} ${path} does not exist.`);
  }

  return fs.readFileSync(path).toString();
};

const readConfigFileFromURL = (url) => {
  return got(url)
    .then((response) => response.body)
    .catch(() => {
      throw new Error(
        `${new Date().toISOString()} Could not find config file in ${url}`
      );
    });
};

const readJsonConfig = (jsonConfig) => {
  try {
    JSON.parse(jsonConfig);
    return jsonConfig;
  } catch (err) {
    throw new Error(
      `${new Date().toISOString()} Could not parse config in env var.`
    );
  }
};

module.exports = {
  readConfigFile,
  readConfigFileFromURL,
  readJsonConfig,
};
