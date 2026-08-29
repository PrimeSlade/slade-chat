interface StatusBadgeProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

export function StatusBadge({ size = "md" }: StatusBadgeProps) {
  return (
    <div
      className={`absolute bottom-0 right-0 border-2 border-background rounded-full ${sizeMap[size]} bg-green-500`}
    />
  );
}
