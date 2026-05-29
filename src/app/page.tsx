import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ROUTES } from "@/constants/routes"
import { getServerSession } from "@/features/auth/actions"

export default async function HomePage() {
  const session = await getServerSession()
  if (session) {
    redirect(ROUTES.dashboard)
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
          <span className="text-sm font-semibold tracking-tight">StudyFill</span>
          <div className="flex gap-2">
            <Link href={ROUTES.login}>
              <Button variant="ghost" size="sm" type="button">
                로그인
              </Button>
            </Link>
            <Link href={ROUTES.signup}>
              <Button size="sm" type="button">
                시작하기
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            PDF로 스마트하게 공부하세요
          </h1>
          <p className="text-sm text-muted-foreground">
            PDF 업로드 → AI 강의 설명 → 시험 핵심 개념 → 빈칸 암기 학습
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">StudyFill MVP</CardTitle>
            <CardDescription>
              로그인 후 PDF를 업로드하고, 강의식 설명과 빈칸 암기까지 이어서
              학습할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="flex gap-2 pt-4">
            <Link href={ROUTES.signup}>
              <Button type="button">무료로 시작하기</Button>
            </Link>
            <Link href={ROUTES.login}>
              <Button variant="outline" type="button">
                로그인
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
