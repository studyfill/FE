"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_PASSWORD } from "@/constants/auth"
import { ROUTES } from "@/constants/routes"
import { loginAction } from "@/features/auth/actions"

export const LoginForm = () => {
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setError("")
    const result = await loginAction(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          이메일
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="student@studyfill.test"
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          비밀번호
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={MOCK_PASSWORD}
          required
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "로그인 중…" : "로그인"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link href={ROUTES.signup} className="text-primary hover:underline">
          회원가입
        </Link>
      </p>
      <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        Mock 계정: 아무 이메일 + 비밀번호 <strong>{MOCK_PASSWORD}</strong>
      </p>
    </form>
  )
}
