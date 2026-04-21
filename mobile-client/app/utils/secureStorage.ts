import * as Keychain from 'react-native-keychain';

const SERVICE = 'angren_taxi';

export async function setSecureItem(key: string, value: string): Promise<void> {
  await Keychain.setGenericPassword(key, value, { service: `${SERVICE}_${key}` });
}

export async function getSecureItem(key: string): Promise<string | null> {
  const result = await Keychain.getGenericPassword({ service: `${SERVICE}_${key}` });
  if (result === false) return null;
  return result.password;
}

export async function deleteSecureItem(key: string): Promise<void> {
  await Keychain.resetGenericPassword({ service: `${SERVICE}_${key}` });
}
