const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const User = require("../models/user.model");

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || "secretkey"
};

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {

            let user = await User.findById(jwt_payload.id);

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