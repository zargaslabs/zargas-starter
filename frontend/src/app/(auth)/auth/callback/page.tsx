import { AuthCallbackHandler } from "@/components/auth/auth-callback-handler";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dictionary } from "@/lib/i18n/dictionaries";

export default function AuthCallbackPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{dictionary.auth.processingInviteTitle}</CardTitle>
        <CardDescription>
          {dictionary.auth.processingInviteDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthCallbackHandler />
      </CardContent>
    </Card>
  );
}
