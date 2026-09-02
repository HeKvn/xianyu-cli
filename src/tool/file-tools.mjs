import { tool } from '@langchain/core/tools'
import fs from 'node:fs/promises'
import { z } from 'zod'

// 文件读取工具
const readFile = async ({filePath}) => {
    try {
        // console.log(`工具调用: readFile, filePath: ${filePath}`)
        const content = await fs.readFile(filePath, 'utf-8')
        console.log(`[工具调用] read_file("${filePath}") - 成功读取 ${content.length} 字节`);
        return `文件内容：${content}`
    } catch (error) {
        return `读取文件 ${filePath} 失败：${error.message}`
    }
}
export const readFileTool = tool(readFile, {
    name: 'readFile',
    description: '读取文件内容',
    schema: z.object({
        filePath: z.string().describe('文件路径'),
    }),
})

// 文件写入工具
const writeFile = async ({filePath, content}) => {
    try {
        // console.log(`工具调用：writeFile, filePath: ${filePath}`)
        await fs.writeFile(filePath, content, 'utf-8')
        console.log(`[工具调用] write_file("${filePath}") - 成功写入 ${content.length} 字节`);
        return `文件内容已写入文件 ${filePath}`
    } catch (error) {
        return `写入文件 ${filePath} 失败：${error.message}`
    }
}
export const writeFileTool = tool(writeFile, {
    name: 'writeFile',
    description: '写入文件内容',
    schema: z.object({
        filePath: z.string().describe('文件路径'),
        content: z.string().describe('文件内容'),
    }),
})

// 列出目录内容工具
const listDir = async ({dirPath}) => {
    try {
        // console.log(`工具调用: listDir, dirPath: ${dirPath}`)   
        const files = await fs.readdir(dirPath)
        console.log(`[工具调用] list_dir("${dirPath}") - 成功列出 ${files.length} 个文件`);
        return `目录内容：${files.join('\n')}`
    } catch (error) {
        return `列出目录 ${dirPath} 失败：${error.message}`
    }
}
export const listDirTool = tool(listDir, {
    name: 'listDir',
    description: '列出目录内容',
    schema: z.object({
        dirPath: z.string().describe('目录路径'),
    }),
})
