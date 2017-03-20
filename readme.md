## example

```
var path = require('path');
var hls = require('./hls');

hls.start(7090);

hls.stream(path.join(__dirname, '1.mp4')).then(function () {
    console.log('started stream');
}).catch(function (e) {
    console.log('error');
    console.log(e.toString());
});
```


the next command will be executed

```
ffmpeg -y -i /Users/alexey/projects/temp/1.mp4 -vbsf h264_mp4toannexb -c:v copy -c:a copy -start_number 0 -hls_time 20 -hls_list_size 0 -f hls /Users/alexey/projects/temp/output/1/index.m3u8

```
