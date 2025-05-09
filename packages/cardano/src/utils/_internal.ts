export function _message2Hex(message: string) {
  let messageHex = '';
  for (let i = 0, l = message.length; i < l; i++) {
    const charHex = message.charCodeAt(i).toString(16);
    messageHex += charHex;
  }
  return messageHex;
}
