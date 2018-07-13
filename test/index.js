const { createSandbox } = require('sinon')
const { expect } = require('code')
const mockery = require('mockery')
const Hapi = require('hapi')
const Lab = require('lab')
const Boom = require('boom')

const lab = exports.lab = Lab.script()
const { it } = lab

lab.experiment('hapi-authentic', () => {
  const sandbox = createSandbox()
  const route = {
    method: 'GET',
    path: '/test',
    config: {
      auth: 'bearer',
      handler: (request, reply) =>
        reply(request.auth.credentials)
    }
  }
  let mockAuthentic

  lab.before(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true,
    })
    mockery.registerMock('@articulate/authentic', () => mockAuthentic)
  })

  lab.afterEach(() => {
    sandbox.resetHistory()
    mockery.resetCache()
  })

  lab.after(() => {
    sandbox.restore()
    mockery.disable()
  })

  it('requires the issWhitelist option to be an array', () => {
    const server = new Hapi.Server()
    server.connection()

    return new Promise((resolve) => {
      server.register(require('../'), err => {
        expect(err).to.not.exist()
        try {
          server.auth.strategy('bearer', 'authentic', { issWhitelist: '' })
        } catch (e) {
          expect(e.message).to.equal('issWhitelist option must be an array')
          resolve()
        }
      })
    })
  })

  it('returns unauthorized when bearer token is missing', () => {
    const server = new Hapi.Server()
    server.connection()

    return new Promise((resolve) => {
      server.register(require('../'), err => {
        expect(err).to.not.exist()
        server.auth.strategy('bearer', 'authentic', { issWhitelist: ['https://iss'] })
        server.route(route)
        const request = {
          method: 'GET',
          url: '/test',
          headers: {}
        }
        server.inject(request, res => {
          expect(res.statusCode).to.equal(401)
          expect(res.result.message).to.equal('Missing authentication')
          resolve()
        })
      })
    })
  })

  lab.experiment('when authentic rejects w/ unauthorized', () => {
    lab.beforeEach(() => {
      mockAuthentic = sandbox.stub().rejects(Boom.unauthorized())
    })

    it('returns 401', () => {
      const server = new Hapi.Server()
      server.connection()

      return new Promise((resolve) => {
        server.register(require('../'), err => {
          expect(err).to.not.exist()
          server.auth.strategy('bearer', 'authentic', { issWhitelist: ['https://iss'] })
          server.route(route)
          const request = {
            method: 'GET',
            url: '/test',
            headers: {
              authorization: 'Bearer TOKENBOI'
            },
          }
          server.inject(request, res => {
            expect(res.statusCode).to.equal(401)
            expect(res.result.message).to.equal('Unauthorized')
            resolve()
          })
        })
      })
    })
  })

  lab.experiment('when authentic resolves', () => {
    lab.beforeEach(() => {
      mockAuthentic = sandbox.stub().resolves({ sub: 'mock-sub' })
    })

    it('returns 200', () => {
      const server = new Hapi.Server()
      server.connection()

      return new Promise((resolve) => {
        server.register(require('../'), err => {
          expect(err).to.not.exist()
          server.auth.strategy('bearer', 'authentic', { issWhitelist: ['https://iss'] })
          server.route(route)
          const request = {
            method: 'GET',
            url: '/test',
            headers: {
              authorization: 'Bearer TOKENBOI'
            },
          }
          server.inject(request, res => {
            expect(res.statusCode).to.equal(200)
            expect(res.result).to.equal({ sub: 'mock-sub' })
            resolve()
          })
        })
      })
    })
  })
})
