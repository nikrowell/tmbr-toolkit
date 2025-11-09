import { isNumber } from './isNumber.js';
import { isString } from './isString.js';

/**
 * Formats a date according to the specified pattern
 *
 * @param pattern - string of tokens
 * @param date    - optional date object, string or timestamp (defaults to the current time)
 */
export function format(pattern, date) {
  if (isNumber(date)) date = new Date(date);
  if (isString(date)) date = new Date(date);
  date ??= new Date();
  return pattern.replace(regex, match => match.startsWith('[') ? match.slice(1, -1) : formatters[match]?.(date) ?? match);
};

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const ordinals = [
  'st',
  'nd',
  'rd',
  'th',
];

const formatters = {
  YYYY : d => d.getFullYear(),
  YY   : d => String(d.getFullYear()).slice(-2),
  MMMM : d => months[d.getMonth()],
  MMM  : d => months[d.getMonth()].slice(0, 3),
  MM   : d => pad(d.getMonth() + 1),
  M    : d => d.getMonth() + 1,
  DDDD : d => days[d.getDay()],
  DDD  : d => days[d.getDay()].slice(0, 3),
  DD   : d => pad(d.getDate()),
  Do   : d => d.getDate() + (ordinals[d.getDate() - 1] ?? 'th'),
  D    : d => d.getDate(),
  HH   : d => pad(d.getHours()),
  H    : d => d.getHours(),
  hh   : d => pad(d.getHours() % 12 || 12),
  h    : d => d.getHours() % 12 || 12,
  mm   : d => pad(d.getMinutes()),
  m    : d => d.getMinutes(),
  ss   : d => pad(d.getSeconds()),
  s    : d => d.getSeconds(),
  A    : d => d.getHours() < 12 ? 'AM' : 'PM',
  a    : d => d.getHours() < 12 ? 'am' : 'pm',
};

const regex = /(\[.*?\]|YYYY|YY|MMMM|MMM|MM|M|Do|DDDD|DDD|DD|D|HH|H|hh|h|mm|m|ss|s|A|a)/g;
const pad = n => String(n).padStart(2, '0');
