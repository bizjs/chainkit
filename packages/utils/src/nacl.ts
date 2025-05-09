import nacl from 'tweetnacl';

export const naclVerify = nacl.sign.detached.verify;
