export function getConfigValue(key) {
    const configData = localStorage.getItem('config');
    if (!configData) {
      console.warn('No se encontraron configuraciones en localStorage');
      return null;
    }
  
    try {
      const configArray = JSON.parse(configData);
      const found = configArray.find(item => item.key_value === key);
  
      if (!found) return null;
      if (found.value === 'true') return true;
      if (found.value === 'false') return false;
      return found.value;
      
    } catch (error) {
      console.error('Error parseando configuraciones desde localStorage:', error);
      return null;
    }
  }
  