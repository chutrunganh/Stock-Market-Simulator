import Joi from 'joi';

// ALWAYS have next() in the last line of the middleware function to pass control to the next 
// middleware or route handler (except for error handling middleware).

// Middleware to validate user input when creating a new user
const userSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Middleware to validate login input - only requires email and password
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Middleware to validate user input when updating an existing user
// Note: For updates, fields should be optional
const userUpdateSchema = Joi.object({
  username: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string()
}).min(1); // At least one field must be provided

export const validateUserUpdate = (req, res, next) => {
  const { error } = userUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};