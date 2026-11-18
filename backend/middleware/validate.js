// ============================================================
// Central Request Validation Middleware using Zod
// ============================================================

export const validate = (schema) => (req, res, next) => {
  if (!schema || typeof schema.safeParse !== 'function') {
    return next();
  }
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues?.[0];
    const message = issue?.message || 'Invalid request body.';
    return res.status(400).json({ error: message, code: 'VALIDATION_ERROR' });
  }
  req.body = result.data;
  next();
};

export default validate;

