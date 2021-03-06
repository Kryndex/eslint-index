/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const yargs = require('yargs')
const Constants = require('./constants')

function coerceRules(rules) {
  const parsedRules = rules.map((rule) => {
    if (rule.endsWith('.js')) {
      const file = path.resolve(rule)
      const stats = fs.statSync(file)
      if (stats && stats.isFile()) {
        const module = require(file)
        return _.isArray(module) || _.isString(module) ? module : rule
      } else {
        return rule
      }
    } else {
      return rule
    }
  })
  return _.uniq(_.flatten(parsedRules))
}

const argv = yargs.usage('Usage: $0 <file> [options]')
  .example('$0 .eslintrc', 'List all available rules')
  .example('$0 .eslintrc --format number', 'Output the number of rules')
  .example('$0 .eslintrc --format table', 'Output rule group and status numbers in a table')
  .example('$0 .eslintrc --groups eslint react', 'List all available rules for "eslint" and "react"')
  .example('$0 .eslintrc --status omitted off', 'List rules that have been turned "off" or "omitted"')
  .example('$0 .eslintrc --exclude curly semi', 'List all available rules excluding "curly" and "semi"')
  .example('$0 .eslintrc --docs', 'Display links to rule docs alongside each rule')
  .demand(1, '.eslintrc config file required')
  .check((args) => {
    const file = _.first(args._)
    const stats = fs.statSync(file)
    if (stats && stats.isFile()) {
      return true
    } else {
      throw new Error(`${file} does not exist`)
    }
  })
  .options({
    format: {
      alias: 'f',
      type: 'string',
      choices: Constants.FORMATS,
      default: Constants.FORMAT_LIST,
      description: 'Format output as a list, table or number'
    },
    groups: {
      alias: 'g',
      type: 'array',
      description: 'Filter rules by group such as "eslint" or "react"'
    },
    status: {
      alias: 's',
      type: 'array',
      choices: Constants.STATUS_KEYS,
      description: 'Filter rules by status such as "omitted" or "error"'
    },
    docs: {
      alias: 'd',
      type: 'boolean',
      description: 'Display links to rule docs alongside each rule'
    },
    include: {
      alias: 'i',
      type: 'array',
      description: 'Filter rule ids to the output (can be a JS file that exports an array of rule ids)',
      coerce: coerceRules
    },
    exclude: {
      alias: 'e',
      type: 'array',
      description: 'Reject rule ids from the output (can be a JS file that exports an array of rule ids)',
      coerce: coerceRules
    }
  })
  .recommendCommands()
  .wrap(100)
  .strict()
  .help()
  .argv

module.exports = {
  file: _.first(argv._),
  include: argv.include,
  exclude: argv.exclude,
  groups: argv.groups,
  status: argv.status,
  format: argv.format,
  docs: argv.docs
}
