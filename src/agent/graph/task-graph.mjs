import { END, START, StateGraph } from '@langchain/langgraph'
import { GraphState } from './task-state.mjs'
import { invokeAgent } from '../utils/invoke-agent.mjs'

export const createTaskGraph = ({ supervisorAgent, searchAgent }) => {
  const supervisorRouteNode = async (state) => {
    console.log('[StateGraph] → Supervisor Agent：分析是否需要联网搜索')

    const decision = await invokeAgent(
      supervisorAgent,
      `判断用户问题是否需要实时联网信息。
       只返回一个单词：SEARCH 或 DIRECT。

       用户问题：
       ${state.query}
      `,
      `${state.sessionId}:supervisor`
    )

    const route = /\bSEARCH\b/i.test(decision) ? 'search' : 'direct'
    console.log(`[Supervisor Agent] 路由决定：${route.toUpperCase()}`)

    return { route }
  }

  const searchAgentNode = async (state) => {
    console.log('[StateGraph] → Search Agent：执行联网搜索')

    const searchResult = await invokeAgent(
      searchAgent,
      `请联网搜索下面的问题，并整理出准确、简洁的中文结果。保留关键来源和链接。
        ${state.query}
      `
    )

    console.log('[Search Agent] 搜索完成，结果返回 Supervisor Agent')
    return { searchResult }
  }

  const directAnswerNode = async (state) => {
    console.log('[StateGraph] → Supervisor Agent：直接生成回答')

    const answer = await invokeAgent(
      supervisorAgent,
      `请直接回答用户问题。如果信息可能过时，请明确说明限制。

        用户问题：
        ${state.query}
      `,
      `${state.sessionId}:supervisor`
    )

    return { answer }
  }

  const supervisorAnswerNode = async (state) => {
    console.log('[StateGraph] → Supervisor Agent：汇总 Search Agent 结果')

    const answer = await invokeAgent(
      supervisorAgent,
      `请基于 Search Agent 的搜索结果回答用户问题。
        不要声称执行了搜索结果中没有体现的操作；回答要清晰，并在适当位置保留来源链接。

        用户问题：
        ${state.query}

        Search Agent 结果：
        ${state.searchResult}
      `,
      `${state.sessionId}:supervisor`
    )

    return { answer }
  }

  const routeAfterSupervisor = (state) => (
    state.route === 'search' ? 'search' : 'direct'
  )

  return new StateGraph(GraphState)
    .addNode('supervisorRoute', supervisorRouteNode)
    .addNode('searchAgent', searchAgentNode)
    .addNode('supervisorAnswer', supervisorAnswerNode)
    .addNode('directAnswer', directAnswerNode)
    .addEdge(START, 'supervisorRoute')
    .addConditionalEdges('supervisorRoute', routeAfterSupervisor, {
      search: 'searchAgent',
      direct: 'directAnswer',
    })
    .addEdge('searchAgent', 'supervisorAnswer')
    .addEdge('supervisorAnswer', END)
    .addEdge('directAnswer', END)
    .compile()
}
