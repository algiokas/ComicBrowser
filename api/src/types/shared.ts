export interface RunResultExisting {
    changes?: number;
    lastInsertRowid?: number | bigint;
    existingRowId?: number
}

export interface BaseResponse {
    success: boolean,
    error?: string
}