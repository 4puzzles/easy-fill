// default path to the custom script
const defaultScriptPath = 'build/inject.bundle.js';

// inject custom script
(function(scriptPath) {
  // log
  console.info(`%c[Easy Fill]: path '${location.pathname}' detected`, 'color: green;');

	let script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');

  // cannot use relative path directly like script.src = 'inject.bundle.js'
  // because it violates the following Content Security Policy directive: "script-src 'self'"
	// something like chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/build/inject.bundle.js
	script.src = chrome.runtime.getURL(scriptPath);

  // Would you believe that the trash system is running in quirks mode?
  // no doctype, no character set
  // must set charset attribute of the script tag
  // otherwise the chinese text in external javascript file will become garbled
  // charset is a deprecated attribute
  script.charset = 'utf-8';

	script.onload = function() {
		// remove after execution
		this.parentNode.removeChild(this);
	};

	document.head.appendChild(script);
})(defaultScriptPath);
