/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>
            Sergio García <s3rgio.gr@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';


const utils = require('./utils');

const dbg = utils.dbg(__filename);
const logger = require('../bin/utils/logger');


module.exports = (rhosts, map, opts = {}) =>
  new Promise((resolve) => {
    dbg('Starting, options', opts);
    const ups = [];
    let actives = 0;
    let nextHost = opts.rhosts.next();
    let nextPort;
    // Some of our protocols doesn't include passwords, ie: TFTP.
    let hasPort = false;
    if (opts.rports && opts.rports.next) {
      nextPort = opts.rports.next();
      hasPort = true;
    }

    dbg('Starting the interval', { nextHost, nextPort });
    const interval = setInterval(() => {
      if (actives > opts.concurrency) {
        dbg('Too much actives, skipping ...', { actives });
        return;
      }

      if (nextHost.done) {
        // Waiting untill all finish.
        dbg('Hosts finished, waiting for all the requests to finish');
        if (actives === 0) {
          dbg('Done, all finished now, dropping the interval');
          resolve(ups);
          clearInterval(interval);
        }
        return;
      }

      if (hasPort && nextPort.done) {
        dbg('Ports finished, restarting the iterator and increasing the rhosts one');
        // "Restarting" the generator.
        opts.rports.reset();
        nextPort = opts.rports.next();
        // Increasing the user iterator.
        nextHost = opts.rhosts.next();
        return;
      }

      const actualHost = nextHost.value;
      let nextPortValue;
      if (hasPort) { nextPortValue = nextPort.value; }
      const hostPair = [actualHost, nextPortValue];

      dbg('Starting for', hostPair);

      const optsParsed = opts;
      optsParsed.rport = hostPair[1];

      if (hasPort) {
        nextPort = optsParsed.rports.next();
      } else {
        nextHost = optsParsed.rhosts.next();
      }

      let toPrint = hostPair[0];
      if (hasPort) { toPrint = `${toPrint}:${hostPair[1]}`; }

      actives += 1;
      dbg('Sending', opts);
      map(hostPair[0], optsParsed)
      .then((res) => {
        actives -= 1;
        dbg('Response received', { hostPair, status: res.statusCode });

        if (res && res.up) {
          dbg('up', hostPair);
          logger.result(`${toPrint} ${logger.emoji('ok_hand')}`);

          const finalRes = { ip: hostPair[0], data: res.data };

          // To avoid return thinks like ['filename', null] (ie: TFTP brute)
          if (hasPort) { finalRes.port = hostPair[1]; }

          ups.push(finalRes);
        } else {
          logger.info(toPrint);
        }
      })
      // Here we don't want to stop the full chain on errors (ie: ECONNREFUSED)
      .catch(() => {
        actives -= 1;
        logger.info(toPrint);
      });
    }, opts.delay);
  });
