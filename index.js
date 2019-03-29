var cookies = wx.getStorageSync('cookies') || {}

function seter (name, value, options) {
  var now = new Date()
  var expires = options.maxAge ? new Date(+options.maxAge + now.getTime()) : options.expires instanceof Date ? options.expires : typeof options.expires === 'string' && new Date(options.expires).valueOf() ? new Date(options.expires) : null
  if ( !expires || expires > now ) {
    cookies[name] = {
      v: value
    }
    expires && (cookies[name].e = expires)
    options.domain && (cookies[name].d = options.domain)
    options.path && (cookies[name].p = options.path)
    options.secure && (cookies[name].e = options.secure)
    wx.setStorageSync('cookies', cookies)
  } else if ( cookies[name] ) {
    reomve(name)
  }
}
function remove (name) {
  delete cookies[name]
  wx.setStorageSync('cookies', cookies)
}
function removeAll () {
  wx.removeStorageSync('cookies')
}
function geter (name, domain, path) {
  var cookie = cookies.hasOwnProperty(name) && cookies[name]
  if ( cookie ) {
    if ( (!cookie.d || domain.search(cookie.d) === Math.abs(domain.length - cookie.d.length) ) && ( !path || path.search(cookie.p) === 0 ) ) {
      if ( !cookie.e || new Date(cookie.e) > new Date() ) {
        return cookie.v
      } else {
        remove(name)
        return ''
      }
    } else {
      return ''
    }
  }
  return ''
}
function getAll () {
  var str = []
  for ( var name in cookies ) {
    var value = geter(name)
    if ( value ) {
      str.push(name + '=' + value)
    }
  }
  return str.join('; ')
}
function clearExpired () {
  var now = new Date()
  var modified = false
  for ( var name in cookies ) {
    if ( cookies.hasOwnProperty(name) && ( !cookies[name].e || cookies[name].e < now ) ) {
      delete cookies[name]
      modified = true
    }
  }
  if ( modified ) {
    wx.setStorageSync('cookies', cookies)
  }
}
var cookiePattern = {
  content: /^(?:(?:([\'\"])([^\1]+)\1)|([^;,=\s]+))\s*=\s*(?:(?:([\'\"])([^\1]+)\1)|([^;,=\s]+))/,/**nameIndex=2|3 valueIndex=5|6 */
  options: {
    expires: /;\s*expires\s*=\s*([\d\sa-zA-Z-+:]+)/i,/**valueIndex = 1*/
    domain: /;\s*domain\s*=\s*(['"])?\s*([^\1=;,]+\.[^\1=;,.]+)\s*\1/i,/**valueIndex = 2*/
    path: /;\s*path\s*=\s*(['"])?\s*([^\1;,]+)\s*\1/,/**valueIndex = 2*/
    maxAge: /;\s*max-age\s*=\s*(\d+)(?=\s*[;,]|$)/i,/**valueIndex = 1*/
    secure: /;\s*(secure)(?=\s*[;,]|$)/i,/**valueIndex = 1*/
  }
}
var slitPattern = new RegExp(',\s*(?=' + cookiePattern.content.toString().replace(/^\/\^?/, '').replace(/\/$/, '') + ')', 'g')
function parse (cookieHeader) {
  var items = []
  for ( var prev = null; prev !== 0 ; prev = slitPattern.lastIndex ) {
    slitPattern.test(cookieHeader)
    items.push(cookieHeader.substring(prev || 0, slitPattern.lastIndex || cookieHeader.length ))
  }
  var cookies = []
  for (var i = 0; i < items.length; i++) {
    var matched = items[i].match(cookiePattern.content);
    if ( matched ) {
      var cookie = {
        name: matched[2] || matched[3],
        value: matched[5] || matched[6],
        options: {}
      }
      for (var key in cookiePattern.options) {
        var optionMatched = items[i].match(cookiePattern.options[key])
        if ( optionMatched ) {
          cookie.options[key] = optionMatched[optionMatched.length - 1]
        }
      }
      cookies.push(cookie)
    }
  }
  return cookies
}

exports.set = seter
exports.get = geter
exports.getAll = getAll
exports.remove = remove
exports.removeAll = removeAll
exports.parse = parse
exports.clear = clearExpired