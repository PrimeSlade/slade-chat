"use client";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface SendButtonProps {
  disabled: boolean;
}

export default function SendButton({ disabled }: SendButtonProps) {
  return (
    <Button variant="ghost" size="icon" disabled={disabled}>
      <Send className="h-6 w-6" />
    </Button>
  );
}
