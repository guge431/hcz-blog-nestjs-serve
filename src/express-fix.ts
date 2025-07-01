// express-fix.ts - 修复 Express 4.x 兼容性问题
const expressLib = require('express');

if (expressLib && expressLib.application) {
  const originalGet = expressLib.application.get;
  
  expressLib.application.get = function(setting: string) {
    if (setting === 'router') {
      return undefined;
    }
    return originalGet.call(this, setting);
  };
  
  // 防止访问 router 属性
  Object.defineProperty(expressLib.application, 'router', {
    get: function() {
      return undefined;
    },
    configurable: true
  });
}

export {}; // 确保这是一个模块