/**
 * 将日期转换为相对时间格式
 * @param timeStr 日期字符串，格式如：2024-01-01T12:00:00
 * @returns 相对时间字符串，如：5分钟前、3小时前、2天前、1月5日、2023年12月25日
 */
export function formatRelativeTime(timeStr: string): string {
  if (!timeStr) return '';

  const date = new Date(timeStr);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);

  // 60分钟内显示n分钟前
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }

  // 24小时内显示n小时前
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }

  // 30天内显示n天前
  if (diffDays < 30) {
    return `${diffDays}天前`;
  }

  // 超过一个月但在同一年内，展示月+天
  if (diffYears < 1) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  // 超出一年，展示年+月+天
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 格式化时间，只保留年月日，如2026-02-06
 */
export function formatTimeYMD(timeStr: string): string {
  if (!timeStr) return '';

  const date = new Date(timeStr);

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}