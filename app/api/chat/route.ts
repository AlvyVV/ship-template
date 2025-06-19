import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: xai("grok-3"),
    system: `你是 Grok，一个由 xAI 开发的AI助手。请用中文回答问题，保持友好、幽默和专业的语气。

  回答时请注意：
  - 提供准确和有用的信息
  - 保持回答简洁明了，但可以适当幽默
  - 如果不确定答案，请诚实说明
  - 适当使用换行来提高可读性
  - 展现你独特的个性和见解`,
    messages,
  })

  return result.toDataStreamResponse()
}
