/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const mapper = require('../../../lib/mapper');
const map = require('../../../lib/protocols/sip').map;
const optsMap = require('../../../cfg/commonOpts/map');
const optsSip = require('../../../cfg/commonOpts/sip');
const utils = require('../../../lib/utils');


const optsComm = {};
utils.defaultsDeep(optsComm, optsMap, optsSip);
optsComm.rports.default = [5060, 5061];
// It's better to scan with an OPTIONS request (commonly less restricted)
optsComm.meth.default = 'OPTIONS';
// TODO: Confirm a good limit here.
// optsComm.concurrency.default = proto.concurrency;

module.exports.desc = 'SIP service mapper.';


module.exports.opts = optsComm;


module.exports.impl = (opts = {}) => mapper(opts.rhosts, map, opts);
