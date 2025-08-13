import mongoose, { ToObjectOptions } from "mongoose";
import { Role } from "./role";
import bcrypt from "bcrypt";

const schemaDefinition = {
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  role: { type: String, enum: Object.values(Role), default: Role.Writer, required: true },
  imageUrl: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    required: true,
  },
  verificationCode: { type: String, required: false },
  verified: { type: Boolean, default: false },
} as const;

const userSchema = new mongoose.Schema(schemaDefinition, {
  toJSON: {
    transform(doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.verificationCode;
    },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const hashed = await bcrypt.hash(this.get("password").trim(), 10);
  this.password = hashed;

  next();
});

const User = mongoose.model("User", userSchema);

export { User };
