import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const swPath = join(__dirname, '../public/sw.js')

const hash = execSync('git rev-parse --short HEAD').toString().trim()
const sw = readFileSync(swPath, 'utf-8')
const updated = sw.replace(
  /const CACHE_NAME = 'miniyard-[^']+'/,
  `const CACHE_NAME = 'miniyard-${hash}'`
)

if (updated === sw) {
  console.log(`SW cache name already set to miniyard-${hash}`)
} else {
  writeFileSync(swPath, updated)
  console.log(`SW cache name → miniyard-${hash}`)
}
