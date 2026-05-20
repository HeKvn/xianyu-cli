import { createInterface } from 'node:readline/promises'
import { config } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import chalk from 'chalk'
import { runAgent } from '../agent.mjs'
import { loadConfig, loadEnvFromConfig, getMissingFields, saveConfig } from './config.mjs'

// 检测是否存在 .env 文件（开发环境）
const hasLocalEnv = existsSync(resolve(process.cwd(), '.env'))

// 加载项目目录的 .env（如果存在）
config()

async function setupConfig(rl) {
    console.log(chalk.yellow('⚠️  检测到配置不完整，请先完成以下配置：\n'))

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
                console.log(chalk.red('❌ 此项为必填项，请输入有效值'))
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

    console.log(chalk.cyan('有思想的人总是孤独，还好我只是一条咸鱼😅\n'))
    console.log(chalk.gray('输入你的问题，或输入 "exit" 退出\n'))

    while (true) {
        const query = await rl.question(chalk.yellow('> '))

        if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
            console.log(chalk.cyan('👋 再见！'))
            rl.close()
            break
        }

        if (query.trim() === '') {
            continue
        }

        try {
            await runAgent(query)
            // const response = await runAgent(query)
            // console.log(chalk.green('🤖 AI:'), response, '\n')
        } catch (error) {
            console.error(chalk.red('❌ 哥！出了点问题:'), error.message)
        }
    }
}
