var http = require('http');
var fs = require('fs');
var path = require('path');

var PORT = 3000;
var ROOT = path.resolve(__dirname, '..');

var MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.webp': 'image/webp'
};

var server = http.createServer(function(req, res) {
    var url = req.url.split('?')[0];
    if (url === '/') url = '/mystic_splash_screen.html';
    var filePath = path.join(ROOT, url);
    var ext = path.extname(filePath).toLowerCase();

    fs.readFile(filePath, function(err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found: ' + url);
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

server.listen(PORT, function() {
    console.log('Dev server running at http://localhost:' + PORT);
});
