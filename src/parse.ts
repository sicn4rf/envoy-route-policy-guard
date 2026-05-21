import { HTTPRoute, SecurityPolicy } from './types.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseHTTPRoute(data: any, filename: string): HTTPRoute {
  return {
    filename: filename,
    kind: data.kind,
    metadata: {
      name: data.metadata.name
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSecurityPolicy(
  data: any,
  filename: string
): SecurityPolicy {
  return {
    filename: filename,
    kind: data.kind,
    metadata: {
      name: data.metadata.name
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    targetRefs: data.spec.targetRefs.map((ref: any) => {
      return {
        name: ref.name,
        kind: ref.kind
      }
    })
  }
}
