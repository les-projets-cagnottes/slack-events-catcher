const http = require("http");
const fs = require('fs');
const path = require('path');
const logger = require('./logger.js');

const host = 'localhost';
const port = 8000;
const tokenLocation = 'core-token';
const tokenTimeout = '1000';

(function() {
    const requestListener = function (req, res) {
        if (req.url == '/token' && req.method == 'POST') {
            logger.log('POST /token');
            var body = '';
            req.on('data', function(data) {
              body += data;
            });
            req.on('end', function() {
              fs.writeFileSync(tokenLocation, JSON.parse(body).token);
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end('{"ok": true}');
            });
        } else {
            res.writeHead(404, {'Content-Type': 'application/octet-stream'});
            res.end();
        }
    };
    const server = http.createServer(requestListener);
    server.listen(port, host, () => {
        logger.log(`Controller listening on ${port}`);
    });
    
    module.exports.waitForToken = function (callback) {
        
        fs.access(tokenLocation, fs.constants.R_OK, function (err) {
            if (!err) {
                logger.log("A token file has been found");
                watcher.close();
                callback(fs.readFileSync(basename, 'utf8'));
                fs.unlinkSync(basename);
                setTimeout(module.exports.waitForToken, tokenTimeout, callback);
            }
        });

        var dir = path.dirname(tokenLocation);
        var basename = path.basename(tokenLocation);
        var watcher = fs.watch(dir, function (eventType, filename) {
            if (eventType === 'rename' && filename === basename) {
                logger.log("A new token has been provided");
                watcher.close();
                callback(fs.readFileSync(basename, 'utf8'));
                fs.unlinkSync(basename);
                setTimeout(module.exports.waitForToken, tokenTimeout, callback);
            }
        });
    }

}());
