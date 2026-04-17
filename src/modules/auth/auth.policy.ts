export const authPolicy = {
  session: 15 * 60 * 1000, // 15 min
  refresh: 7 * 24 * 60 * 60 * 1000, // 7 day
  rotationInternal: 24 * 60 * 60 * 1000, // 1 day
  key: 8 * 24 * 60 * 60 * 1000, // 7 day + margem
};

export function computeSessionTokenExpiration() {
  return new Date(Date.now() + authPolicy.session);
}

export function computeRefreshTokenExpiration() {
  return new Date(Date.now() + authPolicy.refresh);
}

export function computeKeyExpiration() {
  return new Date(Date.now() + authPolicy.key);
}
