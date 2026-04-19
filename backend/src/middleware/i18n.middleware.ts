import { Request, Response, NextFunction } from 'express';
import i18next from '../config/i18n';
import { AuthRequest } from './auth.middleware';

export function i18nMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const lang = (req.headers['accept-language'] ?? '').split(',')[0]?.split('-')[0] ?? 'ru';
  const supportedLang = ['ru', 'uz'].includes(lang) ? lang : 'ru';
  req.t = i18next.getFixedT(supportedLang);
  next();
}
