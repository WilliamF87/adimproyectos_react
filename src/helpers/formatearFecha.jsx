export const formatearFecha = fecha => {
    // fecha.split('T')[0].split('-'): el formato de fecha (2022-08-26T00:00:00.000Z) presenta problemas con el día,
    // por eso se le aplica el split para tener un formato: ['2022', '08', '26']
    const nuevaFecha = new Date(fecha.split('T')[0].split('-'));

    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    return nuevaFecha.toLocaleDateString('es-ES', opciones);
};