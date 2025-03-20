export function isTokenExpired() {
    const loginTime = localStorage.getItem('loginTime');
    
    if (!loginTime) {
        console.log('No se encontró la hora de inicio de sesión');
        return true;  // Si no hay registro de la hora de inicio, consideramos que ha expirado
    }
    
    const loginDate = new Date(loginTime);  // Convertir la hora almacenada a un objeto Date
    const currentDate = new Date();  // Obtener la fecha y hora actual
    
    const timeDifference = currentDate - loginDate;  // Diferencia en milisegundos
    const hoursElapsed = timeDifference / (1000 * 60 * 60);  // Convertir la diferencia a horas
    
    
    if (hoursElapsed >= 12) {
        return true;  // El token ha expirado si han pasado 12 horas o más
    }
    
    return false;  // El token sigue siendo válido si han pasado menos de 12 horas
}
