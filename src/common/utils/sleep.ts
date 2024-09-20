export async function sleepMs(milliseconds: number): Promise<void> {
    return await new Promise((r) => setTimeout(r, milliseconds));
}

export async function sleepSec(seconds: number): Promise<void> {
    return await sleepMs(seconds * 1000);
}