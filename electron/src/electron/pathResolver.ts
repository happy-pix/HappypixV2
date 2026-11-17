import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { isDev } from './util.js'

export function getPreloadPath(): string {
  if (isDev()) {
    return path.join(app.getAppPath(), 'dist-electron', 'preload.cjs')
  }
  const resourcesPreload = path.join(process.resourcesPath, 'dist-electron', 'preload.cjs')
  if (fs.existsSync(resourcesPreload)) {
    return resourcesPreload
  }
  return path.join(app.getAppPath(), 'dist-electron', 'preload.cjs')
}

