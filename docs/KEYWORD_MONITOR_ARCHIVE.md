# 키워드 감시 기능 아카이브

공연 목록 페이지에서 아티스트 키워드를 감시하는 초기 구현입니다.
현재는 사용하지 않지만, 필요 시 참고용으로 보관합니다.

## 동작 방식

1. 공연 목록 페이지(`/product/ko/performance`) HTML 소스 요청
2. 정규식으로 `Performances` JSON 배열 추출
3. `KEYWORDS` 배열의 키워드가 공연 제목에 포함되면 Discord 알림
4. 수동 실행(`workflow_dispatch`)이고 매칭이 없으면 전체 공연 목록 전송

## 코드

```typescript
import axios from "axios";

const KEYWORDS = ["양인모"];
const TARGET_URL = "https://classicbusan.busan.go.kr/product/ko/performance";
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const WORKFLOW_TYPE = process.env.WORKFLOW_TYPE;

interface Performance {
  Title: string;
  PlayPeriod: string;
  VenueName: string;
  GenreName: string;
  SaleStatus: string;
  LinkUrl: string;
}

async function checkKeywordPerformances() {
  const { data: html } = await axios.get<string>(TARGET_URL);

  const match = html.match(/"Performances"\s*:\s*(\[[\s\S]*?\])\s*,\s*"/);
  if (!match) {
    console.log("[WARN] Performances 데이터를 찾을 수 없습니다.");
    return;
  }

  const performances: Performance[] = JSON.parse(match[1]);

  const found = performances.filter((p) =>
    KEYWORDS.some((keyword) => p.Title.includes(keyword))
  );

  const isManualRun = WORKFLOW_TYPE === "workflow_dispatch";

  if (found.length === 0 && !isManualRun) {
    return;
  }

  let message: string;

  if (found.length > 0) {
    message = [
      "**[공연 등록] 부산콘서트홀 키워드 알림**",
      "",
      ...found.map(
        (p) =>
          `**${p.Title}**\n공연기간: ${p.PlayPeriod}\n장소: ${p.VenueName}\nhttps://classicbusan.busan.go.kr${p.LinkUrl}`
      ),
    ].join("\n");
  } else {
    message = [
      "**[수동 실행] 부산콘서트홀 전체 공연 목록**",
      "",
      `키워드: [${KEYWORDS.join(", ")}] - 매칭 없음`,
      "",
      ...performances.map(
        (p) => `**${p.Title}**\n공연기간: ${p.PlayPeriod}\n장소: ${p.VenueName}\n`
      ),
    ].join("\n");
  }

  if (!WEBHOOK_URL) {
    console.log(message);
    return;
  }

  await axios.post(WEBHOOK_URL, { content: message });
}
```

## 키워드 추가 방법

`KEYWORDS` 배열에 원하는 아티스트 이름을 추가하면 됩니다.

```typescript
const KEYWORDS = ["양인모", "조성진", "임윤찬"];
```
