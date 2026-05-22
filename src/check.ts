import axios from "axios";

// ── 설정 ──────────────────────────────────────────
// 상세 내용이 미정인 공연 모니터링 목록
// 가격/러닝타임 등 핵심 항목이 확정되면 Discord 알림
const WATCH_PERFORMANCES = [
  {
    id: 253100,
    name: "피아니스트 조성진 체임버 콘서트",
    url: "https://classicbusan.busan.go.kr/product/ko/performance/253100",
  },
];

// Discord 웹훅 URL (GitHub Secrets에서 주입)
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// ── 타입 정의 ─────────────────────────────────────
interface Description {
  Name: string;
  Value: string;
}

// ── 알림 전송 ─────────────────────────────────────
async function sendDiscord(message: string) {
  if (!WEBHOOK_URL) {
    console.log("[WARN] DISCORD_WEBHOOK_URL이 설정되지 않았습니다. 메시지 내용:");
    console.log(message);
    return;
  }
  await axios.post(WEBHOOK_URL, { content: message });
  console.log("[OK] Discord 알림 전송 완료");
}

// ── 미정 공연 상세 감시 ────────────────────────────
async function checkWatchPerformances() {
  for (const target of WATCH_PERFORMANCES) {
    console.log(`[INFO] 상세 감시 중: ${target.name}`);

    const { data: html } = await axios.get<string>(target.url);

    const match = html.match(/"Descriptions"\s*:\s*(\[[\s\S]*?\])\s*,\s*"Details"/);
    if (!match) {
      console.log(`[WARN] ${target.name} - Descriptions 파싱 실패. 사이트 구조 확인 필요`);
      continue;
    }

    const descriptions: Description[] = JSON.parse(match[1]);

    const confirmed = descriptions.filter(
      (d) => d.Value && d.Value !== "미정" && d.Value.trim() !== ""
    );
    const pending = descriptions.filter((d) => d.Value === "미정");

    console.log(`[INFO] 확정된 항목: ${confirmed.map((d) => d.Name).join(", ") || "없음"}`);
    console.log(`[INFO] 미정 항목: ${pending.map((d) => d.Name).join(", ") || "없음"}`);

    const priceItem = descriptions.find((d) => d.Name === "가격");
    if (!priceItem || priceItem.Value === "미정") {
      console.log(`[INFO] ${target.name} - 가격이 아직 미정입니다.`);
      continue;
    }

    const allRows = descriptions
      .map((d) => `  ${d.Name}: ${d.Value}`)
      .join("\n");

    const message = [
      `**[예매 오픈 임박] ${target.name}**`,
      "",
      `**전체 공연 정보:**`,
      allRows,
      "",
      `https://classicbusan.busan.go.kr/product/ko/performance/${target.id}`,
    ].join("\n");

    await sendDiscord(message);
  }
}

// ── 메인 ──────────────────────────────────────────
async function main() {
  await checkWatchPerformances();
}

main().catch((error) => {
  console.error("[ERROR]", error.message);
  process.exit(1);
});
