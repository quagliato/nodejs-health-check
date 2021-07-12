const fs = require("fs");
const got = require("got");

class ConfigUtils {
  constructor() {
    this.configActionsMap = {
      HEALTH_CHECK_CONFIG: "readJsonConfig",
      HEALTH_CHECK_CONFIG_FILE: "readConfigFile",
      HEALTH_CHECK_CONFIG_URL: "readConfigFileFromURL",
    };

    const [configReadFunction] = Object.keys(this.configActionsMap)
      .map((key) => {
        if (process.env[key]) {
          return {
            envVar: key,
            function: this.configActionsMap[key],
          };
        }
      })
      .filter((configReadFunction) => !!configReadFunction);

    if (!configReadFunction) {
      throw new Error(`${new Date().toISOString()} No config set.`);
    }

    const functionToRun = this[configReadFunction.function];
    const argsToFunction = process.env[configReadFunction.envVar];
    return this.processConfig(functionToRun(argsToFunction));
  }

  readJsonConfig(jsonConfig) {
    try {
      JSON.parse(jsonConfig);
      return jsonConfig;
    } catch (err) {
      throw new Error(
        `${new Date().toISOString()} Could not parse config in env var.`
      );
    }
  }

  readConfigFileFromURL(url) {
    return got(url)
      .then((response) => response.body)
      .catch(() => {
        throw new Error(
          `${new Date().toISOString()} Could not find config file in ${url}`
        );
      });
  }

  readConfigFile(path) {
    if (!fs.lstatSync(path)) {
      throw new Error(`${new Date().toISOString()} ${path} does not exist.`);
    }

    return fs.readFileSync(path).toString();
  }

  processConfig(config) {
    try {
      JSON.parse(config);
    } catch (err) {
      throw new Error(
        `${new Date().toISOString()} Config information is not a valid JSON`,
        err
      );
    }

    const { smtp_settings, targets } = JSON.parse(config);

    if (!smtp_settings || !targets || targets.length === 0) {
      throw new Error(
        `${new Date().toISOString()} Not enough configuration to proceed. Please check the targets and the SMTP settings.`
      );
    }

    return {
      targets,
      master_smtp_settings: smtp_settings,
    };
  }
}

module.exports = ConfigUtils;
