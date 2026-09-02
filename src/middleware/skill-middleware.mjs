import { createMiddleware } from "langchain";
import { parseSkills } from "../utils/parse-skill.mjs";
import { loadSkill } from "../tool/load-skill.mjs";

const SKILLS = parseSkills();

const skillsPrompt = SKILLS.map((skill) => `**${skill.name}**: ${skill.description}`).join("\n\n");

export const skillMiddleware = createMiddleware({
    name: 'skill_middleware',
    tools: [loadSkill],
    wrapModelCall: async (request, handler) => {
        const skillsAddendum = `
            \n\n## 当前可用技能\n\n${skillsPrompt}
            \n\n如果用户的请求涉及到上述技能领域，优先考虑使用 load_skill 工具加载相关技能内容，以便更好地理解和处理用户的需求。
        `

        const newSystemPrompt = request.systemMessage.concat(skillsAddendum);

        return handler({
            ...request,
            systemMessage: newSystemPrompt,
        })
    }
})