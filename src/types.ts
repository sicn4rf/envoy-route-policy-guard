export interface HTTPRoute {
  filename: string
  kind: string
  metadata: {
    name: string
  }
}

export interface SecurityPolicy {
  filename: string
  kind: string
  metadata: {
    name: string
  }
  targetRefs: {
    kind: string
    name: string
  }[]
}
