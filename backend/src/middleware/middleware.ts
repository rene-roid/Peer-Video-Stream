import bodyParser from 'body-parser';
import type { Express, Request, Response, NextFunction } from 'express';

function preventCrossSiteScripting(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}
 
export function applyServerHardening(app: Express): void {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.disable('x-powered-by');
  app.use(preventCrossSiteScripting);
}