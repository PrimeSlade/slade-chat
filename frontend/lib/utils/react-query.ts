// Optimistic Update Utilities for React Query Infinite Queries
export function addToFirstPage<T>(oldData: any, newItem: T) {
  return {
    ...oldData,
    pages: [
      {
        ...oldData.pages[0],
        data: [...oldData.pages[0].data, newItem],
      },
      ...oldData.pages.slice(1),
    ],
  };
}

export function updateFirstPage<T>(oldData: any, updatedData: T[]) {
  return {
    ...oldData,
    pages: [
      {
        ...oldData.pages[0],
        data: updatedData,
      },
      ...oldData.pages.slice(1),
    ],
  };
}

export function updateMessageInPages(
  oldData: any,
  messageId: string,
  updatedContent: string,
  updatedAt?: string | Date
) {
  if (!oldData || !oldData.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page: any) => ({
      ...page,
      data: page.data.map((msg: any) =>
        msg.id === messageId 
          ? { 
              ...msg, 
              content: updatedContent,
              updatedAt: updatedAt || new Date().toISOString()
            } 
          : msg
      ),
    })),
  };
}
