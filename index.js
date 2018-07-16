const Boom = require('boom')
const Hoek = require('hoek')

const Authentic = require('@articulate/authentic')

const extractBearerToken = ({ headers: { authorization = '' } }) => {
  const [, token] = authorization.match(/^Bearer (.*)$/) || []
  if (token)
    return token
  else
    throw Boom.unauthorized(null, 'Missing Bearer token')
}

const scheme = (server, options) => {
  Hoek.assert(options, 'Missing authentic auth strategy options')
  Hoek.assert(options.issWhitelist instanceof Array, 'issWhitelist option must be an array')

  const settings = Hoek.clone(options)
  const authentic = Authentic({ issWhitelist: settings.issWhitelist })

  server.log(['hapi-authentic'], `issuers whitelisted: ${settings.issWhitelist}`)

  const authenticate = (request, reply) =>
    Promise.resolve(request)
      .then(extractBearerToken)
      .then(authentic)
      .then(credentials => reply.continue({ credentials }))
      .catch(reply)

  return { authenticate }
}

const register = (server, options, next) => {
  server.auth.scheme('authentic', scheme)
  server.log(['hapi-authentic'], 'authentic auth plugin registered')
  return next()
}

register.attributes = {
  pkg: require('./package.json')
}

exports.register = register
