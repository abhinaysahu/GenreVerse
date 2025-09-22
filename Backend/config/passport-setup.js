const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user"); // You'll create this user model next

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Check if user already exists in your database
      User.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          // User is already registered
          done(null, currentUser);
        } else {
          // Create a new user
          new User({
            username: profile.displayName,
            googleId: profile.id,
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
            });
        }
      });
    }
  )
);
