import { Separator } from "@/components/ui/separator"
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton"

export const AuthSocialSection = () => {
  return (
    <>
      <GoogleSignInButton />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="shrink-0 text-caption text-muted-foreground">또는</span>
        <Separator className="flex-1" />
      </div>
    </>
  )
}
