export function formatTime(dateString?: string | null) {
  if (!dateString) return "";

  try {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch {
    return "";
  }
}

export function calcDurationSeconds(startedAt: string, endedAt: string) {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();

  if (!start || !end) return 0;

  return Math.max(0, Math.floor((end - start) / 1000));
}
