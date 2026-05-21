import { HTTPRoute, SecurityPolicy } from './types.js'

export function matchRoutes(httpRoutes: HTTPRoute[], securityPolicies: SecurityPolicy[]): HTTPRoute[] {
    let unmatchedRoutes: HTTPRoute[] = []

    for (const route of httpRoutes) {
        if (!securityPolicies.some(
          policy => policy.targetRefs.some(ref => ref.kind === route.kind && ref.name === route.metadata.name)
        )) {
          unmatchedRoutes.push(route)
        }
      }
    return unmatchedRoutes
}