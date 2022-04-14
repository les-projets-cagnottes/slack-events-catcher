require('dotenv').config();
const request = require('request');
const { App, LogLevel } = require('@slack/bolt');
const logger = require('./logger.js');
const Pool = require('pg').Pool;
const HttpsProxyAgent = require('https-proxy-agent');

const proxy = process.env.HTTP_PROXY ? new HttpsProxyAgent(process.env.HTTP_PROXY) : null;
const PORT = process.env.LPC_SEC_EVENTS_PORT ? process.env.LPC_SEC_EVENTS_PORT : 3000;
var coreApiToken = ''

const pool = new Pool();

const authorizeFn = async ({ teamId, enterpriseId }) => {
    const { rows, error } = await pool.query('SELECT * FROM slack_team')
    if (error) {
        throw error
    }
    for (const team of rows) {
        if (team.team_id === teamId) {
            return {
                userToken: team.access_token,
                botToken: team.bot_access_token,
                botId: team.bot_id,
                botUserId: team.bot_user_id
            };
        }
    }
    throw new Error('No matching authorizations');
}

const slackEvents = new App({
    signingSecret: process.env.LPC_SLACK_SIGNING_SECRET,
    agent: proxy,
    authorize: authorizeFn,
    logLevel: LogLevel.INFO,
    customRoutes: [
        {
            path: '/health',
            method: ['GET'],
            handler: (req, res) => {
                res.writeHead(200);
                res.end();
            }
        }, {
            path: '/token',
            method: ['POST'],
            handler: (req, res) => {
                var body = '';
                req.on('data', function (data) {
                    body += data;
                });
                req.on('end', function () {
                    logger.log('Received a new core token');
                    coreApiToken = JSON.parse(body).token;
                    res.writeHead(200);
                    res.end();
                });
            }
        }
    ],
});

slackEvents.message(async ({message, say}) => {
    logger.log(`Received message : ${message.text}`);
    await say(message.text);
});

slackEvents.command('/projet-cagnotte', async ({ command, ack, respond }) => {
    await ack();
    logger.log(`Received a command : ${JSON.stringify(command)}`);
    if (coreApiToken === '') {
        logger.log('ERROR : Cannot process command. No core token provided');
        error();
    }
    if(command.text === 'hello') {
        const options = {
            method: 'POST',
            url: `${process.env.LPC_CORE_API_URL}/api/slack/${command.team_id}/hello`,
            headers: {
                'Authorization': `Bearer ${coreApiToken}`,
                'Content-Type': 'application/json'
            }
        };
        request(options, (err, res) => {
            if (err) { logger.log(err); } else { logger.log(`Sending hello world message in team ${command.team_id} : ${res.statusCode}`) }
        });
    }
});

slackEvents.event('team_join', async (event) => {
    logger.log(`Received an event : ${JSON.stringify(event)}`);
    const newUserJson = event.body.event.user;
    var newUser = {
        email: newUserJson.profile.email,
        firstname: newUserJson.profile.real_name,
        avatarUrl: newUserJson.profile.image_192,
        slackUsers: [{
            email: newUserJson.profile.email,
            slackId: newUserJson.id
        }]
    }
    if (coreApiToken === '') {
        logger.log('ERROR : Cannot create User with Slack ID ' + newUserJson.id + ' in Core API. No token provided');
        error();
    }
    const options = {
        method: 'POST',
        url: `${process.env.LPC_CORE_API_URL}/api/slack/${newUserJson.team_id}/member`,
        headers: {
            'Authorization': `Bearer ${coreApiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    };
    request(options, (err, res) => {
        if (err) { logger.log(err); } else { logger.log(`Creating Slack User ${newUserJson.id} : ${res.statusCode}`) }
    });
});

slackEvents.event('user_change', (event) => {
    logger.log(`Received an event : ${JSON.stringify(event)}`);
    const newUserJson = event.body.event.user;
    var newUser = {
        email: newUserJson.profile.email,
        firstname: newUserJson.profile.real_name,
        avatarUrl: newUserJson.profile.image_192,
        enabled: !(newUserJson.deleted || newUserJson.is_restricted),
        slackUsers: [{
            email: newUserJson.profile.email,
            slackId: newUserJson.id
        }]
    }
    if (coreApiToken === '') {
        logger.log('ERROR : Cannot update User with Slack ID ' + newUserJson.id + ' in Core API. No token provided')
        error();
    }
    const options = {
        method: 'PUT',
        url: `${process.env.LPC_CORE_API_URL}/api/slack/${newUserJson.team_id}/member`,
        headers: {
            'Authorization': `Bearer ${coreApiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    };
    request(options, (err, res) => {
        if (err) { logger.log(err); } else { logger.log(`Updating Slack User ${newUserJson.id} : ${res.statusCode}`) }
    });
});

slackEvents.error((error) => {
    logger.log(error);
});

(async () => {
    // Start the built-in server
    const server = await slackEvents.start(PORT);

    // Log a message when the server is ready
    logger.log(`Slack Bot listening on ${server.address().port}`);
})();
