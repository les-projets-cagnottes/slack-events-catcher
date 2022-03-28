const http = require("http");
const fs = require('fs');
const path = require('path');
const logger = require('./logger.js');

const HOST = 'localhost';
const PORT = process.env.LPC_SEC_CONTROLLER_PORT ? process.env.LPC_SEC_CONTROLLER_PORT : 8000;
const TOKEN_LOCATION = 'core-token';
const TOKEN_TIMEOUT = '1000';

(function() {
    const requestListener = function (req, res) {
        if (req.url == '/token' && req.method == 'POST') {
            logger.log('POST /token');
            var body = '';
            req.on('data', function(data) {
              body += data;
            });
            req.on('end', function() {
              fs.writeFileSync(TOKEN_LOCATION, JSON.parse(body).token);
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end('{"ok": true}');
            });
        } else {
            res.writeHead(404, {'Content-Type': 'application/octet-stream'});
            res.end();
        }
    };
    const server = http.createServer(requestListener);
    server.listen(PORT, HOST, () => {
        logger.log(`Controller listening on ${PORT}`);
    });
    
    module.exports.waitForToken = function (callback) {
        
        fs.access(TOKEN_LOCATION, fs.constants.R_OK, function (err) {
            if (!err) {
                logger.log("A token file has been found");
                watcher.close();
                callback(fs.readFileSync(basename, 'utf8'));
                fs.unlinkSync(basename);
                setTimeout(module.exports.waitForToken, TOKEN_TIMEOUT, callback);
            }
        });

        var dir = path.dirname(TOKEN_LOCATION);
        var basename = path.basename(TOKEN_LOCATION);
        var watcher = fs.watch(dir, function (eventType, filename) {
            if (eventType === 'rename' && filename === basename) {
                logger.log("A new token has been provided");
                watcher.close();
                callback(fs.readFileSync(basename, 'utf8'));
                fs.unlinkSync(basename);
                setTimeout(module.exports.waitForToken, TOKEN_TIMEOUT, callback);
            }
        });
    }

}());
