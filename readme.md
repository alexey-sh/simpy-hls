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
