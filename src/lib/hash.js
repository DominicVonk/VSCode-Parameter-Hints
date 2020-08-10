const crypto = require('sha1');
//const hash = crypto.createHash('sha1')

module.exports = function HashCode(data) {
    //data = hash.update(data, 'utf-8');
    //Creating the hash in the required format
    return crypto(data);
}