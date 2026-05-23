import { createInterface } from 'node:readline/promises'
import { config } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import chalk from 'chalk'
import { runAgent, shutdown } from '../agent.mjs'
import { loadConfig, loadEnvFromConfig, getMissingFields, saveConfig } from './config.mjs'

// 检测是否存在 .env 文件（开发环境）
const hasLocalEnv = existsSync(resolve(process.cwd(), '.env'))

// 加载项目目录的 .env（如果存在）
config()

async function setupConfig(rl) {
    console.log(chalk.yellow('⚠️ 基础配置信息不完整，需要先填写一下：\n'))

    const config = await loadConfig()
    const missingFields = getMissingFields(config)

    for (const field of missingFields) {
        console.log(chalk.gray(`${field.label}: ${field.description}`))

        let value = ''
        while (!value || value.trim() === '') {
            const promptText = field.defaultValue
                ? `${field.label} (按回车使用默认值: ${field.defaultValue}): `
                : `${field.label}: `

            value = await rl.question(chalk.cyan(promptText))
            value = value.trim()

            if (!value && field.defaultValue) {
                value = field.defaultValue
            }

            if (!value) {
                console.log(chalk.red('大哥你这个都不填我怎么上班 😆'))
            }
        }

        config[field.key] = value
        process.env[field.key] = value
    }

    await saveConfig(config)
    console.log(chalk.green('\n✅ 配置已保存！\n'))
}

export const runCli = async () => {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    const config = await loadConfig()
    const missingFields = getMissingFields(config)

    if (missingFields.length > 0) {
        await setupConfig(rl)
    }

    // 如果存在 .env 文件（开发环境），.xianyu 不覆盖 .env
    // 如果不存在 .env 文件（生产环境），.xianyu 覆盖 .env
    await loadEnvFromConfig(!hasLocalEnv)

    process.on('SIGINT', async () => {
        await shutdown()
        process.exit(0)
    })
    process.on('SIGTERM', async () => {
        await shutdown()
        process.exit(0)
    })

    console.log(chalk.cyan('有思想的人总是孤独，还好我只是一条咸鱼 😅\n'))
    console.log(chalk.gray('想问什么就问吧，或者输入 "exit" 让我走？\n'))

    while (true) {
        const query = await rl.question(chalk.yellow('> '))

        if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
            await shutdown()
            console.log(chalk.cyan('👋 光速下班！'))
            rl.close()
            break
        }

        if (query.trim() === '') {
            continue
        }

        try {
            await runAgent(query)
        } catch (error) {
            console.error(chalk.red('❌ 哥，出了点状况：'), error.message)
        }
    }
}
