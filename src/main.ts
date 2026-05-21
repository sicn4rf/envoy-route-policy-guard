import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'
import * as yaml from 'yaml'
import { parseHTTPRoute, parseSecurityPolicy } from './parse.js'
import { matchRoutes } from './match.js'
import { HTTPRoute, SecurityPolicy } from './types.js'


export async function checkSecurityPolicyGuard(): Promise<void> {
  try {
    const context = github.context
    const token = process.env.GITHUB_TOKEN

    if (!token) {
      throw new Error('GITHUB_TOKEN is not set')
    }
    if (!context.payload.pull_request?.number) {
      throw new Error('Pull request number is not set')
    }

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
      core.setFailed('Some HTTPRoutes are not matched with any SecurityPolicy')
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message: String(error))
  }
}
