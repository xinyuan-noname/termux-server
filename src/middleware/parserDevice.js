const UAParser = require('ua-parser-js');
const logger = require('../logger');
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {*} next 
 */
function parseDeviceMiddleware(req, res, next) {
  const userAgent = req.get('User-Agent') || 'Unknown Agent';
  let deviceDescription = 'Unknown Device';
  if (userAgent.startsWith('Dart/') && userAgent.includes('(dart:io)')) {
    const requiredHeaders = ['x-client-type', 'x-device-model', 'x-os-version', 'x-app-version'];
    const hasAllHeaders = requiredHeaders.every(h => req.headers[h] != null);

    if (hasAllHeaders && req.headers['x-client-type'] === 'flutter_app') {
      const deviceModel = req.headers['x-device-model'] || 'Unknown Model';
      const osVersion = req.headers['x-os-version']?.trim();
      const appVersion = req.headers['x-app-version']?.trim();

      deviceDescription = [
        'Flutter',
        deviceModel,
        osVersion ? `OS ${osVersion}` : '',
        appVersion ? `v${appVersion}` : ''
      ].filter(Boolean).join(' · ');
    } else {
      logger.warn('疑似伪造头：UA 声称是 Dart/IO，但缺少或无效自定义设备头');
    }
  } else {
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    const browserName = (browser.name || 'Unknown').trim();
    const osName = (os.name || 'Unknown').trim();
    const osVersion = (os.version || '').trim();
    const deviceVendor = (device.vendor || '').trim();
    const deviceModel = (device.model || '').trim();

    const readableParts = [
      browserName,
      osName,
      osVersion,
      [deviceVendor, deviceModel].filter(Boolean).join(' ')
    ].filter(part => part && part !== 'Unknown' && part.trim() !== '');

    deviceDescription = readableParts.join(' · ');
  }

  req.deviceDescription = deviceDescription;
  next();
}

module.exports = parseDeviceMiddleware;