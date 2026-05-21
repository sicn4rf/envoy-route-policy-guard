/**
 * The entrypoint for the action. This file simply imports and runs the action's
 * main logic.
 */
import { checkSecurityPolicyGuard } from './main.js'

/* istanbul ignore next */
checkSecurityPolicyGuard()
