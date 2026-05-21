import * as core from '@actions/core'
import * as github from '@actions/github'
import { parseHTTPRoutes, parseSecurityPolicies } from './parse.ts'
import { HTTPRoute, SecurityPolicy } from './types.ts'
import * as fs from 'fs'
import * as yaml from 'js-yaml'

export async function checkSecurityPolicyGuard(): Promise<void> {
  const context = github.context
  const token = process.env.GITHUB_TOKEN
  const client = github.getOctokit(token)

  const response = await client.rest.pulls.listFiles({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.payload.pull_request?.number
  })

  const files = response.data.map( (file) => file.filename )

  let httpRoutes: HTTPRoute[]= []
  let securityPolicies: SecurityPolicy[] = []
  
  for (const file of files) {
    if (file.endsWith('.yaml')) {
      const fileContent = fs.readFileSync(file, 'utf8')
      const data = yaml.parse(fileContent)

      if (data.kind === 'HTTPRoute') {
        httpRoutes.push({
          filename: data.filename,
          kind: data.kind,
          metadata: {
            name: data.metadata.name
          }
        } as HTTPRoute)
      }
      if (data.kind === 'SecurityPolicy') {
        securityPolicies.push({
          filename: data.filename,
          kind: data.kind,
          metadata: {
            name: data.metadata.name
          },
          targetRefs: data.targetRefs.map( (ref) => ({
            kind: ref.kind,
            name: ref.name
          }))
        } as SecurityPolicy)
      }
    }
  }

  let unmatchedRoutes: HTTPRoute[] = matchRoutes(httpRoutes, securityPolicies)
  if (unmatchedRoutes.length > 0) {
    core.setOutput('unmatched_routes', unmatchedRoutes.map(route => route.filename).join(', '))
  }
}
