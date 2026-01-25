export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
    res: any,
    data: T,
    statusCode: number = 200,
    meta?: Record<string, unknown>
): any {
    const response: ApiResponse<T> = { success: true, data };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
}

export function sendError(
    res: any,
    message: string,
    statusCode: number = 400
): any {
    const response: ApiResponse = { success: false, error: message };
    return res.status(statusCode).json(response);
}

export function parseJsonField<T>(value: string | null | undefined): T {
    if (!value) return [] as T;
    try {
        return JSON.parse(value) as T;
    } catch {
        return [] as T;
    }
}

export function stringifyJsonField<T>(value: T): string {
    return JSON.stringify(value ?? []);
}
