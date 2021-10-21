const {
  readConfigFile,
  readConfigFileFromURL,
  readJsonConfig,
} = require("./config-parsers");

class ConfigUtils {
  constructor() {
    this._configActionsMap = {
      HEALTH_CHECK_CONFIG: readJsonConfig,
      HEALTH_CHECK_CONFIG_FILE: readConfigFile,
      HEALTH_CHECK_CONFIG_URL: readConfigFileFromURL,
    };

    const configs = Object.entries(this._configActionsMap).filter(
      ([key, parser]) => !!process.env[key]
    );

    if (configs.length === 0) {
      throw new Error(`${new Date().toISOString()} No config set.`);
    }

    const [envVar, configParser] = configs[0];

    return this._processConfig(configParser(process.env[envVar]));
  }

  _processConfig(config) {
    let parsedConfig;
    try {
      parsedConfig = JSON.parse(config);
    } catch (err) {
      throw new Error(
        `${new Date().toISOString()} Config information is not a valid JSON`,
        err
      );
    }

    const { smtp_settings: smtpSettings, targets } = parsedConfig;

    if (!smtpSettings || !targets || targets.length === 0) {
      throw new Error(
        `${new Date().toISOString()} Not enough configuration to proceed. Please check the targets and the SMTP settings.`
      );
    }

    return {
      targets,
      masterSmtpSettings: smtpSettings,
    };
  }
}

module.exports = ConfigUtils;
