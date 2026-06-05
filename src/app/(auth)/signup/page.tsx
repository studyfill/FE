import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SignupForm } from "@/features/auth/components/SignupForm"

export default function SignupPage() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">회원가입</CardTitle>
        <CardDescription>이메일로 계정을 만드세요.</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <SignupForm />
      </CardContent>
    </Card>
  )
}
