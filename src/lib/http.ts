export type JsonErrorBody = {
  error: string;
  message?: string;
  fields?: unknown;
};

export function jsonError(status: number, code: string, message?: string, fields?: unknown) {
  const body: JsonErrorBody = { error: code };
  if (message) body.message = message;
  if (fields) body.fields = fields;
  return Response.json(body, { status });
}

export function jsonOk(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export const BAD_JSON = Symbol('BAD_JSON');

export async function readJson(req: Request): Promise<unknown | typeof BAD_JSON> {
  try {
    return await req.json();
  } catch {
    return BAD_JSON;
  }
}

export function isForeignKeyViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'sqlState' in error &&
    (error as { sqlState?: unknown }).sqlState === '23503'
  );
}

export function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'sqlState' in error &&
    (error as { sqlState?: unknown }).sqlState === '23505'
  );
}
