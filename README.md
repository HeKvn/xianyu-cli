# xianyu-cli 咸鱼Agent 命令行工具 🐟

这是一个基于langchain的agent命令行工具，支持流式输出

- [x] 支持流式输出，实时响应
- [x] 文件读写
- [x] 执行命令
- [x] skills系统
- [x] MCP
- [ ] 联网搜索
- [ ] 多agent
- [ ] 会话管理

# 快速开始

**安装**

```
npm install -g xianyu-cli
```
**使用**

```
xianyu-cli
```
# 项目说明

## 模型设置

启动后默认会创建`~/.xianyu/settings.json`，存放你的llm api key 和 base url（需要使用openai协议的）

`settings.json`文件内容如下

```json
{
    "OPENAI_API_KEY": "",
    "OPENAI_API_BASE_URL": "",
    "MODEL_NAME": "",
}
```

## Skills

xianyu会读取用户根目录下的`.xianyu/skills`目录（`~/.xianyu/skills`）去加载skill，如果你想xianyu使用skill，请确保你的skill安装在此目录下。

## MCP

mcp配置在`~/.xianyu/mcp`目录下，你可以在此目录下创建json文件，你可以创建多个json文件，xianyu都会读取加载，但需要注意的是，务必每个json文件包含`mcpServers`，例如：

```json
{
  "mcpServers": {
    "amap-maps-streamableHTTP": {
      "url": "https://mcp.amap.com/mcp?key=xxx"
    }
  }
}
```

你可以像上面一样一个json作为一个mcp服务，也可以在一个json文件里定义多个mcp，例如：

```json
{
  "mcpServers": {
    "amap-maps-streamableHTTP": {
      "url": "https://mcp.amap.com/mcp?key=xxx"
    },
    "bing-search": {
      "args": [
        "-y",
        "bing-cn-mcp"
      ],
      "command": "npx"
    }
  }
}
```