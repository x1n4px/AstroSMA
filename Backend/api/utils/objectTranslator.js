function translateObjectKeys(originalObject, keyMap) {
    return Object.keys(originalObject).reduce((newObject, key) => {
      const newKey = keyMap[key] || key; // Si hay traducción, úsala; si no, mantén la original.
      newObject[newKey] = originalObject[key];
      return newObject;
    }, {});
  }
  
  module.exports = { translateObjectKeys };