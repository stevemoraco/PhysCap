import { Request, Response, NextFunction } from 'express';

export function performanceMonitoring(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Capture original end function
  const originalEnd = res.end;

  // Override res.end to measure timing
  res.end = function(chunk?: any, encoding?: any, callback?: any): any {
    const duration = Date.now() - start;

    // Log slow requests
    if (duration > 1000) {
      console.warn(`[SLOW REQUEST] ${req.method} ${req.path} took ${duration}ms`);
    }

    // Add performance header
    res.setHeader('X-Response-Time', `${duration}ms`);

    // Call original end
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
}

export function cacheControl(req: Request, res: Response, next: NextFunction) {
  // Static assets - long cache
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // API routes - no cache
  else if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  // HTML - short cache
  else {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }

  next();
}

export function compressionHeaders(req: Request, res: Response, next: NextFunction) {
  // Add compression hints
  res.setHeader('Vary', 'Accept-Encoding');

  next();
}

// Rate limiting for API endpoints
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    record.count++;
    next();
  };
}

// Request size limiting
export function requestSizeLimit(maxSizeBytes: number = 10 * 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSizeBytes) {
      res.status(413).json({
        error: 'Payload too large',
        maxSize: maxSizeBytes,
      });
      return;
    }

    next();
  };
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60000);
