import { MarkdownStream } from 'streammark'
import { ChatOpenAI } from '@langchain/openai'
import { MemorySaver } from '@langchain/langgraph'
import { MultiServerMCPClient } from '@langchain/mcp-adapters'
import { createSupervisorAgent } from './supervisor-agent.mjs'
import { createSearchAgent } from './subAgent/search-agent.mjs'
import { createTaskGraph } from './graph/task-graph.mjs'
import { getMcp } from '../utils/get-mcp.mjs'

const checkpointer = new MemorySaver()
const mcpServers = getMcp()

let taskGraph = null
let mcpClient = null

const initModel = async () => {
  if (taskGraph) return

  const config = {
    modelName: process.env.MODEL_NAME,
    apiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: process.env.OPENAI_API_BASE_URL,
    },
  }

  if (process.env.MODEL_NAME.includes('deepseek-v4')) {
    config.modelKwargs = {
      thinking: { type: 'disabled' }
    }
  }

  let mcpTools = []
  if (Object.keys(mcpServers).length > 0) {
    mcpClient = new MultiServerMCPClient(mcpServers)
    console.log('加载mcp...')
    mcpTools = await mcpClient.getTools()
  }

  const model = new ChatOpenAI(config)
  const supervisorAgent = createSupervisorAgent({
    model,
    mcpTools,
    checkpointer,
  })
  const searchAgent = createSearchAgent(model)

  taskGraph = createTaskGraph({
    supervisorAgent,
    searchAgent,
  })
}

export const shutdown = async () => {
  await mcpClient?.close()
}

export const runAgent = async (query, sessionId = 'user_1') => {
  await initModel()

  const md = new MarkdownStream({ theme: 'dark' })

  try {
    const result = await taskGraph.invoke(
      { query, sessionId },
      { configurable: { thread_id: `${sessionId}:task` } }
    )

    md.write(result.answer ?? '未生成回答')
  } finally {
    md.end()
  }
}
