import { tool } from '@langchain/core/tools'
import { spawn } from 'node:child_process'
import { z } from 'zod'

// 执行命令工具
const executeCommand = async ({command, workingDirectory}) => {
    try {
        const cwd = workingDirectory || process.cwd()
        console.log(`执行命令：${command}，工作目录：${cwd}`)
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ')
            const child = spawn(cmd, args, { shell: true, cwd, stdio: 'inherit' })
            child.on('close', (code) => {
                if (code === 0) {
                    console.log(`命令执行成功：${command}`)
                    const cwdInfo = workingDirectory ? 
                        `\n\n重要提示：命令在工作目录workingDirectory： ${workingDirectory} 执行成功，如果需要在workingDirectory目录执行，直接指定 workingDirectory 即可，不要再cd到workingDirectory目录` : ''
                    resolve(`命令执行成功：${command}${cwdInfo}`)
                } else {
                    reject(`命令执行失败：${command}，退出码：${code}`)
                }
            })
        })
    } catch (error) {
        return `命令执行失败：${error.message}`
    }
}
export const executeCommandTool = tool(executeCommand, {
    name: 'executeCommand',
    description: '执行命令',
    schema: z.object({
        command: z.string().describe('要执行的命令'),
        workingDirectory: z.string().optional().describe('命令执行的工作目录'),
    }),
})
