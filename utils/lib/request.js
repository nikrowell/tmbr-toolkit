import { isArray } from './isArray.js';
import { isObject } from './isObject.js';

/**
 * Fetch wrapper with common defaults and convenience methods
 *
 * - defaults to sending `'Content-Type': 'application/json'` headers
 * - settles with the parsed JSON response on both success and failure, with a non-enumerable `response` property (`result.response.status`)
 * - prefixes relative URLs with a preceeding slash
 * - converts the data argument to a JSON string or URL params for `GET` requests
 * - exposes `request.headers` for overriding the default headers
 * - exposes `request.handler` for overriding the default response handler passed to `fetch(...).then(request.handler)`
 * - creates `request[method]()` helpers
 *
 * @param {string} method - HTTP method
 * @param {string} url - request URL
 * @param {Object} data - request data (body or query params for GET)
 * @param {Object} options - additional fetch options
 * @returns {Promise} promise resolving to JSON response
 *
 * @example
 * request.get('https://api.example.com/users?limit=10');
 * request.get('/users', {limit: 10}); *
 * request.post('/login', {username, password});
 * request.headers['Authorization'] = `Bearer ${token}`;
 *
 * @alias request
 */

function req(method, url, data, options = {}) {

  options.method = method.toUpperCase();
  options.headers = Object.assign({...request.headers}, options.headers);

  if (!url.startsWith('http')) {
    url = `/${url.startsWith('/') ? url.slice(1) : url}`;
  }

  if (options.method === 'GET') {
    const params = new URLSearchParams(data || '').toString();
    params && (url += `${url.includes('?') ? '&' : '?'}${params}`);
  } else {
    options.body = JSON.stringify(data || {});
  }

  return fetch(url, options).then(request.handler);
}

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const handler = response => response.text().then(body => {
  const data = JSON.parse(body || null) ?? {};

  if (isObject(data) || isArray(data)) {
    Object.defineProperty(data, 'response', {value: response});
  }

  if (!response.ok) throw data;
  return data;
});

export const request = /* @__PURE__ */ Object.assign(req, {
  headers,
  handler,
  get:    (...args) => req('GET', ...args),
  post:   (...args) => req('POST', ...args),
  put:    (...args) => req('PUT', ...args),
  patch:  (...args) => req('PATCH', ...args),
  delete: (...args) => req('DELETE', ...args)
});
