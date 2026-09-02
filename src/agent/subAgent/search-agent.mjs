import { createAgent } from 'langchain'
import { webSearchTool } from '../../tool/web-search.mjs'

export const createSearchAgent = (model) => createAgent({
  model,
  tools: [webSearchTool],
  systemPrompt: '你是 Search Agent，只负责使用 webSearch 工具查找和整理最新的联网信息。你不能修改文件或执行命令。\n',
})
