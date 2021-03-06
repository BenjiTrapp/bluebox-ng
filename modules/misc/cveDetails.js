/*
  Copyright Jesús Pérez <jesusprubio@gmail.com>

  This code may only be used under the MIT license found at
  https://opensource.org/licenses/MIT.
*/

'use strict';

const baseUrl = 'https://www.cvedetails.com/product-search.php?vendor_id=0&search=';

module.exports.desc = 'Get the URL to CVE Details for a service.';


module.exports.opts = {
  product: {
    desc: 'Product name to use in the search',
    default: 'Asterisk',
  },
};


module.exports.impl = (opts = {}) => Promise.resolve(`${baseUrl}${opts.product}`);
