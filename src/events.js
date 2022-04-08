const { App } = require('@slack/bolt');
const fs = require('fs');
const logger = require('./logger.js');
const Pool = require('pg').Pool;

const PORT = process.env.LPC_SEC_EVENTS_PORT ? process.env.LPC_SEC_EVENTS_PORT : 3000;

const pool = new Pool({
    user: 'lesprojetscagnottes',
    host: 'localhost',
    database: 'lesprojetscagnottes',
    password: 'lesprojetscagnottes',
    port: 5432
});

const authorizeFn = async ({ teamId, enterpriseId }) => {
    pool.query('SELECT * FROM slack_team ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        logger.log(results.row);
        for (const team of results.rows) {
            if (team.team_id === teamId) {
                return {
                    userToken: team.access_token,
                    botToken: team.bot_access_token,
                    botId: process.env.LPC_SLACK_BOT_ID,
                    botUserId: team.bot_user_id
                };
            }
        }
        throw new Error('No matching authorizations');
    });
}

const slackEvents = new App({
    signingSecret: process.env.LPC_SLACK_SIGNING_SECRET,
    authorize: authorizeFn,
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
                    fs.writeFileSync(TOKEN_LOCATION, JSON.parse(body).token);
                    res.writeHead(200);
                    res.end();
                });
            }
        }
    ],
});

slackEvents.message(async (message) => {
    logger.log(`Received message : ${message.text}`);
});

slackEvents.event('team_join', async (event) => {
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
    const newUserJson = event.user;
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

(async () => {
    // Start the built-in server
    const server = await slackEvents.start(PORT);

    // Log a message when the server is ready
    logger.log(`Slack Bot listening on ${server.address().port}`);
})();
