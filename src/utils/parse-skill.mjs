import os from 'os';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * 解析单个 skill.md 文件
 * @param {string} filePath - 文件绝对或相对路径
 * @returns {{ name: string, description: string, license: string, content: string, meta: object }}
 */
export const parseSkill = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    name: data.name ?? '',
    description: data.description ?? '',
    license: data.license ?? '',
    content: content.trim(),
    meta: data,
  };
};

/**
 * 批量解析目录下所有子文件夹中的 SKILL.md
 * @param {string} dirPath - 目录路径（其下为多个子文件夹，每个子文件夹内含 SKILL.md）
 * @returns {Array<{ name: string, description: string, license: string, content: string, meta: object, filePath: string }>}
 */
export const parseSkills = (dirPath = path.join(os.homedir(), '.xianyu', 'skills')) => {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dirPath, entry.name, 'SKILL.md'))
    .filter((filePath) => fs.existsSync(filePath))
    .map((filePath) => ({
      ...parseSkill(filePath),
      filePath,
    }));
};
