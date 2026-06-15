# PostToolUse 훅: .ts/.tsx 편집 시 apiFetch 를 우회한 직접 fetch() 사용을 경고한다.
# 백엔드 응답은 {success,data,code,message} 래퍼라 직접 fetch 하면 언래핑/인증/에러처리가 누락됨.
# stdin 으로 PostToolUse JSON(tool_input.file_path)을 받는다.
$ErrorActionPreference = 'SilentlyContinue'

try {
    $raw = [Console]::In.ReadToEnd()
    if (-not $raw) { exit 0 }
    $payload = $raw | ConvertFrom-Json
    $path = $payload.tool_input.file_path
    if (-not $path) { exit 0 }

    # TS/TSX 파일만 대상
    if ($path -notmatch '\.(ts|tsx)$') { exit 0 }

    $normalized = $path -replace '\\', '/'

    # 직접 fetch 가 정당한 계층은 제외:
    #  - api 클라이언트 자체 (client.ts, auth.ts)
    #  - Next.js route handlers (route.ts — 항상 서버 사이드)
    #  - 서버 사이드 인증/OAuth 유틸 (src/lib/auth/**)
    #  - 서버 액션 (*actions.ts)
    if ($normalized -match '/lib/api/(client|auth)\.ts$') { exit 0 }
    if ($normalized -match '/route\.ts$') { exit 0 }
    if ($normalized -match '/lib/auth/') { exit 0 }
    if ($normalized -match 'actions\.ts$') { exit 0 }

    if (-not (Test-Path $path)) { exit 0 }
    $content = Get-Content -Path $path -Raw

    # apiFetch / api. 가 아니라 단독 fetch( 호출을 찾음 (window.fetch, await fetch 등)
    $hasDirectFetch = $content -match '(?<![A-Za-z0-9_.])fetch\s*\('
    if ($hasDirectFetch) {
        $msg = @"
[Frontend Hook] $normalized 에서 직접 fetch() 호출이 감지되었습니다.
백엔드 응답은 {success,data,code,message} 래퍼이고 인증/401 자동 갱신/에러 분기가 필요합니다.
=> src/lib/api/client.ts 의 apiFetch / api.get|post|put|patch|delete 또는 apiFetchBlob(바이너리) 를 사용하세요.
(파일 업로드는 src/lib/api/upload.ts 의 uploadFile)
"@
        [Console]::Error.WriteLine($msg)
        exit 2   # stderr 를 Claude 에게 피드백으로 전달
    }
    exit 0
} catch {
    exit 0   # 훅 오류로 작업 흐름을 막지 않음
}
