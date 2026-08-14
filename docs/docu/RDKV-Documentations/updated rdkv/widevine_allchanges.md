# Widevine Documentation — Changes Found & Applied

Source reviewed: `widevine-rdk/` (MediaSession.h, MediaSession.cpp, MediaSystem.cpp, HostImplementation.h, HostImplementation.cpp, Policy.h, Module.h, CHANGELOG.md)  
Documentation updated: `widevine.md`  
Review date: 2026-08-14

---

## 1. HostImplementation — Storage Changed from In-Memory to Disk-Backed

**Old behaviour (documented):** `HostImplementation` used a purely in-memory `std::map<std::string, std::string>`; data was process-lifetime and lost on restart.

**New behaviour:** `HostImplementation` is now a write-through cache backed by persistent disk storage rooted at `<PersistentPath>/wv.storage/`.

| New method / member          | Purpose                                                                |
| ---------------------------- | ---------------------------------------------------------------------- |
| `_basepath` (member)         | Root directory for all on-disk DRM files; set via `SetBasePath()`      |
| `SetBasePath(basepath)`      | Called during `Initialize()`; must be called before the CDM is created |
| `readFromeFile(name, data*)` | Reads a named file from `_basepath/name`                               |
| `writeToFile(name, data)`    | Writes a named file to `_basepath/name`                                |

**Read path:** `read()` checks the in-memory cache first; on a miss it reads from disk and populates the cache.  
**Write path:** `write()` updates both the cache and the on-disk file.  
**Remove path:** empty name deletes all files under `_basepath`; wildcard names use `fnmatch()`; specific names remove from cache and disk.

`PreloadFile()` is retained for backward compatibility but is now marked **deprecated** in the header.

**Documentation impact:** Updated the HostImplementation description in the Design section, Internal Modules table, and Configuration Persistence section. Removed the "process-lifetime" statement throughout.

---

## 2. Initialize() — New PersistentPath / SetBasePath Step

`Widevine::Initialize()` now derives a storage base path before creating the CDM:

```
shell->PersistentPath()  →  <path>/wv.storage  →  Core::Directory::CreatePath()  →  _host.SetBasePath()
```

This step occurs before `PreloadFile()` and before `widevine::Cdm::initialize()`.

**Documentation impact:** Updated the initialization description paragraph, both sequence diagrams (component state flow and initialization call flow), and added `_host.SetBasePath()` to the HAL APIs Integration table.

---

## 3. client_info Enriched with Build Date and Architecture

Two new fields are now populated in `widevine::Cdm::ClientInfo` during `Initialize()`:

| Field                    | Value                          | Condition  |
| ------------------------ | ------------------------------ | ---------- |
| `client_info.build_info` | `__DATE__` (compile-time date) | Always     |
| `client_info.arch_name`  | `uname().machine`              | Linux only |

**Documentation impact:** Added both fields to the Key Configuration Parameters table as auto-set read-only rows.

---

## 4. ReadFromPropertiesFile() Helper Replaces Inline Parsing

The old inline loops for reading `/etc/device.properties` values were replaced with a standalone function:

```cpp
std::string ReadFromPropertiesFile(const char* prefix, size_t prefix_len);
```

It handles newline trimming correctly (iterates backward over non-alphanumeric characters). Used for `OPERATOR_NAME`, `MODEL_NUM`, `COBALT_CERT_SCOPE`, and (non-Linux) `DEVICE_NAME`.

**Documentation impact:** Updated the initialization description to reference the helper. No functional change visible externally.

---

## 5. Provisioning Retry Logic (Bug Fix — SWRDKV-5447 / RDKMVE-2505)

**Old behaviour:** One provisioning attempt only when `createSession()` returns `kNeedsDeviceCertificate` (101).

**New behaviour:** An `is_retry_provisioning` flag + `goto retry_provision` label implement a single re-attempt:

```
createSession() → 101
  → provision (attempt 1)
  → createSession() → 101 again?
      → provision (attempt 2)
      → createSession() → still failing? → log + give up
```

Both first-attempt and second-attempt failures are logged unconditionally (not gated on `DEBUG`).

**Documentation impact:** Updated the Device Provisioning bullet in Key Features, and the Provisioning Flow bullet in Implementation Details.

---

## 6. FetchCertificate / Fetch Declarations Added (RDKMVE-2505 Scaffolding)

`MediaSession.h` now declares two new HTTP helper symbols:

```cpp
const int kHttpOk = 200;
constexpr size_t kMaxFetchAttempts = 5;
void FetchCertificate(const std::string&, std::string*);
bool Fetch(const std::string&, const std::string&, std::string*, int*);
```

