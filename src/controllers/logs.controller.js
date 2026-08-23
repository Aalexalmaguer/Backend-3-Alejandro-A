import { logger } from '../config/logger.js';

/**
 * Controller de prueba del logger.
 * NO representa una funcionalidad del negocio: es una herramienta interna para
 * verificar rápidamente que todos los niveles del logger funcionan y que los
 * archivos (combinado y de errores) se escriben donde corresponde.
 */
export const logsController = {
  test: (req, res) => {
    logger.debug('Log de prueba nivel DEBUG (solo visible en desarrollo)');
    logger.http('Log de prueba nivel HTTP');
    logger.info('Log de prueba nivel INFO');
    logger.warning('Log de prueba nivel WARNING');
    logger.error('Log de prueba nivel ERROR (va también a error-*.log)');
    logger.fatal('Log de prueba nivel FATAL (va también a error-*.log)');

    res.status(200).json({
      status: 'success',
      message: 'Se generaron logs de prueba en los 6 niveles',
      niveles: ['debug', 'http', 'info', 'warning', 'error', 'fatal'],
      nota: 'Revisá la consola y la carpeta logs/ (combined-*.log y error-*.log)'
    });
  }
};
