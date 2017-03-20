var spawn = require('child_process').spawn;
var path = require('path');
var url = require('url');
var fs = require('fs');
var http = require('http');

module.exports = {
    setup: setupHls,
    stream: setupStream,
    start: startServer
};

var options = {
    ffmpegPath: 'ffmpeg',
    outputDir: path.join(__dirname, './output')
};

function getFfmpegOpts(file, output) {
    var opt = [
        '-y',
        '-i', file,
        '-vbsf', 'h264_mp4toannexb',
        '-c:v', 'copy',
        '-c:a', 'copy',
        '-start_number', '0',
        '-hls_time', '20',
        '-hls_list_size', '0',
        '-f', 'hls',
         path.join(output, 'index.m3u8')
    ];
    return opt;
}

function exec(command, args) {
    return new Promise(function (resolve, reject) {
        console.log('exec');
        console.log(command, args.join(' '));
        var thread = spawn(command, args);
        var output = '';
        thread.stdout.on('data', function (chunk) {
            output += chunk;
        });
        thread.stdout.on('error', function (err) {
            reject(err);
        });
        thread.stdout.on('end', function () {
            resolve(output);
        });
    });
}

function setupHls(opts) {
    for (var key in opts) {
        if (opts.hasOwnProperty(key)) {
            options[key] = opts[key];
        }
    }
}

function setupStream(filePath) {
    var output = path.join(options.outputDir, path.basename(filePath).split('.').slice(0, -1).join('.'));
    return exec('mkdir', ['-p', output]).then(function () {
        return exec(options.ffmpegPath, getFfmpegOpts(filePath, output));
    });
}

function startServer(port) {
    http.createServer(function (req, res) {
        var uri = url.parse(req.url).pathname;
        var filename = path.join(options.outputDir, uri);
        switch (path.extname(uri).toUpperCase()) {
            case '.M3U8':
                fs.readFile(filename, function (err, contents) {
                    if (err) {
                        res.writeHead(500);
                        res.end();
                    }
                    else if (contents) {
                        res.writeHead(200, {
                            'Content-Type': 'application/vnd.apple.mpegurl'
                        });
                        res.end(contents, 'utf-8');
                    }
                    else {
                        console.log('emptly playlist');
                        res.writeHead(500);
                        res.end();
                    }
                });
                break;
            case '.TS':
                res.writeHead(200, {
                    'Content-Type': 'video/MP2T'
                });
                var stream = fs.createReadStream(filename,
                    { bufferSize: 64 * 1024 });
                stream.pipe(res);
                break;
            default:
                console.log('unknown file type: ' + path.extname(uri));
                res.writeHead(500);
                res.end();
        }
    }).listen(port);
}
