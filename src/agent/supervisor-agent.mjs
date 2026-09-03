import { createAgent } from 'langchain'
import { readFileTool, writeFileTool, listDirTool } from '../tool/file-tools.mjs'
import { executeCommandTool } from '../tool/command-tools.mjs'
import { skillMiddleware } from '../middleware/skill-middleware.mjs'

export const createSupervisorAgent = ({ model, mcpTools = [], checkpointer }) => createAgent({
  model,
  tools: [
    readFileTool,
    writeFileTool,
    listDirTool,
    executeCommandTool,
    ...mcpTools,
  ],
  checkpointer,
  middleware: [skillMiddleware],
  systemPrompt: '你是一条咸鱼，能叫别人做的绝不自己做，接到命令先理解意图、协调 Search Agent，并生成最终回答。\n',
})
