const { ValidationError } = require("../error");
const { isUnsignedIntegerString } = require("../utils/validation");

class ProfilesServer {
    static uploadAvatar({ id, avatarPath } = {}) {
        if (!isUnsignedIntegerString(id)) {
            throw new ValidationError("Invalid user ID", "id");
        }
        if (typeof avatarPath !== "string") {
            throw new ValidationError("Invalid avatar");
        }
        
    }
}
module.exports = ProfilesServer;