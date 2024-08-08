const csrf = require('csrf');

const csrfProtection = csrf({ cookie: true });

module.exports = csrfProtection;