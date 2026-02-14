import { MessageWithSender } from 'src/shared';

/**
 * Helper function to transform soft-deleted messages for frontend response
 * Nullifies content field for messages that have been soft deleted
 * Also handles nested parent messages
 */
export function transformSoftDeletedMessage(
  message: MessageWithSender,
): MessageWithSender {
  const transformedMessage = { ...message };

  // Transform main message content if deleted
  if (transformedMessage.deletedAt) {
    transformedMessage.content = null;
  }

  // Transform parent content if parent exists and is deleted
  if (transformedMessage.parent && transformedMessage.parent.deletedAt) {
    transformedMessage.parent = {
      ...transformedMessage.parent,
      content: null,
    };
  }

  return transformedMessage;
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
