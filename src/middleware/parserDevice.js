const UAParser = require('ua-parser-js');

function parseDeviceMiddleware(req, res, next) {
  const userAgent = req.get('User-Agent') || 'Unknown Agent';

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

  const deviceDescription = readableParts.join(' · ') || 'Unknown Device';

  req.deviceDescription = deviceDescription;
  next();
}

module.exports = parseDeviceMiddleware;