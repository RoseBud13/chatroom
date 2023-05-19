export const generateID = length => {
  return window
    .btoa(
      String.fromCharCode(
        ...window.crypto.getRandomValues(new Uint8Array(length * 2))
      )
    )
    .replace(/[+/]/g, '')
    .substring(0, length);
};
