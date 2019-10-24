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

    console.log('\x1b[36m%s\x1b[0m', "Reading configuration file");
    let configFile = await asyncReadFile('config.json');
    configFile = JSON.parse(configFile);
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
  async function getBackstopConfigurationFile() {

    let backstopConfigFile = await asyncReadFile('base_config.json');
    backstopConfigFile = JSON.parse(backstopConfigFile);
    return backstopConfigFile;

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

  async function assignViewports(configFile, backstopConfigFile) {

    console.log('\x1b[36m%s\x1b[0m', "Adding viewports");
    backstopConfigFile = {...backstopConfigFile, ...{viewports: configFile.viewports}};
    return backstopConfigFile;

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
  async function createScenarios(configFile, backstopConfigFile,referenceUrl,testUrl) {
    console.log('\x1b[36m%s\x1b[0m', "Creating test scenarios");

    let scenarios = [];

      pages.forEach(flutterPage =>{
        scenarios.push({
          label: `${flutterPage.name}.`,
          url: `${testUrl}${flutterPage.path}`,
          referenceUrl:`${referenceUrl}${flutterPage.path}`,
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

  async function buildBackstopFile(referenceUrl,testUrl){

    //console.log(`${referenceUrl}`+ " StagingLink "+`${testUrl}`);
      var configFile = await getConfigurationFile();
      var backstopConfigFile = await getBackstopConfigurationFile();
      backstopConfigFile = await assignViewports(configFile, backstopConfigFile);
      backstopConfigFile = await createScenarios(configFile,backstopConfigFile,referenceUrl,testUrl);
      await createBackstopFile(backstopConfigFile);
      console.log('\x1b[36m%s\x1b[0m', "Ready to execute Backstop Regression");
    }

    module.exports.buildBackstopFile = buildBackstopFile;