import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createUserService } from '../services/userService.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const username = email.split('@')[0]; // Use the part before '@' as username

        // Check if user exists or create a new one
        const user = await createUserService({ username, email, password: null });
        done(null, { ...user, token: accessToken });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

export default passport;