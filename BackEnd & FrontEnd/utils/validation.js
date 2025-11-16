import Joi from 'joi';

export const emailSchema = Joi.string().email({ tlds: { allow: false } });

export const inviteSchema = Joi.object({
  email: emailSchema.required(),
  roomId: Joi.string().min(3).max(64).required()
});