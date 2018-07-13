# hapi-authentic
[![@articulate/hapi-authentic](https://img.shields.io/npm/v/@articulate/hapi-authentic.svg)](https://www.npmjs.com/package/@articulate/hapi-authentic)
[![Build Status](https://travis-ci.org/articulate/hapi-authentic.svg?branch=master)](https://travis-ci.org/articulate/hapi-authentic)

A hapi 16.x JWT/Bearer auth plugin using [@articulate/authentic](https://github.com/articulate/authentic).

## Use

```javascript
const Authentic = require('@articulate/hapi-authentic')
server.register(Authentic, err => {
  if (err) throw err
  server.auth.strategy('bearer', 'authentic', { issWhitelist: ['https://iss'] })
  server.route({
    method: 'GET',
    path: '/test',
    config: {
      auth: 'bearer',
      handler: (request, reply) =>
        reply()
    }
  })
})
```
