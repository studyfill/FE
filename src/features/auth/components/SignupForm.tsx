"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_PASSWORD } from "@/constants/auth"
import { ROUTES } from "@/constants/routes"
import { signupAction } from "@/features/auth/actions"

export const SignupForm = () => {
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setError("")
    const result = await signupAction(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          이름
        </label>
        <Input id="name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          이메일
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
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
          autoComplete="new-password"
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
        {isPending ? "가입 중…" : "회원가입"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link href={ROUTES.login} className="text-primary hover:underline">
          로그인
        </Link>
      </p>
    </form>
  )
}
