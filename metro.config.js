const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Block the ESM folder of zustand — Metro should never resolve files inside node_modules/zustand/esm
// Instead we let it fall through to the CJS root which has no import.meta
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (ctx, moduleName, platform) => {
  // Redirect zustand/middleware to its CJS build
  if (moduleName === 'zustand/middleware') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/zustand/middleware.js'),
      type: 'sourceFile',
    };
  }
  if (moduleName === 'zustand') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/zustand/index.js'),
      type: 'sourceFile',
    };
  }
  // For any other zustand subpath (e.g. zustand/react, zustand/vanilla)
  if (moduleName.startsWith('zustand/')) {
    const sub = moduleName.slice('zustand/'.length);
    const cjsPath = path.resolve(__dirname, `node_modules/zustand/${sub}.js`);
    return { filePath: cjsPath, type: 'sourceFile' };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(ctx, moduleName, platform);
  }
  return ctx.resolveRequest(ctx, moduleName, platform);
};

module.exports = config;