These are scaffolding for a future HTTP abstraction layer replacing the current `sendPostRequest()` / `curl` inline code. Implementations are not yet in the reviewed source files.

**Documentation impact:** Noted in the Provisioning Flow implementation detail. No call-flow diagrams changed.

---

## 7. UnknownError Key Status Added

`widevineKeyStatusToCString()` gained a `default:` case:

```cpp
default:
    return "UnknownError";
```

This was previously missing; an unrecognized CDM key status would have fallen off the switch with undefined behaviour.

**Documentation impact:** Added `UnknownError` to the Key Status Tracking bullet, the Events Published table (new row), and the Error Handling Strategy bullet.

---

## 8. SVP Secure Buffer Dynamic Reallocation

In `Decrypt()`, if the incoming encrypted sample is larger than the currently allocated secure memory region, the region is released and re-allocated at the new size before decryption proceeds:

```
actualEncDataLength > m_stSecureBuffInfo.SecureMemRegionSize
  → svp_release_secure_buffers()
  → update SecureMemRegionSize
  → svp_allocate_secure_buffers() at new size
```

**Documentation impact:** Added one sentence to the Decrypt Path with SVP bullet in Implementation Details.

---

## 9. DestroyMediaKeySession Double-Free Fix (RDKEVL-7364)

`DestroyMediaKeySession()` now explicitly calls `index->second->Close()` before erasing the session from the map:

```cpp
index->second->Close();   // added
_sessions.erase(index);
```

Previously, `Close()` was only called by the `MediaKeySession` destructor, which could race with CDM event callbacks still referencing the session.

**Documentation impact:** Updated the State / Lifecycle Management bullet in Implementation Details.

---

## 10. onExpirationChange Stub Added for Widevine v18

A new empty override is present in the `WideVine` class for v18:

```cpp
#if (WIDEVINE_VERSION == 18)
virtual void onExpirationChange(const std::string& session_id, int64_t NewExpiration) override {}
#endif
```

**Documentation impact:** None required; covered under the existing multi-version CDM support note.

---

## 11. Debug Flag — How to Enable

Both `MediaSession.cpp` and `MediaSystem.cpp` contain `//#define DEBUG` (commented out). To enable verbose tracing, uncomment the line in the relevant file and rebuild.

Minor inconsistency in the trace prefix format between the two files:

| File               | ENT_WV / EXT_WV format                   |
| ------------------ | ---------------------------------------- |
| `MediaSession.cpp` | `[RDK_LOG:Entering FILE(LINE):FUNCTION]` |
| `MediaSystem.cpp`  | `[RDK_LOG]Entering FILE(LINE)FUNCTION`   |

**Documentation impact:** Updated the Logging & Diagnostics bullet to document how to enable the flag and note the format difference.

---

## Summary Table

| #   | Change                                  | Type          | Ticket(s)                 | Doc Section(s) Updated                                          |
| --- | --------------------------------------- | ------------- | ------------------------- | --------------------------------------------------------------- |
| 1   | HostImplementation disk-backed storage  | Feature       | —                         | Design, Internal Modules, Configuration Persistence             |
| 2   | Initialize() SetBasePath step           | Feature       | —                         | Design, Initialization diagrams, HAL APIs table                 |
| 3   | client_info build_info + arch_name      | Enhancement   | —                         | Key Configuration Parameters table                              |
| 4   | ReadFromPropertiesFile() helper         | Refactor      | —                         | Design (initialization paragraph)                               |
| 5   | Provisioning retry-once logic           | Bug fix       | SWRDKV-5447 / RDKMVE-2505 | Key Features, Implementation Details (Provisioning Flow)        |
| 6   | FetchCertificate / Fetch scaffolding    | Scaffolding   | RDKMVE-2505               | Implementation Details (Provisioning Flow)                      |
| 7   | UnknownError key status default case    | Bug fix       | —                         | Key Features, Events Published, Implementation Details (Errors) |
| 8   | SVP secure buffer dynamic reallocation  | Bug fix       | —                         | Implementation Details (Decrypt Path with SVP)                  |
| 9   | DestroyMediaKeySession double-free fix  | Bug fix       | RDKEVL-7364               | Implementation Details (State / Lifecycle)                      |
| 10  | onExpirationChange stub for v18         | Feature       | RDKMVE-2287               | None (covered by existing multi-version note)                   |
| 11  | Debug flag enable instructions + format | Clarification | —                         | Implementation Details (Logging & Diagnostics)                  |
