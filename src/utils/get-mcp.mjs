import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export const getMcp = () => {
  const mcpDir = join(homedir(), '.xianyu', 'mcp');

  let files;
  try {
    files = readdirSync(mcpDir);
  } catch {
    return {};
  }

  const jsonFiles = files.filter(f => f.endsWith('.json'));
  const mergedServers = {};

  for (const file of jsonFiles) {
    try {
      const content = readFileSync(join(mcpDir, file), 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.mcpServers && typeof parsed.mcpServers === 'object') {
        Object.assign(mergedServers, parsed.mcpServers);
      }
    } catch {
      // skip invalid files
    }
  }

  return mergedServers;
}
