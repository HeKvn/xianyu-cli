# xianyu-cli，一个终端Agent 🐟

在你的终端养一条咸鱼吧，给平淡的生活添点盐

- [x] 支持流式输出，实时响应
- [x] 文件读写
- [x] 执行命令
- [x] skills系统
- [x] MCP
- [x] 联网搜索
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

## 联网搜索

> 你可以像上面一样使用`bing-search`这个mcp进行联网搜索，也可以像接下来这样使用API来搜索。

xianyu 支持通过[博查](https://open.bochaai.com/) API 进行联网搜索，获取最新的网页信息。

**配置**

需要在`~/.xianyu/settings.json`中配置 `BOCHA_API_KEY`：

```json
{
    "BOCHA_API_KEY": "your_api_key_here"
}
```

你可以在 [博查开放平台](https://open.bochaai.com/api-keys) 申请 API 密钥。

**无需担心付费，个人用户有免费额度**

**可选配置**

`BOCHA_RESULT_COUNT` 控制每次搜索返回的结果数量，默认为 5：

```json
{
    "BOCHA_RESULT_COUNT": 10
}
```