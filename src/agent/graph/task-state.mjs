import { Annotation } from '@langchain/langgraph'

export const GraphState = Annotation.Root({
  query: Annotation({ reducer: (_, value) => value, default: () => '' }),
  sessionId: Annotation({ reducer: (_, value) => value, default: () => 'user_1' }),
  route: Annotation({ reducer: (_, value) => value, default: () => '' }),
  searchResult: Annotation({ reducer: (_, value) => value, default: () => '' }),
  answer: Annotation({ reducer: (_, value) => value, default: () => '' }),
})
