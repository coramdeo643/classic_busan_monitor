import axios from "axios";

// ── 설정 ──────────────────────────────────────────
// 모니터링할 아티스트 키워드 목록 (여기에 추가하면 됩니다)
const KEYWORDS = ["양인모"];

// 부산콘서트홀 공연 목록 페이지
const TARGET_URL =
  "https://classicbusan.busan.go.kr/product/ko/performance";

// Discord 웹훅 URL (GitHub Secrets에서 주입)
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// 워크플로우 타입 (workflow_dispatch = 수동, schedule = 자동)
const WORKFLOW_TYPE = process.env.WORKFLOW_TYPE;

// ── 타입 정의 ─────────────────────────────────────
interface Performance {
  Title: string;
  PlayPeriod: string;
  VenueName: string;
  GenreName: string;
  SaleStatus: string;
  LinkUrl: string;
}

// ── 메인 로직 ─────────────────────────────────────
async function main() {
  // 1. 페이지 소스 가져오기
  console.log("📡 부산콘서트홀 페이지 요청 중...");
  const { data: html } = await axios.get<string>(TARGET_URL);

  // 2. Performances 배열 추출 (페이지 소스의 JS 데이터에서 정규식으로 파싱)
  const match = html.match(/"Performances"\s*:\s*(\[[\s\S]*?\])\s*,\s*"/);
  if (!match) {
    console.log("⚠️ Performances 데이터를 찾을 수 없습니다. 사이트 구조가 변경되었을 수 있습니다.");
    return;
  }

  const performances: Performance[] = JSON.parse(match[1]);
  console.log(`📋 총 ${performances.length}개 공연 확인`);
  performances.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.Title} | ${p.PlayPeriod} | ${p.VenueName}`);
  });

  // 3. 키워드 매칭
  const found = performances.filter((p) =>
    KEYWORDS.some((keyword) => p.Title.includes(keyword))
  );

  // 4. 수동 실행 vs 자동 실행 분기
  const isManualRun = WORKFLOW_TYPE === "workflow_dispatch";

  if (found.length === 0 && !isManualRun) {
    console.log(`🔍 키워드 [${KEYWORDS.join(", ")}]에 해당하는 공연이 없습니다.`);
    return;
  }

  // 5. Discord 알림 메시지 생성
  let message: string;

  if (found.length > 0) {
    console.log(`🎯 ${found.length}개 공연 발견!`);
    message = [
      "🎵 **부산콘서트홀 공연 알림**",
      "",
      ...found.map(
        (p) =>
          `**${p.Title}**\n📅 ${p.PlayPeriod}\n📍 ${p.VenueName}\n🎫 ${p.SaleStatus}\n🔗 https://classicbusan.busan.go.kr${p.LinkUrl}`
      ),
    ].join("\n");
  } else {
    // 수동 실행 & 매칭 없음: 전체 공연 목록 전송
    console.log(`📋 수동 실행 - 전체 ${performances.length}개 공연 목록 전송`);
    message = [
      "📋 **부산콘서트홀 전체 공연 목록** (수동 조회)",
      "",
      `키워드: [${KEYWORDS.join(", ")}] - 매칭 없음`,
      "",
      ...performances.map(
        (p) =>
          `**${p.Title}**\n📅 ${p.PlayPeriod}\n📍 ${p.VenueName}\n🎫 ${p.SaleStatus}\n🔗 https://classicbusan.busan.go.kr${p.LinkUrl}`
      ),
    ].join("\n");
  }

  if (!WEBHOOK_URL) {
    console.log("⚠️ DISCORD_WEBHOOK_URL이 설정되지 않았습니다. 메시지 내용:");
    console.log(message);
    return;
  }

  await axios.post(WEBHOOK_URL, { content: message });
  console.log("✅ Discord 알림 전송 완료!");
}

main().catch((error) => {
  console.error("❌ 에러 발생:", error.message);
  process.exit(1);
});
