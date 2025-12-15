const timestamp = () => new Date().toISOString();

export const log = (...args: any[]) => console.log(timestamp(), ...args);
export const error = (...args: any[]) => console.error(timestamp(), ...args);
