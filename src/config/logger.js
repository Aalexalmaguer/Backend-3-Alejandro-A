import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from './index.js';

/**
 * Logger centralizado de ShipNow (Winston).
 *
 * Reemplaza el uso desordenado de console.log por un único punto de logging
 * reutilizable desde cualquier módulo. Registra en consola (con color) y en
 * archivos con rotación diaria. El nivel depende del entorno (M1):
 *  - development → muestra desde 'debug'
 *  - production  → registra desde 'info'
 */

// Niveles de menor (más grave) a mayor número (menos grave).
const levels = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5
};

const colors = {
  fatal: 'red bold',
  error: 'red',
  warning: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Nivel máximo a registrar según el entorno.
const level = () => (config.isProduction ? 'info' : 'debug');

// Formato: "2026-08-01 10:12:03 [info]  Mensaje"
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => `${info.timestamp} [${info.level}]  ${info.message}`)
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ level: true }),
  winston.format.printf((info) => `${info.timestamp} [${info.level}]  ${info.message}`)
);

// En entorno de testing el logger no escribe archivos ni ensucia la salida:
// una única consola silenciada. Así los tests quedan limpios y no generan logs/.
const isTest = config.nodeEnv === 'test';

let transports;
if (isTest) {
  transports = [new winston.transports.Console({ format: consoleFormat, silent: true })];
} else {
  // Carpeta de logs (se crea si no existe; está ignorada en .gitignore).
  const LOGS_DIR = path.resolve('logs');
  fs.mkdirSync(LOGS_DIR, { recursive: true });

  // Estrategia de rotación: un archivo por día, máx 5 MB, se conservan 14 días.
  const rotationBase = {
    datePattern: 'YYYY-MM-DD',
    maxSize: '5m',
    maxFiles: '14d',
    zippedArchive: true
  };

  transports = [
    // Consola: útil en desarrollo, con colores.
    new winston.transports.Console({ format: consoleFormat }),

    // Archivo combinado: todos los niveles según el entorno.
    new DailyRotateFile({
      ...rotationBase,
      dirname: LOGS_DIR,
      filename: 'combined-%DATE%.log',
      symlinkName: 'combined.log',
      createSymlink: true,
      format: baseFormat
    }),

    // Archivo de errores: SOLO 'error' y 'fatal' (nunca info ni debug).
    new DailyRotateFile({
      ...rotationBase,
      level: 'error',
      dirname: LOGS_DIR,
      filename: 'error-%DATE%.log',
      symlinkName: 'error.log',
      createSymlink: true,
      format: baseFormat
    })
  ];
}

export const logger = winston.createLogger({
  levels,
  level: level(),
  transports,
  exitOnError: false
});
