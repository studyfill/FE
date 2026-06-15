# PostToolUse 훅(선택): API 호출 코드를 편집했는데 생성 타입(schema.d.ts)이 오래됐으면 알린다.
# 백엔드 OpenAPI 변경을 프론트가 따라가도록 /sync-api 실행을 유도.
$ErrorActionPreference = 'SilentlyContinue'

try {
    $raw = [Console]::In.ReadToEnd()
    if (-not $raw) { exit 0 }
    $payload = $raw | ConvertFrom-Json
    $path = $payload.tool_input.file_path
    if (-not $path) { exit 0 }
    if ($path -notmatch '\.(ts|tsx)$') { exit 0 }

    $schema = 'src/lib/api/schema.d.ts'
    if (-not (Test-Path $schema)) {
        [Console]::Error.WriteLine("[Frontend Hook] $schema 이(가) 없습니다. 백엔드 실행 후 'pnpm gen:api' 또는 /sync-api 로 타입을 생성하세요.")
        exit 2
    }

    # 마지막 생성 후 7일 이상 지났으면 안내(차단 아님)
    $ageDays = ((Get-Date) - (Get-Item $schema).LastWriteTime).TotalDays
    if ($ageDays -gt 7) {
        [Console]::Error.WriteLine(("[Frontend Hook] schema.d.ts 가 {0:N0}일 전 생성본입니다. 백엔드 변경이 있었다면 /sync-api 로 갱신하세요." -f $ageDays))
        exit 2
    }
    exit 0
} catch {
    exit 0
}
