// Generates backwards compatible runtime no-ops after build completes
// - lib/empty.js   → empty ESM module (runtime no-op)
// - lib/empty.cjs  → empty CJS module (runtime no-op)

import {mkdirSync, writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import path from 'node:path'

// Logging helpers
const GREY = '\x1b[0m'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const TAG = `[compat-shims]${GREY}`
const info = (msg) => console.log(`${GREEN}${TAG} ${msg}`)
const fail = (msg, err) => {
  console.error(`${RED}${TAG}${GREY} ${msg}`)
  if (err) console.error(err)
  process.exitCode = 1
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LIB_DIR = path.resolve(__dirname, '..', 'lib', 'compat')
const EMPTY_ESM = path.join(LIB_DIR, 'empty.js')
const EMPTY_CJS = path.join(LIB_DIR, 'empty.cjs')
const compatComment = '// Generated for backwards compatibility'

try {
  mkdirSync(LIB_DIR, {recursive: true})

  const esmStub = `${compatComment}
export {}
`
  const cjsStub = `${compatComment}
module.exports = {}
`

  writeFileSync(EMPTY_ESM, esmStub, 'utf8')
  writeFileSync(EMPTY_CJS, cjsStub, 'utf8')

  info('Wrote runtime compat no-op files')
} catch (err) {
  fail('Failed to write runtime compat no-op files', err)
}
