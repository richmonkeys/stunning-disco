import { ServerResponse } from 'http'
import LRUCache from 'lru-cache'
import LRU from 'lru-cache'
import { NextApiResponse } from 'next'

class RateLimit {
  private lruCache: LRU<string, any>

  /**
   * Recommended to instantiate a RateLimit object per route, outside the handler
   * @param uniqueTokenPerInterval of unique tokens per interval
   * @param interval ratelimit refresh interval in millisecond (ms)
   * @returns rateLimit object with `.limit` function
   */
  constructor(uniqueTokenPerInterval: number, interval: number) {
    this.lruCache = new LRUCache({ max: uniqueTokenPerInterval, maxAge: interval })
  }

  /**
   * limit the request by token
   * @param res response object to set ratelimit headers
   * @param token cache token, preferably with ip address
   * @param  limit max limit number of requests within the 
   * @returns remaining number of requests allowed
   */
  limit = (res: ServerResponse | NextApiResponse, token: string, limit: number) => {
    const { lruCache } = this
    const tokenCount = lruCache.get(token) || [0]
    if (tokenCount[0] === 0) {
      lruCache.set(token, tokenCount)
    }
    tokenCount[0] += 1

    const used = tokenCount[0]
    const isRateLimited = used >= limit
    const remaining = isRateLimited ? 0 : limit - used
    res.setHeader('X-RateLimit-Limit', limit)
    res.setHeader('X-RateLimit-Remaining', remaining)

    return remaining
  }
}

export default RateLimit