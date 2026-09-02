import { tool } from "langchain";
import { z } from "zod";
import { parseSkills } from "../utils/parse-skill.mjs";

const SKILLS = parseSkills()

export const loadSkill = tool(  
  async ({ skillName }) => {
    const skill = SKILLS.find((s) => s.name === skillName);
    if (skill) {
      return `加载skill成功: ${skillName}\n\n${skill.content}`;
    }

    const available = SKILLS.map((s) => s.name).join(", ");
    return `skill '${skillName}' 未找到。可用skill: ${available}`;
  },
  {
    name: "load_skill",
    description: `
        将 skill 的完整内容加载到 agent 的上下文中。

        当你需要详细了解如何处理某种特定类型的请求时使用此工具。
        这将为你提供该 skill 领域的全面说明、策略和指南。
    `,
    schema: z.object({
      skillName: z.string().describe("要加载的 skill 名称"),
    }),
  }
);
