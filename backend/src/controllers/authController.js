const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.registerOwner({ name, email, password });
  setAuthCookie(res, token);
  res.status(201).json(new ApiResponse(201, { user, token }, 'Registration successful'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginOwner({ email, password });
  setAuthCookie(res, token);
  res.status(200).json(new ApiResponse(200, { user, token }, 'Login successful'));
});

const googleAuth = asyncHandler(async (req, res) => {
  const { credential, accessToken } = req.body;
  const { user, token, isNewUser } = await authService.googleAuthOwner({ credential, accessToken });
  setAuthCookie(res, token);
  res.status(200).json(
    new ApiResponse(
      200,
      { user, token, isNewUser },
      isNewUser ? 'Google registration successful' : 'Google login successful'
    )
  );
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getOwnerById(req.user._id);
  res.status(200).json(new ApiResponse(200, { user }, 'Owner profile fetched'));
});

module.exports = {
  register,
  login,
  googleAuth,
  logout,
  getMe,
};
