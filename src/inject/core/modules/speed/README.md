## `speed` module

Performs an internet connection speedtest

## Usage

```js
injectify.module('speed', function(speed, err) {
    console.log(speed)
})
// {
//   "duration": 5.576,
//   "speed": {
//     "bps": "7525579.63",
//     "kbps": "7349.20",
//     "mbps": "7.18"
//   },
//   "downlink": 2.85
// }


injectify.module('speed', {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Snake_River_%285mb%29.jpg',
    bytes: 5245329 // The file-size in bytes of the above URL
}).then(speed => {
    console.log(speed)
}).catch(error => {
    injectify.error(error)
})
// {
//   "duration": 5.576,
//   "speed": {
//     "bps": "7525579.63",
//     "kbps": "7349.20",
//     "mbps": "7.18"
//   },
//   "downlink": 2.85
// }
```