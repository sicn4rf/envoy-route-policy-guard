import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'
import * as yaml from 'yaml'
import { parseHTTPRoute, parseSecurityPolicy } from './parse.js'
import { matchRoutes } from './match.js'
import { HTTPRoute, SecurityPolicy } from './types.js'


export async function checkSecurityPolicyGuard(): Promise<void> {
  try {
    core.info('Checking security policy guard...')

    core.info('Getting context and token')
    const context = github.context
    const token = core.getInput('github-token', { required: true })

    core.info('Checking if token and pull request number are set')
    if (!token) {
      core.error('GITHUB_TOKEN is not set')
      throw new Error('GITHUB_TOKEN is not set')
    }

    const prNumber = context.payload.pull_request?.number
    if (!prNumber || prNumber === undefined) {
      core.error('Pull request number is not set')
      throw new Error('Pull request number is not set')
    }

    core.info('Getting octokit client')
    const client = github.getOctokit(token)

    core.info('Getting list of files in pull request')
    const response = await client.rest.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber
    })

    const files = response.data.map( (file) => file.filename )

    const httpRoutes: HTTPRoute[]= []
    const securityPolicies: SecurityPolicy[] = []
    
    core.info('Parsing yaml files')
    for (const file of files) {
      if (file.endsWith('.yaml')) {
        const fileContent = fs.readFileSync(file, 'utf8')
        const data = yaml.parse(fileContent)

        core.info(`Parsing ${file}...`)
        if (data.kind === 'HTTPRoute') {
          core.info(`${file} is HTTPRoute`)
          httpRoutes.push(parseHTTPRoute(data, file))
        }
        if (data.kind === 'SecurityPolicy') {
          core.info(`${file} is SecurityPolicy`)
          securityPolicies.push(parseSecurityPolicy(data, file))
        }
      }
    }

    core.info('Matching routes and policies')
    const unmatchedRoutes: HTTPRoute[] = matchRoutes(httpRoutes, securityPolicies)

    if (unmatchedRoutes.length > 0) {
      core.setOutput('unmatched_routes', unmatchedRoutes.map(route => route.filename).join(', '))
      core.setFailed('Some HTTPRoutes are not matched with any SecurityPolicy')
    }
    else {
      core.setOutput('unmatched_routes', 'All HTTPRoutes are matched with SecurityPolicies')
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message: String(error))
  }
}
