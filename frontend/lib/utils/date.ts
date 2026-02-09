export const formatTimestamp = (timestamp: Date | string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const targetDate = new Date(timestamp);
  const targetTime = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );

  if (targetTime.getTime() === today.getTime()) {
    // Today: "6:04 PM"
    return targetDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  } else if (targetTime.getTime() === yesterday.getTime()) {
    // Yesterday: "Yesterday"
    return "Yesterday";
  } else if (targetDate > oneWeekAgo) {
    // This week: "Monday"
    return targetDate.toLocaleDateString("en-US", { weekday: "long" });
  } else {
    // Older: "Dec 20"
    return targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};

export const isSameDay = (date1: Date | string, date2: Date | string) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const formatDateLabelForChatWindow = (dateStr: Date | string) => {
  const date = new Date(dateStr);

  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatlastSeen = (timestamp: Date | string) => {
  const today = new Date();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDate = new Date(timestamp);

  const timeStr = targetDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  if (isSameDay(today, targetDate)) {
    return `today at ${timeStr}`;
  } else if (isSameDay(yesterday, targetDate)) {
    return `yesterday at ${timeStr}`;
  }

  return `on ${targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} at ${timeStr}`;
};
