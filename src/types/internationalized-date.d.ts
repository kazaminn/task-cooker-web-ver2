declare module '@internationalized/date' {
  export interface CalendarDate {
    toDate(timeZone: string): Date;
  }

  export function parseDate(value: string): CalendarDate;
  export function getLocalTimeZone(): string;
}
