const kstTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
});

// "HH:mm" (KST)
export function formatKstTime(date: Date) {
  return kstTimeFormat.format(date);
}
