'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://localhost/ul-packing-list';

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-List';

exports.PORT = process.env.PORT || 8080;
                       
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

exports.JWT_SECRET = process.env.JWT_SECRET;
 
