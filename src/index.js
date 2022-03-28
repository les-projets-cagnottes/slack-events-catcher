require('dotenv').config();

const { createEventAdapter } = require('@slack/events-api');
const cron = require('node-cron');
const request = require('request');
const logger = require('./logger.js');
const controller = require("./controller.js");

const slackEvents = createEventAdapter(process.env.LPC_SLACK_SIGNING_SECRET);
const PORT = process.env.LPC_SEC_SLACK_PORT ? process.env.LPC_SEC_SLACK_PORT : 3000;
var coreApiToken = ''

controller.waitForToken(token => {
    coreApiToken = token
});

logger.log('Slack Signing Secret : ' + process.env.LPC_SLACK_SIGNING_SECRET);
logger.log('LPC Core API URL : ' + process.env.LPC_CORE_API_URL);

cron.schedule("*/5 * * * *", function () {
    logger.log("Healthcheck with core API");
    const options = {
        url: `${process.env.LPC_CORE_API_URL}/actuator/health`
    };
    request(options, (err, res) => {
        if (err) { logger.log(err); } else { logger.log(`Core API status : ${res.statusCode}`) }
    });
});

slackEvents.on('message', (event) => {
    logger.log(`Received an event : ${JSON.stringify(event)}`);
});

slackEvents.on('team_join', (event) => {
    logger.log(`Received an event : ${JSON.stringify(event)}`);
    const newUserJson = event.user;
    var newUser = {
        email: newUserJson.profile.email,
        firstname: newUserJson.profile.real_name,
        avatarUrl: newUserJson.profile.image_192,
        slackUsers: [{
            email: newUserJson.profile.email,
            slackId: newUserJson.id
        }]
    }
    if(coreApiToken === '') {
        logger.log('ERROR : Cannot create User with Slack ID ' + newUserJson.id + ' in Core API. No token provided');
        error();
    }
    const options = {
        method: 'POST',
        url: `${process.env.LPC_CORE_API_URL}/slack/${newUserJson.team_id}/member`,
        headers: {
            'Authorization': `Bearer ${coreApiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    };
    request(options, (err, res) => {
        if (err) { logger.log(err); } else { logger.log(`POST /slack/${newUserJson.team_id}/member : ${res.statusCode}`) }
    });
});

slackEvents.on('user_change', (event) => {
    logger.log(`Received an event : ${JSON.stringify(event)}`);
    const newUserJson = event.user;
    var newUser = {
        email: newUserJson.profile.email,
        firstname: newUserJson.profile.real_name,
        avatarUrl: newUserJson.profile.image_192,
        enabled: !newUserJson.disabled,
        slackUsers: [{
            email: newUserJson.profile.email,
            slackId: newUserJson.id
        }]
    }
    if(coreApiToken === '') {
        logger.log('ERROR : Cannot update User with Slack ID ' + newUserJson.id + ' in Core API. No token provided')
        error();
    }
    const options = {
        method: 'PUT',
        url: `${process.env.LPC_CORE_API_URL}/slack/${newUserJson.team_id}/member`,
        headers: {
            'Authorization': `Bearer ${coreApiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    };
    request(options, (err, res) => {
        if (err) { logger.log(err); } else { logger.log(`PUT /slack/${newUserJson.team_id}/member : ${res.statusCode}`) }
    });
});

(async () => {
    // Start the built-in server
    const server = await slackEvents.start(PORT);

    // Log a message when the server is ready
    logger.log(`Slack Bot listening on ${server.address().port}`);
})();