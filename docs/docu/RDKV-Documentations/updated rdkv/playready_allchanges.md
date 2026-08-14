# PlayReady Documentation — Changes Found & Applied

Source reviewed: `playready-rdk/` (MediaSession.h, MediaSession.cpp, MediaSessionExt.cpp, MediaSystem.cpp)  
Documentation updated: `playready.md`  
Review date: 2026-08-14

---

## 1. New Feature: Structured Logging (`PR_LOG`)

The biggest addition. The old bare `fprintf(stderr, …)` pattern is replaced by a five-level logging macro throughout all source files.

| Item                            | Detail                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `PR_LOG(level, fmt, ...)` macro | Emits `[PlayReady][LEVEL][func:line] msg` to stderr                                                                  |
| `PRLogLevel` enum               | `ERROR=0`, `WARN=1`, `INFO=2`, `DEBUG=3`, `TRACE=4`                                                                  |
| `g_logLevel` global             | Holds the active level; hardcoded default is `PR_LOG_DEBUG`                                                          |
| `InitializeLogLevel()`          | Called inside `Initialize()`; reads `PLAYREADY_RDK_LOG_LEVEL` env var to override the default                        |
| DRM header trace logging        | DRM header bytes logged at `PR_LOG_TRACE` as a base64 string via `convertToBase64()` helper in `MediaSessionExt.cpp` |

**Documentation impact:**

- New **Runtime Configuration Parameters** table added with `PLAYREADY_RDK_LOG_LEVEL` (integer 0–4, default 3/DEBUG).
- **Logging & Diagnostics** section in _Key Implementation Logic_ rewritten to describe `PR_LOG` levels, `g_logLevel`, `InitializeLogLevel()`, and trace-level DRM header logging.
- `DRM_ERROR_NAME_SUPPORT` entry in the build-time table updated: description now correctly states it controls the `DRM_ERR_NAME(dr)` macro that feeds into `PR_LOG` output.

---

## 2. New Build-Time Flag: `ENABLE_AMBIGUOUS_FIX`

Guards the `extern DRM_CONST_STRING g_dstrDrmPath` declaration in `MediaSystem.cpp`. When enabled, that declaration is suppressed, resolving build errors on platforms where the symbol is already visible in scope via a platform SDK header or a prior definition.

**Documentation impact:** New row added to the **Build-Time Configuration Parameters** table.

---

## 3. Bug Fix: Session Count / Use-After-Free Guard

Two new members added to the `PlayReady` system class:

- `m_sessionCount` — incremented on session creation, decremented on destruction.
- `m_isAppCtxInitialized` — set/cleared by `InitializeAppCtx()` / `UninitializeAppCtx()`.

Both `InitializeAppCtx()` and `UninitializeAppCtx()` now check `m_sessionCount > 0` before resetting `m_poAppContext`, preventing a use-after-free where active `MediaKeySession` instances hold a raw pointer alias to the app context.

**Documentation impact:**

- **Threading Model** section updated with a new _Session Count Guard_ bullet.
- `PlayReady` module description in the **Internal Modules** table updated to mention `m_sessionCount` and `m_isAppCtxInitialized`.

---

## 4. New Class: `SafeCriticalSection`

RAII wrapper for `WPEFramework::Core::CriticalSection`. Acquires the lock on construction, releases on destruction. Provides explicit `unlock()` and `relock()` methods for scopes where the lock must be temporarily dropped. Used uniformly throughout all source files in preference to manual lock/unlock pairs.

**Documentation impact:**

- New `SafeCriticalSection` entry added to the **Synchronization** bullet list in the **Threading Model** section.
- New row added to the **Internal Modules** table.

---

## 5. New: Netflix Key System Detection Path

`CreateMediaKeySession()` and `CreateMediaKeySessionExt()` now detect a Netflix PlayReady key system by checking for the substring `"netflix"` in the key system string (`isNetflixPlayready` flag). Behaviour differs by path:

| Condition                     | Netflix path                       | Non-Netflix path                |
| ----------------------------- | ---------------------------------- | ------------------------------- |
| CDMData passed to constructor | No                                 | Yes                             |
| `initiateChallengeGeneration` | `false` (app drives it)            | `true` (auto-generated)         |
| `InitializeAppCtx()` timing   | Deferred to first session creation | Called during `InitSystemExt()` |

**Documentation impact:** New **Netflix Key System Path** bullet added to **Key Implementation Logic**.

---

## 6. New: Dual Decrypt Context per Key (`__DECRYPT_CONTEXT`)

`__DECRYPT_CONTEXT` struct gained a second field `oDrmDecryptAudioContext` alongside the existing `oDrmDecryptContext`. When `svpIsAudioNeedNonSVPContext()` returns true, a second `ReaderBind` is performed with `OEM_TEE_DECRYPTION_MODE_NOT_SECURE` to populate the audio context. This occurs in `Update()`, `BindKeyNow()`, and `SelectKeyId()`. During `Decrypt()`, the audio context is selected when `useSVP` is false.

**Documentation impact:**

- New `__DECRYPT_CONTEXT` row added to the **Internal Modules** table.
- New **Dual Decrypt Context Binding** bullet added to **Key Implementation Logic**.

---

## 7. New: CBCS Pattern Handling in Decrypt Path

The `encryptedRegionSkip` vector (pattern data forwarded to `Drm_Reader_DecryptOpaque` / `Drm_Reader_DecryptMultipleOpaque`) is now populated conditionally based on scheme:

- **`AesCbc_Cbcs`**: pattern always pushed, even when values are `0:0` (required for audio CBCS tracks).
- **All other schemes**: pattern only pushed when `encrypted_blocks != 0`.

**Documentation impact:** New **CBCS Pattern Handling** bullet added to **Key Implementation Logic**.

---

## 8. New Error Handling Cases

Three new recovery paths added:

| Error code                            | Location                                  | Recovery                                                                                                                                                        |
| ------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DRM_E_NO_URL`                        | `playreadyGenerateKeyRequest()`           | Retries `Drm_LicenseAcq_GenerateChallenge` with URL output parameters set to `nullptr`, allowing challenge generation for content with no embedded license URL. |
| `DRM_E_LICACQ_TOO_MANY_LICENSES`      | `ProcessLicenseResponse()`                | Reallocates the acks array to the required size returned by the first call, then retries `Drm_LicenseAcq_ProcessResponse` once.                                 |
| `DRM_E_DEPRECATED_DEVCERT_READ_ERROR` | `CPRDrmPlatform::DrmPlatformInitialize()` | Retries `Drm_Platform_Initialize` up to `DEVCERT_RETRY_MAX` (4) times with `DEVCERT_WAIT_SECS` (30 s) sleep between attempts.                                   |

**Documentation impact:**

- **Error Handling Strategy** bullet in **Key Implementation Logic** expanded with the three new cases.
- `CPRDrmPlatform` entry in **Internal Modules** updated to mention the devcert retry loop.
