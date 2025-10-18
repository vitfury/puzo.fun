# API Development Checklist

## ⚠️ CRITICAL: API Path Convention

### Frontend (TypeScript)
```typescript
// ✅ CORRECT - apiClient baseURL already includes /api/v1
apiClient.get('/activities/today')        // → /api/v1/activities/today
apiClient.post('/auth/login', data)       // → /api/v1/auth/login

// ❌ WRONG - Double v1 prefix
apiClient.get('/v1/activities/today')     // → /api/v1/v1/activities/today ❌
```

**Rule:** Never include `/v1/` in API method paths - it's already in baseURL!

### Backend (Laravel)
```php
// ✅ CORRECT - routes/api.php already wrapped in Route::prefix('v1')
Route::get('/activities/today', ...)     // → /api/v1/activities/today

// ❌ WRONG - Double v1 prefix
Route::get('/v1/activities/today', ...)  // → /api/v1/v1/activities/today ❌
```

**Rule:** Never include `/v1/` in route definitions - it's in the prefix!

## Quick Reference

**Frontend API Client:**
- Location: `frontend/src/api/client.ts`
- Base URL: `http://localhost/api/v1`
- Auth: Bearer token from localStorage

**Backend Routes:**
- Location: `backend/routes/api.php`
- Wrapper: `Route::prefix('v1')->name('v1.')->group(...)`
- Protected: `auth:sanctum` middleware

## Common Mistakes to Avoid
1. ❌ Adding `/v1/` to frontend API calls
2. ❌ Adding `/v1/` to backend route definitions
3. ❌ Forgetting to check network tab for 404s with double `/v1/v1/`
4. ❌ Not using auth:sanctum for protected endpoints

## Testing Checklist
- [ ] Check network tab - verify URL is `/api/v1/endpoint` not `/api/v1/v1/endpoint`
- [ ] Test with curl to confirm backend route
- [ ] Verify Bearer token in Authorization header
- [ ] Check CORS headers if requests fail
