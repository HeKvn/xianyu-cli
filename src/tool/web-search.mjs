import { tool } from '@langchain/core/tools'
import { z } from 'zod'

const bochaSearch = async ({ query }) => {
    const apiKey = process.env.BOCHA_API_KEY
    if (!apiKey) {
        return `
            暂未设置博查API密钥，请设置环境变量BOCHA_API_KEY
            你可以在 https://open.bochaai.com/api-keys 申请API密钥
        `
    }
    const url = 'https://api.bochaai.com/v1/web-search'
    const body = {
        query,
        freshness: 'noLimit',
        summary: true,
        count: process.env.BOCHA_RESULT_COUNT ? parseInt(process.env.BOCHA_RESULT_COUNT) : 5,
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        const errorText = await response.text()
        return `博查搜索失败，状态码：${response.status}，错误信息：${errorText}`
    }

    let json
    try {
        json = await response.json()
    } catch (error) {
        return `搜索 API 请求失败，原因是：搜索结果解析失败 ${error.message}`
    }

    try {
        if (json.code !== 200 || !json.data) {
            return `博查搜索失败，错误信息：${json.message || '未知错误'}`
        }
        const webpages = json.data.webPages?.value ?? []
        if (!webpages.length) {
            return'未找到相关结果。'
        }
        const formatted = webpages.map((page, index) => `
            引用：${index + 1},
            标题：${page.name},
            链接：${page.url},
            摘要：${page.summary},
            网站名称: ${page.siteName},
            发布时间: ${page.dateLastCrawled}
        `).join('\n\n')
        return `搜索结果如下：\n\n${formatted}`
    } catch (error) {
        return `搜索 API 请求失败，原因是：${error.message}`
    }
}

export const webSearchTool = tool(bochaSearch, {
    name: 'webSearch',
    description: '使用博查API进行网络搜索，获取最新的网页信息。输入是一个搜索查询字符串，输出是搜索结果的格式化文本。',
    schema: z.object({
        query: z.string().describe('搜索查询'),
    }),
})