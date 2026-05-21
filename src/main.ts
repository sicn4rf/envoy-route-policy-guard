import * as core from '@actions/core'
import * as github from '@actions/github'
import { parseHTTPRoute, parseSecurityPolicy } from './parse.js'
import { matchRoutes } from './match.js'
import { HTTPRoute, SecurityPolicy } from './types.js'
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
        httpRoutes.push(parseHTTPRoute(data, data.filename))
      }
      if (data.kind === 'SecurityPolicy') {
        securityPolicies.push(parseSecurityPolicy(data, data.filename))
      }
    }
  }

  let unmatchedRoutes: HTTPRoute[] = matchRoutes(httpRoutes, securityPolicies)
  if (unmatchedRoutes.length > 0) {
    core.setOutput('unmatched_routes', unmatchedRoutes.map(route => route.filename).join(', '))
  }
}
