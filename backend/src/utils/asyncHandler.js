/**
 * Wraps an async route handler to catch rejected promises and forward errors to Express next()
 * Eliminates repetitive try-catch blocks across controllers.
 * 
 * @param {Function} fn - Async controller function (req, res, next) => Promise<any>
 * @returns {Function} Express request handler middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
