import { isNumber } from './isNumber.js';
import { isString } from './isString.js';
import { ordinal } from './ordinal.js';

/**
 * Formats a date according to the specified pattern
 *
 * @example
 * format('DDDD, MMMM Do, YYYY [at] h:mm a');
 *
 * @param pattern - string of tokens
 * @param date    - optional date object, string or timestamp (defaults to the current time)
 *
 * @return formatted date string
 */
export function format(pattern, date) {
  if (isNumber(date)) date = new Date(date);
  if (isString(date)) date = new Date(date);
  date ??= new Date();
  return pattern.replace(regex, match => match.startsWith('[') ? match.slice(1, -1) : formatters[match]?.(date) ?? match);
};

const regex = /(\[.*?\]|YYYY|YY|MMMM|MMM|MM|M|Do|DDDD|DDD|DD|D|HH|H|hh|h|mm|m|ss|s|A|a)/g;
const $0 = n => String(n).padStart(2, '0');

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

const formatters = {
  YYYY : d => d.getFullYear(),
  YY   : d => String(d.getFullYear()).slice(-2),
  MMMM : d => months[d.getMonth()],
  MMM  : d => months[d.getMonth()].slice(0, 3),
  MM   : d => $0(d.getMonth() + 1),
  M    : d => d.getMonth() + 1,
  DDDD : d => days[d.getDay()],
  DDD  : d => days[d.getDay()].slice(0, 3),
  DD   : d => $0(d.getDate()),
  Do   : d => ordinal(d.getDate()),
  D    : d => d.getDate(),
  HH   : d => $0(d.getHours()),
  H    : d => d.getHours(),
  hh   : d => $0(d.getHours() % 12 || 12),
  h    : d => d.getHours() % 12 || 12,
  mm   : d => $0(d.getMinutes()),
  m    : d => d.getMinutes(),
  ss   : d => $0(d.getSeconds()),
  s    : d => d.getSeconds(),
  A    : d => d.getHours() < 12 ? 'AM' : 'PM',
  a    : d => d.getHours() < 12 ? 'am' : 'pm',
};
