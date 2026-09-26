const kstDateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  weekday: "long",
});

export function formatKstDate(date: Date) {
  return kstDateFormat.format(date);
}
