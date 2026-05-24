import { MarkdownStream } from 'streammark'
import { createAgent } from 'langchain'
import { ChatOpenAI } from '@langchain/openai'
import { MemorySaver } from "@langchain/langgraph";
import { MultiServerMCPClient } from "@langchain/mcp-adapters"
import { HumanMessage } from '@langchain/core/messages'
import { readFileTool, writeFileTool, listDirTool } from '../tool/file-tools.mjs'
import { executeCommandTool } from '../tool/command-tools.mjs'
import { duckGoSearch } from '../tool/web-search.mjs'
import { skillMiddleware } from '../middleware/skill-middleware.mjs'
import { getMcp } from '../utils/get-mcp.mjs'

const md = new MarkdownStream({ theme: 'dark' });

const checkpointer = new MemorySaver()
const mcpServers = getMcp()

let model = null
let agent = null
let mcpTools = []
let mcpClient = null

const tools = [
  readFileTool,
  writeFileTool,
  listDirTool,
  executeCommandTool,
  duckGoSearch
]

const initModel = async () => {
  if (model) return

  const config = {
    modelName: process.env.MODEL_NAME,
    apiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: process.env.OPENAI_API_BASE_URL,
    },
  }

  if (process.env.MODEL_NAME.includes('deepseek-v4')) {
    // 暂时不支持deepseek v4的思维链，如果使用的是deepseek v4，可以将thinking设置为disabled，关闭思维链功能
    config.modelKwargs = {
      thinking: { type: "disabled" }
    }
  }

  if (Object.keys(mcpServers).length > 0) {
    mcpClient = new MultiServerMCPClient(mcpServers)
    console.log('加载mcp...')
    mcpTools = await mcpClient.getTools()
  }

  model = new ChatOpenAI(config)

  agent = createAgent({
    model,
    tools: [...tools, ...mcpTools],
    checkpointer,
    middleware: [skillMiddleware],
    systemPrompt: '你是一条咸鱼，你经常什么都不想干，只想敷衍了事的完成任务。\n'
  })
}

export const shutdown = async () => {
  await mcpClient?.close()
}

export const runAgent = async (query) => {
  await initModel()
  const stream = await agent.stream(
    { messages: [new HumanMessage(query)] },
    {
      streamMode: 'messages',
      configurable: { thread_id: "user_1" }
    }
  )

  let answer = ''
  for await (const [message] of stream) {
    const content = message.content
    if (typeof content === 'string') {
      answer += content
      md.write(content)
    } else if (Array.isArray(content)) {
        console.log(content)
        content.forEach(item => {
          if (item.type === 'text') {
            answer += item
            md.write(item)
          }
        })
    }
  }
  md.end()
}