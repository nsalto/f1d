import { requireSyncAuth } from '../../utils/auth'

// POST /api/admin/invalidate-cache - Limpia el cache SWR de Nitro (protegido)
//
// Uso:
//   curl -X POST '/api/admin/invalidate-cache?secret=...&prefix=routes'
//   curl -X POST '/api/admin/invalidate-cache?secret=...'  // limpia todo el storage de cache
//
// Cuándo usarlo:
//   - Después de un sync manual cuando querés que los clientes vean los datos nuevos ya
//   - Cuando aplicaste una penalización o corregiste un dato y no querés esperar el TTL
//   - Después de re-importar standings/results
export default defineEventHandler(async (event) => {
  requireSyncAuth(event)

  const query = getQuery(event)
  const prefix = (query.prefix as string | undefined) || ''

  const storage = useStorage('cache')
  const keys = await storage.getKeys(prefix)

  let removed = 0
  for (const key of keys) {
    try {
      await storage.removeItem(key)
      removed++
    } catch {
      // ignorar — la key puede haber expirado entre getKeys y removeItem
    }
  }

  return {
    ok: true,
    prefix: prefix || '(all)',
    keysFound: keys.length,
    keysRemoved: removed,
    timestamp: new Date().toISOString()
  }
})
