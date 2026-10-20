const KEY = 'unit-test-device-id';

/** Anonymous per-browser id so each visitor only sees their own generated tests. */
export function getDeviceId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
