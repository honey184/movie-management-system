const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const User = require("../models/user.model");
const Admin = require("../models/admin.model");

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || "secretkey"
};

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {

            let user;

            if (jwt_payload.role === "admin") {
                user = await Admin.findById(jwt_payload.id);
            } else {
                user = await User.findById(jwt_payload.id);
            }

            if (user) {
                return done(null, user);
            }

            return done(null, false);

        } catch (error) {
            return done(error, false);
        }
    })
);

module.exports = passport;