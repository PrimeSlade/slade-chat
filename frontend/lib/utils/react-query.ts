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
