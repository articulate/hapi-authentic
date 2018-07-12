# hapi-authentic

a hapi 16.x auth plugin integrating [@articulate/authentic](https://github.com/articulate/authentic)

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
