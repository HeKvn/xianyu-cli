import { homedir } from 'node:os'
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { join } from 'node:path'

const CONFIG_DIR = '.config'
const CONFIG_FILE = '.xianyu'

const DEFAULT_CONFIG = `# 咸鱼Agent 配置文件
# OpenAI API 配置
OPENAI_API_KEY=
OPENAI_API_BASE_URL=
MODEL_NAME=

# 安全护栏
MAX_AGENT_CALLS=30
`

const REQUIRED_FIELDS = [
    { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', description: '你的 OpenAI API 密钥' },
    { key: 'OPENAI_API_BASE_URL', label: 'API Base URL', description: 'API 基础地址 (默认: https://api.openai.com/v1)', defaultValue: 'https://api.openai.com/v1' },
    { key: 'MODEL_NAME', label: '模型名称', description: '使用的模型名称 (默认: gpt-4o-mini)', defaultValue: 'gpt-4o-mini' },
]

async function fileExists(path) {
    try {
        await access(path)
        return true
    } catch {
        return false
    }
}

export async function getConfigPath() {
    const home = homedir()
    return join(home, CONFIG_DIR, CONFIG_FILE)
}

export async function initConfig() {
    const configPath = await getConfigPath()
    const configDir = join(homedir(), CONFIG_DIR)

    if (!(await fileExists(configPath))) {
        await mkdir(configDir, { recursive: true })
        await writeFile(configPath, DEFAULT_CONFIG, 'utf-8')
        console.log('✅ 已创建默认配置文件:', configPath)
    }

    return configPath
}

export async function loadConfig() {
    const configPath = await getConfigPath()

    if (!(await fileExists(configPath))) {
        await initConfig()
    }

    const content = await readFile(configPath, 'utf-8')
    const config = {}

    for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        const equalIndex = trimmed.indexOf('=')
        if (equalIndex === -1) continue

        const key = trimmed.slice(0, equalIndex).trim()
        const value = trimmed.slice(equalIndex + 1).trim()

        if (key) {
            config[key] = value
        }
    }

    return config
}

export async function loadEnvFromConfig(override = false) {
    const config = await loadConfig()

    for (const [key, value] of Object.entries(config)) {
        if (value) {
            // override=true 时覆盖已存在的值（.xianyu 优先级高于 .env）
            if (override || !process.env[key]) {
                process.env[key] = value
            }
        }
    }

    return config
}

export function getMissingFields(config) {
    return REQUIRED_FIELDS.filter(field => !config[field.key] || config[field.key].trim() === '')
}

export async function saveConfig(config) {
    const configPath = await getConfigPath()

    let content = await readFile(configPath, 'utf-8').catch(() => DEFAULT_CONFIG)

    for (const [key, value] of Object.entries(config)) {
        const regex = new RegExp(`^${key}=.*$`, 'm')
        if (regex.test(content)) {
            content = content.replace(regex, `${key}=${value}`)
        } else {
            content += `\n${key}=${value}`
        }
    }

    await writeFile(configPath, content, 'utf-8')
}

export { REQUIRED_FIELDS }
