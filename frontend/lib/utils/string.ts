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
