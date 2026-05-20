# xianyu-cli 咸鱼Agent 命令行工具 🐟

这是一个基于langchain的agent命令行工具，支持流式输出

- [x] 支持流式输出，实时响应
- [x] 文件读写
- [x] 执行命令
- [ ] 联网搜索
- [x] skills系统
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

启动后默认会创建`~/.xianyu/settings.json`，存放你的llm api key 和 base url（需要使用openai协议的）

`settings.json`文件内容如下

```json
{
    "OPENAI_API_KEY": "",
    "OPENAI_API_BASE_URL": "",
    "MODEL_NAME": "",
    "MAX_AGENT_CALLS": 10,
}
```