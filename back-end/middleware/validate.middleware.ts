import type { AnyZodObject } from "zod";

export function validate(schema: AnyZodObject) {
  return (req: any, _res: any, next: any) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const error: any = new Error(result.error.issues.map((issue) => issue.message).join(", "));
      error.statusCode = 400;
      return next(error);
    }

    req.body = result.data.body;
    // Express 5 exposes req.query as a getter; avoid overwriting it.
    // Keep validated values available without mutating req.query/req.params.
    req.validated = result.data;
    return next();
  };
}

