import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6 py-8">
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
          <CardTitle className="text-base">시작하기</CardTitle>
          <CardDescription>
            학습할 PDF를 업로드하고 AI 기반 학습을 시작하세요.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <Button type="button" aria-label="PDF 업로드">
            <Upload />
            PDF 업로드
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
