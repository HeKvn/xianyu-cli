export const extractText = (content) => {
  if (typeof content === 'string') return content

  if (Array.isArray(content)) {
    return content
      .filter(item => item?.type === 'text')
      .map(item => item.text ?? '')
      .join('')
  }

  return content == null ? '' : JSON.stringify(content)
}

export const invokeAgent = async (agent, content, threadId) => {
  const result = await agent.invoke(
    { messages: [{ role: 'user', content }] },
    threadId
      ? { configurable: { thread_id: threadId } }
      : undefined
  )

  return extractText(result.messages?.at(-1)?.content)
}
