export function fileReader() {
  const fetchJson = async url => {
    try {
      const data = await fetch(url);
      const response = await data.json();
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  return { fetchJson };
}
