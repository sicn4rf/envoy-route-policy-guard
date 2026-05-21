import { matchRoutes } from '../src/match.js'
import type { HTTPRoute, SecurityPolicy } from '../src/types.js'

it('flags an HTTPRoute with no matching SecurityPolicy', () => {
  const routes: HTTPRoute[] = [
    { filename: 'r.yaml', kind: 'HTTPRoute', metadata: { name: 'httpbin' } }
  ]
  expect(matchRoutes(routes, [])).toHaveLength(1)
})

it('passes when a SecurityPolicy targets the route', () => {
  const routes: HTTPRoute[] = [
    { filename: 'r.yaml', kind: 'HTTPRoute', metadata: { name: 'httpbin' } }
  ]
  const policies: SecurityPolicy[] = [
    {
      filename: 'p.yaml',
      kind: 'SecurityPolicy',
      metadata: { name: 'jwt' },
      targetRefs: [{ kind: 'HTTPRoute', name: 'httpbin' }]
    }
  ]
  expect(matchRoutes(routes, policies)).toHaveLength(0)
})
