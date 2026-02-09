import { X } from "lucide-react";

interface EditIndicatorProps {
  editText: string;
  onCancel: () => void;
}

export function EditIndicator({ editText, onCancel }: EditIndicatorProps) {
  return (
    <div className="flex items-start justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          Edit Message
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {editText}
        </div>
      </div>
      <button
        onClick={onCancel}
        className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors ml-2"
        type="button"
        aria-label="Cancel edit"
      >
        <X className="h-5 w-5" style={{ color: "var(--destructive)" }} />
      </button>
    </div>
  );
}
