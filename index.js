const Boom = require('boom')
const Hoek = require('hoek')

const Authentic = require('@articulate/authentic')

const extractBearerToken = req => {
  const match = (req.headers.authorization || '').match(/^Bearer (\w*)$/)
  if (match)
    return match[1]
  else
    throw Boom.unauthorized(null, 'Missing Bearer token')
};

const scheme = (server, options) => {
  Hoek.assert(options, 'Missing authentic auth strategy options')
  Hoek.assert(options.issWhitelist instanceof Array, 'issWhitelist option must be an array')

  const settings = Hoek.clone(options)
  const authentic = Authentic({ issWhitelist: settings.issWhitelist })

  const authenticate = (request, reply) =>
    Promise.resolve(request)
      .then(extractBearerToken)
      .then(authentic)
      .then(credentials => reply.continue({ credentials }))
      .catch(reply)

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
