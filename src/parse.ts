import { HTTPRoute, SecurityPolicy } from './types.js'

export function parseHTTPRoute(data: any, filename: string): HTTPRoute {
    return {
        filename: filename,
        kind: data.kind,
        metadata: {
            name: data.metadata.name
        }
    }
}

export function parseSecurityPolicy(data: any, filename: string): SecurityPolicy {
    return {
        filename: filename,
        kind: data.kind,
        metadata: {
            name: data.metadata.name
        },
        targetRefs: data.targetRefs.map((ref: any) => {
            return {
            name: ref.name,
            kind: ref.kind
        }
        })
    }
}