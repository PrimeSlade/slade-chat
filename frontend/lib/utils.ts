import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

type RoomLike = {
  type: "DIRECT" | "GROUP";
  name?: string | null;
  image?: string | null;
  participants: {
    user: {
      id: string;
      name?: string | null;
      image?: string | null;
    };
  }[];
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (name: string) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .map((char, index) =>
      index === 0 ? char.toUpperCase() : char.toLowerCase()
    )
    .join("");
};

export const truncate = (text: string, length: number) => {
  if (!text || text.length <= length) {
    return text;
  }
  return `${text.substring(0, length)}...`;
};

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

export const getRoomDisplay = (room: RoomLike) => {
  if (!room) {
    return { displayName: "Unknown", avatarUrl: getInitials("Un") };
  }

  if (room.type === "DIRECT") {
    const otherParticipant = room.participants[0];
    return {
      displayName: otherParticipant.user.name ?? "Unknown",
      avatarUrl:
        otherParticipant.user.image ??
        getInitials(otherParticipant.user.image ?? "A"),
    };
  }

  return {
    displayName: room.name ?? "Unnamed Room",
    avatarUrl: room.image ?? getInitials(room.name ?? "Ar"),
  };
};
