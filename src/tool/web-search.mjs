import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search"

export const duckGoSearch = new DuckDuckGoSearch({ maxResults: 2 })
