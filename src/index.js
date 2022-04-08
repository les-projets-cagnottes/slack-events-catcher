require('dotenv').config();
const cron = require('node-cron');
const request = require('request');
const fs = require('fs');
const logger = require('./logger.js');
require("./events.js");

const TOKEN_LOCATION = 'core-token';
var coreApiToken = ''

cron.schedule("*/5 * * * *", function () {

    // Verify LPC API is available
    const options = {
        url: `${process.env.LPC_CORE_API_URL}/actuator/health`
    };
    request(options, (err, res) => {
        if (err) { logger.log(err); } else { logger.log(`Core API status : ${res.statusCode}`) }
    });
    
    // Read token file if exists
    fs.access(TOKEN_LOCATION, fs.constants.R_OK, function (err) {
        if (!err) {
            logger.log("A token file has been found");
            coreApiToken = fs.readFileSync(basename, 'utf8');
            fs.unlinkSync(basename);
        }
    });
});
