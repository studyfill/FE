import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LoginForm } from "@/features/auth/components/LoginForm"

export default function LoginPage() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">로그인</CardTitle>
        <CardDescription>StudyFill 학습을 시작하세요.</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <LoginForm />
      </CardContent>
    </Card>
  )
}
