export class DataProvider {
  static generateUniqueUsername(prefix = 'user'): string {
    const timestamp = Date.now(); // milliseconds since epoch
    return `${prefix}${timestamp}${Math.floor(Math.random() * 1000)}`;
  }
}
