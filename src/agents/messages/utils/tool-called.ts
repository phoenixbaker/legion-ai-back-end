import { ChatCompletionMessageToolCall } from 'openai/resources/chat/completions';

export const toolCalled = (
  tool_calls: ChatCompletionMessageToolCall[] | undefined,
): tool_calls is ChatCompletionMessageToolCall[] => {
  return !!tool_calls && tool_calls.length > 0;
};
