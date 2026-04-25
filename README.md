# xianyu-cli 咸鱼Agent 命令行工具 🐟

这是一个基于langchain的agent命令行工具，支持流式输出

- [x] 支持流式输出，实时响应
- [x] 文件读写
- [x] 执行命令
- [ ] 联网搜索
- [ ] skills系统
- [ ] 多agent
- [ ] 会话管理

**安装**

```
npm install -g xianyu-cli
```
**使用**

```
xianyu-cli
```

启动后默认会在`~/.config/`目录下创建`.xianyu-cli`文件

`.xianyu-cli`文件内容如下

```
# 你的llm api key 和 base url，建议使用openai的api
OPENAI_API_KEY=api-key
OPENAI_API_BASE_URL=base-url
MODEL_NAME=model-name

# 安全护栏，默认30，防止agent调用次数超过限制
MAX_AGENT_CALLS=30
```