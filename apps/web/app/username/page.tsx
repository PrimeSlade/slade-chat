import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsernameForm } from "@/components/username/username-form";

export default function UsernamePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-black">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Username</CardTitle>
          <CardDescription>
            Choose a unique username for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsernameForm />
        </CardContent>
      </Card>
    </div>
  );
}
