import { X, Edit, Reply } from "lucide-react";

interface MessageIndicatorProps {
  mode: "edit" | "reply";
  text: string;
  senderName?: string;
  onCancel: () => void;
}

export function MessageIndicator({ mode, text, senderName, onCancel }: MessageIndicatorProps) {
  return (
    <div className="flex items-start justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
      <div className="flex items-start gap-2 flex-1 min-w-0">
        {mode === "edit" ? (
          <Edit className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
        ) : (
          <Reply className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {mode === "edit" ? "Edit Message" : `Reply to ${senderName || "Message"}`}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {text}
          </div>
        </div>
      </div>
      <button
        onClick={onCancel}
        className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors ml-2"
        type="button"
        aria-label={mode === "edit" ? "Cancel edit" : "Cancel reply"}
      >
        <X className="h-5 w-5" style={{ color: "var(--destructive)" }} />
      </button>
    </div>
  );
}
