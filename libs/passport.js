const crypto = require('crypto'),
    auth = require('./auth');

module.exports = function () {

    function convertPasswordToHash(password) {
        hashed = crypto.randomBytes(Math.ceil(16 / 2))
            .toString('hex')
            .slice(0, 16);
        const key = crypto.pbkdf2Sync(password, 100000, 64, 'sha512');
        let hashObj = {
            hash: key.toString('hex')
        }
        return hashObj;
    }

    function isPasswordValid(password, currentHash) {
        const key = crypto.pbkdf2Sync(password, 100000, 64, 'sha512');
        return key.toString('hex') === currentHash;
    }
}
