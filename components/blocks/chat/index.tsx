"use client"

import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Icon from "@/components/icon"
import { useEffect, useRef } from "react"
import { ChatHeader } from "@/components/chat-header"

interface ChatProps {
  chat: {
    disabled?: boolean
    welcome?: {
      title?: string
      description?: string
    }
    suggestions?: Array<{
      text: string
      emoji?: string
    }>
    placeholder?: string
    loadingText?: string
    botName?: string
  }
}

export default function Chat({ chat }: ChatProps) {
  if (chat.disabled) {
    return null
  }

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleNewChat = () => {
    setMessages([])
  }

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <ChatHeader messagesCount={messages.length} onNewChat={handleNewChat} />

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="container mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Icon name="RiRobotLine" className="mx-auto mb-4" />
              <h2 className="mb-2">
                {chat.welcome?.title || "与 AI 开始对话"}
              </h2>
              <p className="text-muted-foreground">
                {chat.welcome?.description || "我是 AI 助手，向我提问任何问题！"}
              </p>
              {chat.suggestions && chat.suggestions.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {chat.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubmit(new Event("submit") as any, { data: new FormData() })}
                    >
                      {suggestion.emoji} {suggestion.text}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <Avatar className="flex-shrink-0">
                  <AvatarFallback>
                    <Icon name="RiRobotLine" />
                  </AvatarFallback>
                </Avatar>
              )}

              <Card className="max-w-[85%] sm:max-w-[70%]">
                <div className="whitespace-pre-wrap">{message.content}</div>
              </Card>

              {message.role === "user" && (
                <Avatar className="flex-shrink-0">
                  <AvatarFallback>
                    <Icon name="RiUserLine" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="flex-shrink-0">
                <AvatarFallback>
                  <Icon name="RiRobotLine" />
                </AvatarFallback>
              </Avatar>
              <Card>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="RiLoader4Line" className="animate-spin" />
                  <span>{chat.loadingText || "正在思考..."}</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t">
        <form onSubmit={handleSubmit} className="container mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={chat.placeholder || "输入你的问题..."}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Icon name="RiLoader4Line" className="animate-spin" /> : <Icon name="RiSendPlaneLine" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}