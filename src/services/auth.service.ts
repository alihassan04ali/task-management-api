import { User } from '../models/user.model';
import { ApiError } from '../utils/apiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { IUser } from '../types';

interface RegisterInput { name: string; email: string; password: string; role?: 'admin' | 'user'; }
interface LoginInput { email: string; password: string; }
interface AuthTokens { accessToken: string; refreshToken: string; }

export const registerUser = async (input: RegisterInput): Promise<{ user: IUser; tokens: AuthTokens }> => {
  const exists = await User.findOne({ email: input.email.toLowerCase() });
  if (exists) throw ApiError.conflict('Email already registered');

  const user = await User.create(input);
  const tokens = generateTokens(user);
  await saveRefreshToken(user, tokens.refreshToken);

  return { user, tokens };
};

export const loginUser = async (input: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> => {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const match = await user.comparePassword(input.password);
  if (!match) throw ApiError.unauthorized('Invalid email or password');

  const tokens = generateTokens(user);
  await saveRefreshToken(user, tokens.refreshToken);

  return { user, tokens };
};

export const refreshTokens = async (token: string): Promise<AuthTokens> => {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  const tokens = generateTokens(user);
  await saveRefreshToken(user, tokens.refreshToken);
  return tokens;
};

export const logoutUser = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

// ── Helpers ───────────────────────────────────────────────────────
const generateTokens = (user: IUser): AuthTokens => ({
  accessToken: signAccessToken(user._id.toString(), user.role),
  refreshToken: signRefreshToken(user._id.toString(), user.role),
});

const saveRefreshToken = async (user: IUser, token: string): Promise<void> => {
  await User.findByIdAndUpdate(user._id, { refreshToken: token });
};
