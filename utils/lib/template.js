/**
 * Micro-templating with `{{ }}` interpolation and `{# #}` evaluation
 *
 * @param {string} str - template selector or string
 * @param {Object} [data] - optional data object
 * @returns {Function|string} render function, or rendered string if data is provided
 *
 * @example
 * const render = template('#example');
 * const html = render({name: 'Nik'});
 * const html = template('<p>{{ name }}</p>', {name: 'Nik'});
 */
export function template(str, data) {

  const fn = !/\s/.test(str)
    ? cache[str] = cache[str] || template(document.querySelector(str).innerHTML.trim())
    : new Function('obj', "var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('" + str
        .replace(/[\r\t\n]/g, " ")
        .split("{#").join("\t")
        .replace(/(^|#\})[^\t]*/g, m => m.replace(/'/g, "\r"))
        .replace(/\t=(.*?)#\}/g, "',$1,'")
        .replace(/\{\{(.*?)\}\}/g, "',$1,'")
        .split("\t").join("');")
        .split("#}").join("p.push('")
        .split("\r").join("\\'") + "');}return p.join('');");

  return data ? fn(data) : fn;
};

const cache = {};
