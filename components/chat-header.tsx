"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Icon from "@/components/icon"

interface ChatHeaderProps {
  messagesCount: number
  onNewChat: () => void
}

export function ChatHeader({ messagesCount, onNewChat }: ChatHeaderProps) {
  const handleNewChat = () => {
    onNewChat()
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon name="RiRobotLine" className="w-6 h-6 text-purple-600" />
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Grok Assistant</h1>
      </div>

      {messagesCount > 0 ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Icon name="RiAddLine" className="h-5 w-5" />
              <span className="sr-only">新建对话</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>开始新对话</AlertDialogTitle>
              <AlertDialogDescription>开始新对话将清空当前的聊天记录。确定要继续吗？</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleNewChat} className="bg-purple-600 hover:bg-purple-700">
                开始新对话
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={handleNewChat}
        >
          <Icon name="RiAddLine" className="h-5 w-5" />
          <span className="sr-only">新建对话</span>
        </Button>
      )}
    </div>
  )
}
