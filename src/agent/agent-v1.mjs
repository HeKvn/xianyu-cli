import chalk from 'chalk'
import { MarkdownStream } from 'streammark'
import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import { InMemoryChatMessageHistory } from'@langchain/core/chat_history';
import { JsonOutputToolsParser } from '@langchain/core/output_parsers/openai_tools'
import { readFileTool, writeFileTool, listDirTool } from '../tool/file-tools.mjs'
import { executeCommandTool } from '../tool/command-tools.mjs'
import { finishTaskTool } from '../tool/finish-task-tool.mjs'

const md = new MarkdownStream({ theme: 'dark' });

let model = null
let modelWithTools = null

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

  modelWithTools = model.bindTools(tools)
}

export const runAgent = async (query) => {
  initModel()
  const history = new InMemoryChatMessageHistory()

  await history.addMessage(new SystemMessage(`
      你是一条咸鱼，你经常什么都不想干，只想敷衍了事的完成任务。
      如果用户强烈要求你完成某些任务，比如项目管理，你会再考虑是否需要调用工具。
      如果没有合适的工具，你应该直接回答用户的问题。
      如果有合适的工具，你应该先调用工具，再根据工具的返回结果进行下一步。
      你不可以帮用户启动项目，不要使用命令启动项目，项目启动还是编译让用户自己操作。
      如果你觉得本次回答结束了，不需要继续调用工具，你应该调用 finishTask 工具，标记对话结束，或者是任务完成。

      重要规则：
      使用命令工具的时，如果指定了 workingDirectory 参数，不要再cd到 workingDirectory 目录。
      因为执行命令的工具会在指定的工作目录下执行命令，不需要你再cd到工作目录。
   `))

  await history.addMessage(new HumanMessage(query))

  for (let i = 0; i < process.env.MAX_AGENT_CALLS; i++) {
    console.log(chalk.blue('\nAI思考中...'))
    const message = await history.getMessages()
    let rawStream = await modelWithTools.stream(message)

    let fullAIMessage = null
    const printToolContentLength = new Map()
    const toolParser = new JsonOutputToolsParser()
    for await (const chunk of rawStream) {
      fullAIMessage = fullAIMessage ? fullAIMessage.concat(chunk) : chunk

      let parsedTools = null;
      try {
        parsedTools = await toolParser.parseResult([{ message: fullAIMessage }])
      } catch (error) {
        console.log(chalk.red('❌ 解析工具调用失败:'), error.message)
      }
      
      // console.log('================', parsedTools)

      if (parsedTools?.length) {
        for (const toolCall of parsedTools) {
          if (toolCall.type !== 'writeFile') continue
          if (!toolCall.args.content) continue
          const toolCallId = toolCall.id || toolCall.args.filePath || 'default'
          const currentContent = String(toolCall.args.content)
          const previousLength = printToolContentLength.get(toolCallId)
          if (previousLength === undefined) {
            printToolContentLength.set(toolCallId, 0)
          } else if (currentContent && currentContent.length > previousLength) {
            const newContent = currentContent.slice(previousLength)
            process.stdout.write(newContent)
            // md.write(newContent)
            printToolContentLength.set(toolCallId, currentContent.length)
          }
        }
      } else if (chunk.content) {
        md.write(chunk.content)
      }
    }

    md.end()

    await history.addMessage(fullAIMessage)
    
    if (!fullAIMessage.tool_calls?.length) {
      // console.log(chalk.yellow('AI没有调用工具，继续思考下一步...'))
      continue
    }

    // 检查是否调用了 finishTask
    const finishTaskCall = fullAIMessage.tool_calls.find(tc => tc.name === 'finishTask')
    if (finishTaskCall) {
      break
    }

    console.log(`检测到${fullAIMessage.tool_calls.length}个工具调用`)

    for (const toolCall of fullAIMessage.tool_calls) {
      const tool = tools.find(t => t.name === toolCall.name)
      if (!tool) {
        console.log(`工具调用不存在 ${toolCall.name}`)
        continue
      }
      const toolResult = await tool.invoke(toolCall.args)
      console.log(`工具：${toolCall.name} 调用成功`)
      await history.addMessage(new ToolMessage({
        tool_call_id: toolCall.id,
        content: toolResult,
      }))
    }
  }

  // return history.messages[history.messages.length - 1].content
}
