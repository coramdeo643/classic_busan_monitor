## 🛠 부산콘서트홀 '양인모' 공연 모니터링 계획

### 1. 기술 스택 및 환경

- **언어**: TypeScript (Node.js 환경)
- **라이브러리**:
    - `axios`: 웹 페이지 소스 호출 및 디스코드 알림 발송 (Dart의 `dio` 역할)
    - `cheerio`: HTML 파싱 (필요 시 활용)
- **실행 환경**: GitHub Actions (무료 서버리스 스케줄러)
- **알림 채널**: Discord Webhook

---

### 2. 핵심 로직 설계 (단일 책임 원칙 적용)

스크립트는 크게 세 가지 단계로 나뉩니다.

1. **Fetch (데이터 가져오기)**: `https://classicbusan.busan.go.kr/product/ko/performance`에 GET 요청을 보냅니다.
2. **Parse & Extract (데이터 추출)**:
    - 제공하신 소스 코드의 `data: { ... "Performances": [...] }` 부분을 정규식으로 찾아내어 JSON 객체로 변환합니다.
    - 단순 텍스트 검색보다 객체 내부의 `Title` 필드를 검사하여 정확도를 높입니다.
3. **Notify (알림 보내기)**: 조건이 충족되면 디스코드 웹훅 API로 POST 요청을 보냅니다.

---

### 3. 단계별 작업 리스트

### **단계 1: 준비물 챙기기**

- **Discord**: 알림을 받을 채널의 [서버 설정 > 연동 > 웹후크]에서 `웹후크 URL`을 복사해둡니다.
- **GitHub**: 코드를 올릴 레포지토리를 생성합니다.

### **단계 2: 코드 작성 (Artifact: `check.ts`)**

- 가져온 HTML에서 `"Performances":` 문자열 뒤의 배열 데이터를 추출합니다.
- `performances.some(p => p.Title.includes('양인모'))` 로직으로 존재 여부를 체크합니다.

### **단계 3: GitHub Secrets 설정**

- 보안을 위해 디스코드 URL을 코드에 직접 적지 않습니다.
- 레포지토리의 `Settings > Secrets and variables > Actions`에 `DISCORD_WEBHOOK_URL`이라는 이름으로 URL을 저장합니다.

### **단계 4: GitHub Actions 자동화 설정 (`.github/workflows/monitor.yml`)**

- **스케줄 설정**: `cron: '0 0 * * *'` (매일 한국 시간 오전 9시 실행)
- **환경 구성**: Node.js 설치 → 의존성 설치(`npm install`) → 스크립트 실행.

---

### 4. 나중에 참고할 소스 분석 포인트

오늘 발견한 **** 번 줄의 `Performances` 배열이 핵심입니다. 사이트 개편으로 이 구조가 바뀌지 않는 한, 이 방식이 가장 빠르고 정확합니다.

---

### 5. 예상되는 확장성 (Open-Closed Principle)

나중에 양인모 아티스트 외에 **'조성진'**이나 **'임윤찬'**을 추가하고 싶다면, 코드 전체를 고칠 필요 없이 체크할 `keywordList = ['양인모', '조성진']` 배열만 확장하도록 설계하면 편리합니다.

---

**준비가 되셨을 때 말씀해 주세요!** 바로 복사해서 사용하실 수 있는 **TypeScript 소스 코드**와 **GitHub Actions 설정 파일** 전체를 작성해 드리겠습니다. (파일을 한 번에 하나씩 제공해 드릴 예정입니다.)

어느 파일부터 만들어 드릴까요? 혹은 더 궁금한 점이 있으신가요?