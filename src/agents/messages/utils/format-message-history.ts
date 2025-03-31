import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionDeveloperMessageParam,
  ChatCompletionFunctionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';

import { Message } from '@prisma/client';

export const formatMessageHistory = (
  messages: Message[],
): ChatCompletionMessageParam[] => {
  return messages.map((message): ChatCompletionMessageParam => {
    switch (message.role as ChatCompletionMessageParam['role']) {
      case 'user':
        return {
          role: message.role,
          content: message.content,
        } as ChatCompletionUserMessageParam;
      case 'assistant':
        return {
          role: message.role,
          content: message.content,
          audio: (message.audio as any) || undefined,
          refusal: message.refusal || undefined,
          tool_calls: (message.tool_calls as any) || undefined,
        } as ChatCompletionAssistantMessageParam;
      case 'tool':
        return {
          role: message.role as any,
          content: message.content,
          tool_call_id: message.tool_call_id,
        } as ChatCompletionToolMessageParam;
      case 'system':
        return {
          role: message.role as any,
          content: message.content,
        } as ChatCompletionSystemMessageParam;
      case 'developer':
        return {
          role: message.role as any,
          content: message.content,
        } as ChatCompletionDeveloperMessageParam;
      case 'function':
        return {
          role: message.role as any,
          content: message.content,
        } as ChatCompletionFunctionMessageParam;
    }
  });
};
