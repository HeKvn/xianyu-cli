import chalk from 'chalk'
import { MarkdownStream } from 'streammark'
import { createAgent } from 'langchain'
import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage, HumanMessage, ToolMessage, AIMessage } from '@langchain/core/messages'
import { InMemoryChatMessageHistory } from'@langchain/core/chat_history';
import { readFileTool, writeFileTool, listDirTool } from '../tool/file-tools.mjs'
import { executeCommandTool } from '../tool/command-tools.mjs'
import { finishTaskTool } from '../tool/finish-task-tool.mjs'

const md = new MarkdownStream({ theme: 'dark' });

let model = null
let agent = null

const tools = [
  readFileTool,
  writeFileTool,
  listDirTool,
  executeCommandTool,
  finishTaskTool
]

function initModel() {
  if (model) return

  model = new ChatOpenAI({
    modelName: process.env.MODEL_NAME,
    apiKey: process.env.OPENAI_API_KEY,
    configuration: {
      baseURL: process.env.OPENAI_API_BASE_URL,
    },
  })

  agent = createAgent({
    model,
    tools,
    systemPrompt: '你是一条咸鱼，你经常什么都不想干，只想敷衍了事的完成任务。\n'
  })
}

const messages = []

// export const runAgent = async (query) => {
//   initModel()
//   messages.push(new HumanMessage(query))
//   const result = await agent.invoke({
//     messages
//   })
//   const lastMessage = result.messages[result.messages.length - 1]
//   messages.push(new AIMessage(lastMessage.content))
//   // console.log(lastMessage.content)
//   // process.stdout.write(lastMessage.content)
//   md.write(lastMessage.content)
//   md.end()
// }

export const runAgent = async (query) => {
  initModel()
  messages.push(new HumanMessage(query))
  const stream = await agent.stream(
    { messages },
    {
      streamMode: 'messages'
    }
  )
  process.stdout.write('AI:')
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
  messages.push(new AIMessage(answer))
  md.end()
}