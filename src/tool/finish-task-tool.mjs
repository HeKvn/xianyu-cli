import { tool } from '@langchain/core/tools'
import { z } from 'zod'

// 完成任务工具 - AI 调用此工具表示任务已完成
const finishTask = async ({ summary }) => {
  console.log(`✅ 任务完成: ${summary}`)
  return `咸鱼Agent提示：任务已标记为完成。总结: ${summary}`
}

export const finishTaskTool = tool(finishTask, {
  name: 'finishTask',
  description: '当任务全部完成时调用，标记工作结束。只有在确认所有步骤都已完成、目标达成后才调用此工具。',
  schema: z.object({
    summary: z.string().describe('任务完成的总结，说明完成了哪些工作'),
  }),
})
