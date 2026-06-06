"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_PASSWORD } from "@/constants/auth"
import { loginAction } from "@/features/auth/actions"
import { AuthSocialSection } from "@/features/auth/components/AuthSocialSection"

type LoginFormProps = {
  showMockHint?: boolean
}

export const LoginForm = ({ showMockHint = false }: LoginFormProps) => {
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
      <AuthSocialSection />

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-body-sm font-medium">
          이메일
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="student@studyfill.test"
          className="h-10 rounded-button"
          required
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-body-sm font-medium">
          비밀번호
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={MOCK_PASSWORD}
          className="h-10 rounded-button"
          required
        />
      </div>
      {error ? (
        <p className="text-body-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full rounded-button"
      >
        {isPending ? "로그인 중…" : "이메일로 계속하기"}
      </Button>
      {showMockHint ? (
        <p className="rounded-button border border-border/60 bg-landing-panel/30 px-3 py-2.5 text-caption text-muted-foreground">
          Mock 계정: 아무 이메일 + 비밀번호{" "}
          <strong className="font-semibold text-foreground">{MOCK_PASSWORD}</strong>
        </p>
      ) : null}
    </form>
  )
}
