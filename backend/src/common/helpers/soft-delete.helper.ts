import { MessageWithSender } from 'src/shared';

/**
 * Helper function to transform soft-deleted messages for frontend response
 * Nullifies content field for messages that have been soft deleted
 */
export function transformSoftDeletedMessage(
  message: MessageWithSender,
): MessageWithSender {
  if (message.deletedAt) {
    return {
      ...message,
      content: null,
    };
  }
  return message;
}

/**
 * Helper function to transform an array of messages
 * Nullifies content for any soft-deleted messages
 */
export function transformSoftDeletedMessages(
  messages: MessageWithSender[],
): MessageWithSender[] {
  return messages.map(transformSoftDeletedMessage);
}
