# onomeo 接口示例

[English](README.md)

可直接运行的 [onomeo](https://onomeo.com) 接口示例。onomeo 提供一个兼容 OpenAI
格式的接口，背后接入约 37 个模型；调用所需的额度在站内领取，无需绑定银行卡。

每个文件都可独立运行。选一种语言，设置一个环境变量，即可执行。

```
python/       Python，分别使用官方 OpenAI SDK 与标准库
javascript/   Node 18 及以上，分别使用 OpenAI SDK 与内置 fetch
curl/         四条命令，无需安装任何依赖
```

## 一、获取密钥

在 [onomeo.com](https://onomeo.com) 登录（邮箱验证码、Google 或 GitHub），进入
[控制台](https://onomeo.com/dashboard)，点击「新建密钥」。登录后会自动分配一把密钥，
每日签到可补充额度。

## 二、设置密钥

```bash
export ONOMEO_API_KEY="sk-onomeo-..."          # Windows PowerShell：$env:ONOMEO_API_KEY="sk-onomeo-..."
```

单模型示例还支持可选的 `ONOMEO_MODEL`，用于指定模型。

## 三、运行

```bash
pip install -r python/requirements.txt  # 仅 SDK 示例需要
python python/01_hello.py

cd javascript && npm install            # 仅 SDK 示例需要
node 01-hello.mjs

sh curl/hello.sh                        # 无需安装
```

## 示例清单

每种语言下是同样的七个示例，文件名对应 `01_hello.py` 与 `01-hello.mjs`。

| | 演示内容 |
|---|---|
| **01 hello** | 最简请求，使用 OpenAI SDK |
| **02 stream** | 同一请求的流式输出 |
| **03 list models** | 当前密钥可调用的全部模型 |
| **04 balance** | 剩余额度，以及当日签到可领取的数量 |
| **05 compare models** | 同一问题由三个模型作答，并列显示耗时与消耗 |
| **06 handle errors** | 限流、额度不足、服务商未响应，以及哪些情况值得重试 |
| **07 raw http** | 不依赖任何 SDK 的同一次调用 |

其中适合写成命令行单条命令的四个放在 `curl/` 下：`hello.sh`、`stream.sh`、
`models.sh`、`balance.sh`。

## 接口概览

接口地址：`https://onomeo.com/v1`

| 方法 | 路径 | 用途 |
|---|---|---|
| `POST` | `/v1/chat/completions` | 对话补全，支持流式 |
| `GET` | `/v1/models` | 当前密钥可调用的模型编号 |
| `GET` | `/api/me` | 余额、限额与当前用量（不在 `/v1` 下） |

鉴权方式为 `Authorization: Bearer YOUR_KEY`。请求与响应均遵循 OpenAI 格式，
任何 OpenAI 客户端只需改动 `base_url` 即可使用：

```python
from openai import OpenAI

client = OpenAI(api_key="sk-onomeo-...", base_url="https://onomeo.com/v1")
```

## 额度

额度单位为「喵」，1 喵等于 1 个词元。响应中 `usage.total_tokens` 的数值即为本次
实际扣除的数量。

计费只统计可见正文，即发送的内容与模型返回的内容；模型作答前的思考过程不计费，
空回答不扣费。

额度通过每日签到领取：首日 1,200，连续签到七天可达 3,500；观看广告、邀请好友、
分享的对话被阅读同样可获得额度。账户额度上限为 500,000。

最便宜的几个模型每次回答约消耗 30 额度，一次完整签到大致可换取一百次回答。

## 限额

| 限制 | 数值 |
|---|---|
| 单密钥每分钟请求数 | 12 |
| 单账号每 5 小时请求数 | 60 |
| 单网络地址每 5 小时请求数 | 120 |
| `max_tokens` 下限 | 4,096，低于此值将被提升 |

超出限额的请求返回 429，响应体中的 `retryAfter` 为建议等待的秒数，`Retry-After`
响应头为同一数值。`06 handle errors` 示例演示了如何据此重试。

## 错误

所有失败均以 JSON 返回，其中 `code` 字段稳定不变。请据 `code` 判断，不要匹配
`message` 文本。

| 代码 | 状态码 | 含义 |
|---|---|---|
| `bad_key` | 401 | 密钥无效或已不存在 |
| `not_enough_credit` | 402 | 额度不足，响应体含 `balance` 与 `need` |
| `key_expired` | 401 | 该密钥已过期 |
| `key_limit_reached` | 402 | 该密钥已达自身消耗上限，账户余额不受影响 |
| `model_not_allowed` | 400 | 模型不在可用清单内，响应体含可用名称 |
| `too_fast` | 429 | 该密钥本分钟内请求过于频繁 |
| `account_quota` | 429 | 该账号当前窗口的调用次数已用尽 |
| `network_quota` | 429 | 当前网络地址的调用次数已用尽 |
| `site_busy` | 429 | 全站当前已达上游配额 |
| `upstream_failed` | 502 | 模型服务商未响应，本次不扣费 |
| `upstream_unconfigured` | 503 | 当前未接入模型服务商 |

## 模型选择

`GET /v1/models` 返回可用编号，其中两类值得留意：

- **`auto`** 会自动选择一个较强的模型，若该模型不可用则改用下一个。
- 编号以 **`:free`** 结尾的，是服务商当前免费开放的模型。这类模型时有变动，
  [免费模型榜](https://onomeo.com/free-models) 记录每周的上下架情况。

[模型页](https://onomeo.com/models) 列出每个模型每次回答的花费，数值取自过去
30 天的实测均值。

## 相关链接

- [接口文档](https://onomeo.com/docs)
- [模型列表](https://onomeo.com/models) · [本周免费模型](https://onomeo.com/free-models)
- [免费额度](https://onomeo.com/free-credits)
- 咨询：hello@onomeo.com

## 许可

MIT，可自由复制到自己的项目中使用。
