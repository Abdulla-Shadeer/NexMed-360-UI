#!/usr/bin/env node
import { execSync } from 'child_process'

try {
  execSync('npx lint-staged', { stdio: 'inherit' })
} catch (e) {
  process.exit(1)
}