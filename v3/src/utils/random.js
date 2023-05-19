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

export function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
