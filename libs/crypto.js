const crypto = require('crypto');

// needs to be exported 
module.exports = function () {

    function convertPasswordToHash(password) {
        salt = crypto.randomBytes(Math.ceil(16 / 2))
            .toString('hex')
            .slice(0, 16);
        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        console.log("SALT 1> ", salt);
        let hashObj = {
            salt: salt,
            hash: key.toString('hex')
        }
        return hashObj;
    }

    function isPasswordValid(password, currentHash, salt) {
        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        return key.toString('hex') === currentHash;
    }
}
