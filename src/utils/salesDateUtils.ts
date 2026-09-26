// Date utilities for Bangladesh timezone (Asia/Dhaka) and business calendar weeks (Saturday - Friday)

export const BANGLADESH_TIMEZONE = 'Asia/Dhaka';

export interface DayBucket {
  dayKey: string; // 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'
  fullDayName: string; // 'Saturday', 'Sunday', etc.
  dateYmd: string; // 'YYYY-MM-DD'
  displayDate: string; // '19 Sep'
  isToday: boolean;
  total: number;
}

/**
 * Format timestamp, Date, or date string into 'YYYY-MM-DD' in Asia/Dhaka timezone.
 */
export function getDhakaYMD(tsOrDate: number | Date | string | undefined | null): string {
  if (!tsOrDate) return '';
  let d: Date;
  if (typeof tsOrDate === 'number') {
    d = new Date(tsOrDate);
  } else if (typeof tsOrDate === 'string') {
    d = new Date(tsOrDate);
  } else {
    d = tsOrDate;
  }
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BANGLADESH_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Get weekday ('Sat', 'Sun', etc.) in Asia/Dhaka timezone.
 */
export function getDhakaWeekday(tsOrDate: number | Date | string | undefined | null): string {
  if (!tsOrDate) return '';
  let d: Date;
  if (typeof tsOrDate === 'number') {
    d = new Date(tsOrDate);
  } else if (typeof tsOrDate === 'string') {
    d = new Date(tsOrDate);
  } else {
    d = tsOrDate;
  }
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: BANGLADESH_TIMEZONE,
    weekday: 'short',
  }).format(d);
}

/**
 * Get 7 days of the Bangladesh week (Saturday through Friday)
 * @param weekOffset 0 for current week, -1 for previous week, etc.
 * @param referenceNow base timestamp (defaults to Date.now())
 */
export function getBangladeshWeekDays(
  weekOffset: number = 0,
  referenceNow: number = Date.now()
): {
  days: DayBucket[];
  startDateYmd: string;
  endDateYmd: string;
  todayWeekday: string;
  todayYmd: string;
  formattedRange: string;
} {
  const now = new Date(referenceNow);
  const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BANGLADESH_TIMEZONE,
    weekday: 'short',
  });
  const ymdFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BANGLADESH_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const displayFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: BANGLADESH_TIMEZONE,
    day: 'numeric',
    month: 'short',
  });

  const todayWeekday = weekdayFormatter.format(now);
  const todayYmd = ymdFormatter.format(now);

  // In Bangladesh business calendar, the week starts on Saturday (Sat)
  const offsetFromSat: Record<string, number> = {
    Sat: 0,
    Sun: 1,
    Mon: 2,
    Tue: 3,
    Wed: 4,
    Thu: 5,
    Fri: 6,
  };

  const daysSinceSaturday = offsetFromSat[todayWeekday] ?? 0;
  const msPerDay = 24 * 60 * 60 * 1000;
  const baseNowTs = now.getTime();

  const standardWeekDays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const fullNames: Record<string, string> = {
    Sat: 'Saturday',
    Sun: 'Sunday',
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
  };

  const days: DayBucket[] = [];

  for (let i = 0; i < 7; i++) {
    const dayOffset = i - daysSinceSaturday + weekOffset * 7;
    const dayDate = new Date(baseNowTs + dayOffset * msPerDay);
    const dayWk = standardWeekDays[i];
    const dayYmd = ymdFormatter.format(dayDate);
    const displayDate = displayFormatter.format(dayDate);

    days.push({
      dayKey: dayWk,
      fullDayName: fullNames[dayWk] || dayWk,
      dateYmd: dayYmd,
      displayDate,
      isToday: dayYmd === todayYmd,
      total: 0,
    });
  }

  const startDateYmd = days[0].dateYmd;
  const endDateYmd = days[6].dateYmd;
  const formattedRange = `${days[0].displayDate} – ${days[6].displayDate}`;

  return {
    days,
    startDateYmd,
    endDateYmd,
    todayWeekday,
    todayYmd,
    formattedRange,
  };
}

/**
 * Get current Bangladesh month information (e.g. YYYY-MM, 'September 2026', 'Sep 2026')
 */
export function getBangladeshMonthInfo(referenceNow: number = Date.now()) {
  const d = new Date(referenceNow);
  const ymFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BANGLADESH_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  });
  const fullMonthFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: BANGLADESH_TIMEZONE,
    month: 'long',
    year: 'numeric',
  });
  const shortMonthFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: BANGLADESH_TIMEZONE,
    month: 'short',
    year: 'numeric',
  });

  return {
    yearMonthYm: ymFormatter.format(d), // "2026-09"
    fullMonthName: fullMonthFormatter.format(d), // "September 2026"
    shortMonthName: shortMonthFormatter.format(d), // "Sep 2026"
  };
}

/**
 * Check if a sale belongs to a specific calendar month (in Asia/Dhaka)
 */
export function isSaleInDhakaMonth(
  sale: { timestamp?: number; createdAtDate?: string },
  yearMonthYm: string,
  fullMonthName: string
): boolean {
  if (sale.timestamp && !isNaN(sale.timestamp)) {
    const saleYm = getDhakaYMD(sale.timestamp).substring(0, 7);
    if (saleYm === yearMonthYm) return true;
  }
  if (sale.createdAtDate) {
    if (sale.createdAtDate.includes(fullMonthName)) return true;
    const fallbackYm = getDhakaYMD(sale.createdAtDate).substring(0, 7);
    if (fallbackYm === yearMonthYm) return true;
  }
  return false;
}
