const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerOwner({ name, email, password });
    setAuthCookie(res, token);
    res.status(201).json(new ApiResponse(201, { user, token }, 'Registration successful'));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginOwner({ email, password });
    setAuthCookie(res, token);
    res.status(200).json(new ApiResponse(200, { user, token }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const { user, token, isNewUser } = await authService.googleAuthOwner(credential);
    setAuthCookie(res, token);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user, token, isNewUser },
          isNewUser ? 'Google registration successful' : 'Google login successful'
        )
      );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getOwnerById(req.user._id);
    res.status(200).json(new ApiResponse(200, { user }, 'Owner profile fetched'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  logout,
  getMe,
};
