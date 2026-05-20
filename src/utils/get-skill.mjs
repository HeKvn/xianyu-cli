import os from 'os'
import fs from 'fs'
import path from 'path'

export const getUserHomeDir = () => os.homedir()

export function getSkills() {
  const homeDir = getUserHomeDir()
  const skillsDir = path.join(homeDir, '.agents', 'skills')

  if (!fs.existsSync(skillsDir)) {
    return []
  }

  const items = fs.readdirSync(skillsDir, { withFileTypes: true })
  return items
    .filter(item => item.isDirectory())
    .map(item => item.name)
}
