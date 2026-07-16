import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Express middleware to validate incoming request bodies against a Zod schema.
 * Returns a standardized JSON validation error envelope if validation fails.
 * 
 * @param schema Zod validation schema
 */
export function validateSchema(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Input validation failed.',
            details: err.errors.map(e => ({
              field: e.path.join('.'),
              issue: e.message
            }))
          }
        });
      }
      next(err);
    }
  };
}
