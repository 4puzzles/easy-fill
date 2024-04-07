class Console {
  constructor(prefix) {
    this.prefix = prefix;
  }
  log(msg, ...optionalParams) {
    if(typeof msg === 'string') {
      window.console.log(`${this.prefix}${msg}`, ...optionalParams);
    } else {
      window.console.log(msg, ...optionalParams);
    }
  }
  info(msg, ...optionalParams) {
    if(typeof msg === 'string') {
      window.console.info(`%c${this.prefix}${msg}`, 'color: green;', ...optionalParams)
    } else {
      window.console.info(msg, ...optionalParams);
    }
  }
  error(msg, ...optionalParams) {
    if(typeof msg === 'string') {
      window.console.error(`${this.prefix}${msg}`, ...optionalParams);
    } else {
      window.console.error(msg, ...optionalParams);
    }
  }
};

const console = new Console('[Easy Fill]: ');

export { Console };
export default console;
