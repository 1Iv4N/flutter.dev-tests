const { promisify } = require('util');
const { readFile, outputJSONSync } = require('fs-extra');

const asyncReadFile = promisify(readFile);

const pages = require('./pages.js');

/** Helper Functions **/

/**
 * Get the configuration file
 *
 * This function uses glob in order to fetch the configuration file where we
 * set up the viewports, pages and urls.
 *
 * @returns {Object} JSON file with the base configuration
 */
async function getConfigurationFile() {
    console.log('\x1b[36m%s\x1b[0m', "Reading configuration files");

    let configFile = await asyncReadFile('config.json');

    return configFile;
  }

  /**
   * Get the pre-existing Backstop configuration file
   *
   * This function uses glob in order to fetch the backstop configuration file
   * where we set up the id, paths, browser, engine, onBefore script, onReady script
   * and other extra options related with Backstop.
   *
   * @param {Object} configFile Base configuration file that we got from getConfigurationFile function
   *
   * @returns {Object} Both base config file and Backstop config file
   */
  async function getBackstopConfigurationFile(configFile) {
    let backstopConfigFile = await asyncReadFile('base_config.json');

    return {configFile, backstopConfigFile};
  }



  /**
   * Assign the viewports configuration to the Backstop configuration file
   *
   * This function gets the viewport array to put it into the Backstop configuration file.
   *
   * @param {Object} configurationFiles Both base config file and Backstop config file
   * @param {Object} configurationFiles.configFile The base configuration file
   * @param {Object} configurationFiles.backstopConfigFile The Backstop configuration file
   *
   * @returns {Object} Object with both base config file and updated Backstop config file
   */
  async function assignViewports({configFile, backstopConfigFile}) {
    console.log('\x1b[36m%s\x1b[0m', "Creating viewports");

    backstopConfigFile = JSON.parse(backstopConfigFile);
    configFile = JSON.parse(configFile);

    backstopConfigFile = {...backstopConfigFile, viewports: configFile.viewports};

    return {configFile, backstopConfigFile};
  }

  /**
   * Create a set of scenarios based on configuration file and put it into the Backstop configuration
   * file.
   *
   * This function gets the locales and pages that are in the configuration file to create a set of scenarios
   * and put it into the Backstop configuration file.
   *
   * @param {Object} configurationFiles Both base config file and Backstop config file
   * @param {Object} configurationFiles.configFile The base configuration file
   * @param {Object} configurationFiles.backstopConfigFile The Backstop configuration file
   *
   * @returns {Object} Object with updated Backstop config file
   */
  async function createScenarios({configFile, backstopConfigFile}) {
    console.log('\x1b[36m%s\x1b[0m', "Creating test scenarios");

    let scenarios = [];

      pages.forEach(flutterPage =>{
        scenarios.push({
          label: `${flutterPage.name}.`,
          url: `${configFile.testUrl}${flutterPage.path}`,
          // cookiePath: `${configFile.cookiePath}`,
          delay: configFile.delay,
          misMatchThreshold: configFile.misMatchThreshold
        });
      });

    return {...backstopConfigFile, scenarios: scenarios};
  }

  /**
   * Write the updated Backstop configuration file
   *
   * This function uses fs-extra to save/write the file into our root folder. This file will
   * be used by BackstopJS library to execute all the scenarios that we need to test.
   *
   * @param {Object} backstopConfigFile Updated Backstop config file to save it
   */
  async function createBackstopFile(backstopConfigFile) {
    console.log('\x1b[36m%s\x1b[0m', "Saving Backstop configuration file");

    await outputJSONSync('backstop.json', backstopConfigFile, { spaces: 2 });
  }

  getConfigurationFile()
    .then(getBackstopConfigurationFile)
    .then(assignViewports)
    .then(createScenarios)
    .then(createBackstopFile)
    .then(() => {
      console.log('\x1b[36m%s\x1b[0m', "Done! Now you can run 'npm run test'");
    })
    .catch(err => {
      console.log("\x1b[31m", 'Oops! We have some problems:\n');
      console.log("\x1b[31m", err);
    })