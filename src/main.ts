// log current page path
console.info("%c[Easy Fill]: path '" + location.pathname + "' detected", 'color: green;')

const script = document.createElement('script')
script.setAttribute('type', 'module')

// cannot use relative path directly like script.src = 'inject.bundle.js'
// because it violates the following Content Security Policy directive: "script-src 'self'"
// something like chrome-extension://fhoompeilmbglemidjecngcokdnfojlk/js/inject.js
script.src = chrome.runtime.getURL('js/inject.js')

// Would you believe that the trash system is running in quirks mode?
// no doctype, no character set
// must set charset attribute of the script tag
// otherwise the chinese text in external javascript file will become garbled
// charset is a deprecated attribute
script.charset = 'utf-8'

script.onload = function () {
  // remove after execution
  script.parentNode?.removeChild(script)
}

// inject custom script
document.head.appendChild(script)
