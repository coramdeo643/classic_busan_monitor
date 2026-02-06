# 부산콘서트홀 공연 모니터링 - 작업 진행내역

> 부산콘서트홀 웹사이트에서 특정 아티스트(양인모 등)의 공연이 등록되면
> Discord로 자동 알림을 보내는 모니터링 도구를 만드는 프로젝트입니다.

---

## 목차 (진행 상황)

| # | 작업 | 상태 |
|---|------|------|
| 1 | [Git 저장소 초기화](#1-git-저장소-초기화) | :white_check_mark: 완료 |
| 2 | [npm 프로젝트 초기화](#2-npm-프로젝트-초기화-packagejson) | :white_check_mark: 완료 |
| 3 | [의존성 패키지 설치](#3-의존성-패키지-설치) | :white_check_mark: 완료 |
| 4 | [TypeScript 설정](#4-typescript-설정-tsconfigjson) | :white_check_mark: 완료 |
| 5 | [.gitignore 설정](#5-gitignore-설정) | :white_check_mark: 완료 |
| 6 | [모니터링 스크립트 작성](#6-모니터링-스크립트-작성-srccheccts) | :white_check_mark: 완료 |
| 7 | [로컬 테스트 실행](#7-로컬-테스트-실행) | :white_check_mark: 완료 |
| 8 | [GitHub Actions 워크플로우 작성](#8-github-actions-워크플로우-작성) | :white_check_mark: 완료 |
| 9 | [GitHub CLI 설치 및 로그인](#9-github-cli-설치-및-로그인) | :white_check_mark: 완료 |
| 10 | [GitHub 레포지토리 생성 및 Push](#10-github-레포지토리-생성-및-push) | :black_square_button: 진행 전 |
| 11 | [Discord 웹훅 생성](#11-discord-웹훅-생성) | :black_square_button: 진행 전 |
| 12 | [GitHub Secrets 설정](#12-github-secrets-설정) | :black_square_button: 진행 전 |
| 13 | [GitHub Actions 수동 실행으로 최종 테스트](#13-github-actions-수동-실행으로-최종-테스트) | :black_square_button: 진행 전 |

---

## 1. Git 저장소 초기화

**실행한 명령어:**
```bash
git init
git branch -m main
```

**이게 뭔가요?**

`git init`은 현재 폴더를 Git이 추적하는 저장소(repository)로 만들어주는 명령어입니다.
이걸 실행하면 폴더 안에 `.git`이라는 숨겨진 폴더가 생기고, 이후부터 파일의 변경 이력을 기록할 수 있게 됩니다.

`git branch -m main`은 기본 브랜치 이름을 `main`으로 바꿔주는 명령어입니다.
Git은 기본적으로 `master`라는 이름을 쓰는데, GitHub에서는 `main`을 표준으로 사용하기 때문에 맞춰준 것입니다.

---

## 2. npm 프로젝트 초기화 (`package.json`)

**실행한 명령어:**
```bash
npm init -y
```

**이게 뭔가요?**

`npm init -y`는 Node.js 프로젝트의 설정 파일인 `package.json`을 자동으로 만들어주는 명령어입니다.
`-y` 옵션은 "모든 질문에 yes로 대답해라"라는 뜻으로, 기본값으로 빠르게 생성합니다.

**`package.json`이 하는 일:**
- 프로젝트 이름, 버전 등 기본 정보를 담고 있음
- 이 프로젝트가 어떤 라이브러리(패키지)를 사용하는지 목록을 관리
- `scripts` 항목에 자주 쓰는 명령어를 등록해둘 수 있음

**현재 등록된 스크립트:**
```json
"scripts": {
  "check": "tsx src/check.ts"
}
```
이렇게 등록하면 `npm run check`만 입력해도 모니터링 스크립트가 실행됩니다.

---

## 3. 의존성 패키지 설치

**실행한 명령어:**
```bash
npm install axios cheerio
npm install -D typescript @types/node tsx
```

**이게 뭔가요?**

`npm install`은 외부 라이브러리(패키지)를 다운로드하여 프로젝트에 추가하는 명령어입니다.
설치된 패키지는 `node_modules/` 폴더에 저장되고, `package.json`에 자동으로 기록됩니다.

**운영 의존성 (dependencies) - 실제 실행에 필요한 것:**

| 패키지 | 역할 |
|--------|------|
| `axios` | HTTP 요청을 보내는 라이브러리. 웹사이트 데이터를 가져오거나, Discord 웹훅에 메시지를 보낼 때 사용 |
| `cheerio` | HTML을 파싱(분석)하는 라이브러리. 현재는 정규식으로 처리하지만, 사이트 구조가 바뀌면 활용 가능 |

**개발 의존성 (devDependencies) - 개발할 때만 필요한 것:**

| 패키지 | 역할 |
|--------|------|
| `typescript` | TypeScript 컴파일러. `.ts` 파일을 `.js`로 변환 |
| `@types/node` | Node.js의 내장 기능(예: `process.env`)에 대한 TypeScript 타입 정의 |
| `tsx` | TypeScript 파일을 컴파일 없이 바로 실행해주는 도구. `tsx src/check.ts`로 바로 실행 가능 |

> **`-D` 옵션이란?** `--save-dev`의 줄임말로, "이 패키지는 개발할 때만 필요하다"는 표시입니다.
> 운영 서버에 배포할 때는 설치하지 않아도 됩니다. (하지만 GitHub Actions에서는 둘 다 설치합니다)

---

## 4. TypeScript 설정 (`tsconfig.json`)

**생성한 파일:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

**이게 뭔가요?**

`tsconfig.json`은 TypeScript 컴파일러에게 "코드를 어떻게 변환할지" 알려주는 설정 파일입니다.

**각 옵션 설명:**

| 옵션 | 설명 |
|------|------|
| `target: "ES2022"` | 변환할 JavaScript 버전. ES2022는 최신 문법을 지원 |
| `module: "commonjs"` | Node.js 표준 모듈 시스템 사용 (`require`/`module.exports`) |
| `strict: true` | 엄격한 타입 체크 활성화. 버그를 미리 잡아줌 |
| `esModuleInterop: true` | `import axios from 'axios'` 같은 ES 모듈 문법을 사용할 수 있게 해줌 |
| `outDir: "dist"` | 컴파일된 `.js` 파일이 저장될 폴더 |
| `rootDir: "src"` | TypeScript 소스 코드가 있는 폴더 |
| `skipLibCheck: true` | 외부 라이브러리의 타입 파일은 검사 스킵 (빌드 속도 향상) |
| `resolveJsonModule: true` | JSON 파일을 `import`로 불러올 수 있게 허용 |
| `include: ["src"]` | `src/` 폴더 안의 파일만 컴파일 대상으로 지정 |

---

## 5. `.gitignore` 설정

**생성한 파일:** `.gitignore`

**이게 뭔가요?**

`.gitignore`는 Git에게 "이 파일/폴더는 추적하지 마세요"라고 알려주는 파일입니다.
여기에 적힌 파일은 `git add`를 해도 스테이징되지 않고, GitHub에도 올라가지 않습니다.

**핵심 제외 항목:**

| 항목 | 이유 |
|------|------|
| `node_modules/` | npm 패키지 폴더. 용량이 크고, `npm install`로 언제든 복원 가능 |
| `dist/` | 컴파일된 JS 파일. 소스 코드(`src/`)만 관리하면 됨 |
| `.env` | 환경변수 파일. Discord 웹훅 URL 같은 민감한 정보가 들어갈 수 있음 |

추가로 VSCode, IntelliJ, Android Studio 등 IDE 관련 파일도 제외하도록 설정되어 있습니다.

---

## 6. 모니터링 스크립트 작성 (`src/check.ts`)

**생성한 파일:** `src/check.ts`

**이게 뭔가요?**

이 프로젝트의 핵심 파일입니다. 부산콘서트홀 웹사이트를 확인하고, 원하는 아티스트의 공연이 있으면 Discord로 알림을 보냅니다.

**동작 흐름 (4단계):**

```
[1. Fetch]          [2. Parse]           [3. Check]         [4. Notify]
웹페이지 요청  →  공연 데이터 추출  →  키워드 매칭  →  Discord 알림 전송
```

### 1단계: Fetch (데이터 가져오기)
```typescript
const { data: html } = await axios.get<string>(TARGET_URL);
```
- `axios.get()`으로 부산콘서트홀 공연 목록 페이지의 HTML 소스를 가져옵니다.
- 브라우저에서 "소스 보기"를 하면 나오는 그 내용 전체를 가져오는 것입니다.

### 2단계: Parse (데이터 추출)
```typescript
const match = html.match(/"Performances"\s*:\s*(\[[\s\S]*?\])\s*,\s*"/);
const performances: Performance[] = JSON.parse(match[1]);
```
- 웹페이지 HTML 안에는 JavaScript 코드로 공연 데이터가 포함되어 있습니다.
- 정규식으로 `"Performances": [...]` 부분을 찾아서 JSON 배열로 변환합니다.
- 각 공연 객체에는 `Title`(제목), `PlayPeriod`(기간), `VenueName`(장소) 등의 정보가 있습니다.

### 3단계: Check (키워드 매칭)
```typescript
const KEYWORDS = ["양인모"];
const found = performances.filter((p) =>
  KEYWORDS.some((keyword) => p.Title.includes(keyword))
);
```
- `KEYWORDS` 배열에 있는 키워드가 공연 제목에 포함되어 있는지 확인합니다.
- 나중에 `['양인모', '조성진', '임윤찬']`처럼 배열만 늘리면 여러 아티스트를 동시에 모니터링할 수 있습니다.

### 4단계: Notify (Discord 알림)
```typescript
await axios.post(WEBHOOK_URL, { content: message });
```
- 매칭되는 공연이 있으면 Discord 웹훅 URL로 POST 요청을 보내 알림을 전송합니다.
- `WEBHOOK_URL`은 코드에 직접 적지 않고, 환경변수(`process.env.DISCORD_WEBHOOK_URL`)에서 가져옵니다.

---

## 7. 로컬 테스트 실행

**실행한 명령어:**
```bash
npm run check
```

**실행 결과:**
```
📡 부산콘서트홀 페이지 요청 중...
📋 총 7개 공연 확인
🔍 키워드 [양인모]에 해당하는 공연이 없습니다.
```

**결과 해석:**
- 부산콘서트홀에 현재 7개 공연이 등록되어 있음
- '양인모' 키워드가 포함된 공연은 아직 없음
- Discord 웹훅이 설정되지 않아도, 매칭되는 공연이 없으므로 정상 종료
- 스크립트가 에러 없이 정상 동작하는 것을 확인

---

## 8. GitHub Actions 워크플로우 작성

**생성한 파일:** `.github/workflows/monitor.yml`

**이게 뭔가요?**

GitHub Actions는 GitHub이 무료로 제공하는 자동화 서비스입니다.
"특정 시간에 서버에서 코드를 실행해라"라고 설정할 수 있습니다.

즉, 우리 컴퓨터를 켜놓지 않아도 GitHub 서버가 매일 알아서 모니터링 스크립트를 실행해줍니다.

**워크플로우 파일 구조 설명:**

```yaml
name: Monitor Busan Concert Hall    # 워크플로우 이름 (Actions 탭에 표시됨)

on:
  schedule:
    - cron: '0 23 * * *'            # 언제 실행할지 (cron 표현식)
  workflow_dispatch:                 # 수동 실행 버튼 활성화
```

**cron 표현식 `0 23 * * *` 해석:**

```
┌───────── 분 (0)
│ ┌─────── 시 (23) ← UTC 23시 = 한국시간 오전 8시
│ │ ┌───── 일 (*) ← 매일
│ │ │ ┌─── 월 (*) ← 매월
│ │ │ │ ┌─ 요일 (*) ← 매요일
0 23 * * *
```

**Jobs (실행할 작업들):**

```yaml
jobs:
  check:
    runs-on: ubuntu-latest          # 1. GitHub의 Linux 서버에서 실행
    steps:
      - uses: actions/checkout@v4   # 2. 레포 코드를 서버로 복사 (git clone과 비슷)
      - uses: actions/setup-node@v4 # 3. Node.js 20 버전 설치
      - run: npm install            # 4. 의존성 패키지 설치
      - run: npm run check          # 5. 모니터링 스크립트 실행
        env:
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
          # ↑ GitHub Secrets에 저장한 웹훅 URL을 환경변수로 주입
```

> **`${{ secrets.DISCORD_WEBHOOK_URL }}`이란?**
> GitHub 레포지토리의 Settings > Secrets에 저장한 비밀값을 가져오는 문법입니다.
> 코드에 직접 URL을 적으면 Public 레포에서 누구나 볼 수 있으므로, 이 방식으로 안전하게 관리합니다.

---

## 9. GitHub CLI 설치 및 로그인

**실행한 명령어:**
```bash
brew install gh       # Homebrew로 GitHub CLI 설치
gh auth login         # GitHub 계정 로그인 (브라우저 인증)
```

**이게 뭔가요?**

GitHub CLI(`gh`)는 터미널에서 GitHub을 조작할 수 있게 해주는 공식 도구입니다.
브라우저에서 GitHub 사이트에 들어가지 않아도, 터미널에서 바로 레포 생성, PR 만들기 등을 할 수 있습니다.

**인증 완료 상태:** `coramdeo643` 계정으로 로그인됨

---

## 10. GitHub 레포지토리 생성 및 Push

> :black_square_button: **아직 진행 전**

레포지토리를 만들고 코드를 업로드하는 단계입니다.

---

## 11. Discord 웹훅 생성

> :black_square_button: **아직 진행 전**

Discord 서버에서 웹훅 URL을 만드는 단계입니다.

---

## 12. GitHub Secrets 설정

> :black_square_button: **아직 진행 전**

Discord 웹훅 URL을 GitHub에 안전하게 저장하는 단계입니다.

---

## 13. GitHub Actions 수동 실행으로 최종 테스트

> :black_square_button: **아직 진행 전**

모든 설정이 끝난 후, GitHub Actions 탭에서 수동으로 워크플로우를 실행하여 전체 동작을 검증하는 단계입니다.

---

## 프로젝트 구조

```
classic_busan_monitor/
├── .github/
│   └── workflows/
│       └── monitor.yml      ← GitHub Actions 자동 실행 설정
├── docs/
│   ├── INIT_PLAN.md         ← 최초 기획 문서
│   └── PROGRESS.md          ← 이 문서 (작업 진행내역)
├── src/
│   └── check.ts             ← 모니터링 스크립트 (핵심 로직)
├── .gitignore               ← Git 제외 파일 목록
├── package.json             ← npm 프로젝트 설정 & 의존성 목록
├── package-lock.json        ← 의존성 정확한 버전 잠금 파일
└── tsconfig.json            ← TypeScript 컴파일러 설정
```
