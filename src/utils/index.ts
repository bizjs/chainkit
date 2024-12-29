// tslint:disable-next-line
import * as nacl from 'tweetnacl';

export function toLowerCase(str: string) {
  return String(str || '').toLowerCase();
}

export function safeParseJSON(jsonStr: string, fallbackVal = null) {
  try {
    return JSON.parse(jsonStr);
  } catch (ex) {
    return fallbackVal;
  }
}

/**
 * The function alias nacl.sign.detached.verify, to verify message.
 */
export const naclSignDetachedVerify = nacl.sign.detached.verify;
