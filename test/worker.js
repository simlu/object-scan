import objectScanReleased from 'object-scan';
import objectScanLocal from '../src/index.js';

import callSignature from './helper/call-signature.js';

process.send('ready');

process.on('message', (msg) => {
  if (msg === 'exit') {
    process.exit(0);
    return;
  }
  const {
    haystack,
    needles,
    useArraySelector,
    reverse,
    orderByNeedles,
    useLocal
  } = msg;
  try {
    const result = callSignature({
      objectScan: useLocal ? objectScanLocal : objectScanReleased,
      haystack,
      needles,
      useArraySelector,
      reverse,
      orderByNeedles
    });
    process.send(result);
  } catch (err) {
    process.send({ error: err.message });
  }
});

process.on('exit', () => {
  process.exit(0);
});
