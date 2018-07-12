const Boom = require('boom')
const Hoek = require('hoek')

const Authentic = require('@articulate/authentic')

const extractBearerToken = req => {
  const token = (req.headers.authorization || '').trim().split(/\s/)[1]
  if (!token) throw Boom.unauthorized(null, 'Missing Bearer token')
  return token
};

const scheme = (server, options) => {
  Hoek.assert(options, 'Missing authentic auth strategy options')
  Hoek.assert(options.issWhitelist instanceof Array, 'issWhitelist option must be an array')

  const settings = Hoek.clone(options)
  const authentic = Authentic({ issWhitelist: settings.issWhitelist })

  const authenticate = (request, reply) => {
    try {
      const token = extractBearerToken(request)
      return authentic(token)
        .then(credentials => reply.continue({ credentials }))
        .catch(reply)
    } catch (e) {
      return reply(e)
    }
  }

  return { authenticate }
};

const register = (server, options, next) => {
  server.auth.scheme('authentic', scheme)
  server.log(['hapi-authentic'], 'authentic auth plugin registered')
  return next()
}

register.attributes = {
  pkg: require('./package.json')
}

exports.register = register
