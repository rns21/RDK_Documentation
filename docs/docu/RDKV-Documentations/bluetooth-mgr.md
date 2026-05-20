# Bluetooth_mgr (btr-mgr)

`btr-mgr` is the Bluetooth Manager daemon for RDK middleware. It runs as the process `btMgrBus` and manages all Bluetooth services on the device. It interfaces with the `btr-core` library (which communicates with BlueZ over DBus), and exposes its control API northbound over either IARM Bus or RBus — selected at build time. The daemon manages device discovery, pairing, connection, A/V audio streaming (A2DP), audio capture, HID gamepad connections, Bluetooth Low Energy operations, and a persistent device registry.

At device stack level, `btr-mgr` provides a unified northbound API for other RDK processes and applications to perform all Bluetooth operations without direct knowledge of the BlueZ stack. On startup it waits for `hci0` to become available, calls `BTRMGR_Init()`, signals `systemd` readiness, attempts to auto-connect the last-paired audio output device and gamepads (non-LE mode), and enters a heartbeat loop until `SIGTERM`.

At the module level, the core state machine in `btrMgr.c` drives all device lifecycle, session management, and GLib timer-based retry and hold-off logic. Northbound IARM or RBus method handlers in `src/rpc/` translate IPC calls directly to `BTRMGR_*` API calls. Submodules provide audio stream-out via GStreamer (`btrMgr_streamOut`), audio capture via RMF or ACM (`btrMgr_audioCap`), persistent device storage via cJSON (`btrMgr_persistIface`), system diagnostics (`btrMgr_SysDiag`), LE onboarding (`btrMgr_LEOnboarding`), Columbo diagnostics (`btrMgr_Columbo`), and LE battery service (`btrMgr_batteryService`, LE mode only).

```mermaid
flowchart LR

classDef Apps stroke:#00B9F1,fill:#E6F7FD,stroke-width:2px;
classDef RDKMW stroke:#75D701,fill:#F1FFE6,stroke-width:2px;
classDef VL stroke:#808080,fill:#F2F2F2,stroke-width:2px;

subgraph Apps["Apps & Runtimes"]
    RDKApps["RDK Applications\n(IARM / RBus clients)"]
    HTMLCtrl["btrMgrHTMLControl\n(FastCGI on port 9625)"]
end

subgraph RDKMW["RDK Core Middleware"]
    BTRMGR["btMgrBus\n(bluetooth_mgr daemon)"]
    IARMBUS["IARM Bus"]
    BTRCore["btr-core library\n(BTRCore API)"]
    ACM["audiocapturemgr\n(optional, via IARM)"]
    PowerMgr["wpeframework-powermanager"]
end

subgraph VL["Vendor Layer"]
    BlueZ["bluetoothd (BlueZ)"]
    GST["GStreamer pipeline\n(A2DP stream-out)"]
    RMF["RMF AudioCapture\n(optional)"]
end

RDKApps -->|IARM_Bus_Call / RBus method| IARMBUS
HTMLCtrl -->|IARM_Bus_Call| IARMBUS
IARMBUS --> BTRMGR
BTRMGR -->|BTRCore_* API calls| BTRCore
BTRCore -->|DBus/GDBus| BlueZ
BTRMGR -->|GStreamer pipeline| GST
BTRMGR -->|IARM_Bus_Call| ACM
BTRMGR -->|RMF_AudioCapture_*| RMF
PowerMgr -->|power state events| BTRMGR
```

**Key Features & Responsibilities:**

- **IARM Bus or RBus northbound interface**: Registers all Bluetooth control methods (adapter management, discovery, pairing, connection, streaming, media control, LE operations, system diagnostics) as IARM callable methods or RBus methods, selected at build time via `--enable-rpc` (IARM) or `--enable-rbusrpc` (RBus).
- **A/V audio stream-out**: Manages A2DP stream-out sessions (`btrMgr_streamOut` + `btrMgr_streamOutGst`) via GStreamer 1.x pipelines. On startup attempts auto-reconnection to the last-paired audio output device (`BTRMGR_StartAudioStreamingOut_StartUp`).
- **Audio capture (stream-in)**: Captures audio from external BT sources via either direct RMF AudioCapture (`--enable-ac_rmf`) or via IARM calls to `audiocapturemgr` (`--enable-acm`).
- **HID gamepad management**: On startup connects gamepads (`BTRMGR_ConnectGamepads_StartUp`); tracks HID gamepad enable state and standby mode separately from audio devices.
- **LE/GATT operations and advertising**: Supports GATT property read/write/notify, LE advertisement start/stop, service and characteristic registration, and LE onboarding (Wi-Fi provisioning via ECDH key exchange over GATT).
- **Persistent device registry**: Reads and writes `btmgrPersist.json` to track paired profiles, per-device connection status, last-connected device, and optionally volume/mute (RDKTV build).
- **System diagnostics and Columbo**: `btrMgr_SysDiag` queries device system state (power state, QR code, mesh backhaul status) via IARM or RBus. `btrMgr_Columbo` exposes GATT characteristics for remote diagnostics.
- **LE battery service** (LE mode only): `btrMgr_batteryService` manages periodic battery level polling, OTA firmware update flow, and battery threshold notifications.

---

## Design

`btr-mgr` is designed as a single-process daemon with a GLib main loop for timer-driven operations and separate per-operation GThreads for blocking activities. The core state machine in `btrMgr.c` holds all module handles (`ghBTRCoreHdl`, `ghBTRMgrPiHdl`, `ghBTRMgrSdHdl`, streaming handle, discovery handles) as process-global statics and uses GLib timeout sources (volatile `guint` timer references) for retry logic, hold-off delays, and deferred state transitions. Northbound IPC (IARM or RBus) is separated into `src/rpc/` files which act as thin pass-through layers that validate initialization state and forward calls to `BTRMGR_*` functions.

Northbound interaction is over IARM Bus (`BTRMgr_BeginIARMMode()` registers IARM calls and connects to the bus) or RBus (`BTRMgr_BeginRBUSMode()`) depending on the build. Southbound interaction is through direct C API calls to the `libbtrCore` library (`BTRCore_Init`, `BTRCore_StartDiscovery`, `BTRCore_PairDevice`, `BTRCore_ConnectDevice`, etc.) and optionally to GStreamer APIs for audio and to `librmfAudioCapture` or IARM calls to `audiocapturemgr` for audio capture.

IPC mechanisms in use: IARM Bus for northbound (IARM build) and for calling `audiocapturemgr`; RBus for northbound (RBus build) and for system diagnostics queries; GLib main loop timer sources for all deferred and retry operations internal to the daemon; GLib GThreads for blocking connection/authentication operations.

Data persistence: `btrMgr_persistIface` reads and writes `btmgrPersist.json` using `libcjson`. The file is stored at `/opt/lib/bluetooth/btmgrPersist.json` when that directory is accessible, otherwise at `/opt/secure/lib/bluetooth/btmgrPersist.json`. It stores adapter ID, profile list, per-device connection status, last-connected device, and optionally persisted volume/mute values (`RDKTV_PERSIST_VOLUME` build flag).

```mermaid
graph TD

subgraph Proc["btMgrBus process (C)"]
    Main["btrMgr_main.c\nmain / hci0 wait / signal loop"]
    RPC_IARM["btmgr_iarm_internal_interface.c\nIARM method handlers"]
    RPC_RBUS["btmgr_rbus_internal_interface.c\nRBus method handlers"]
    ExtIfce["btmgr_iarm_external_interface.c /\nbtmgr_rbus_external_interface.c\nClient-side BTRMGR_* wrapper API"]
    Core["btrMgr.c\nCore state machine\nGLib timer / device state"]
    SOut["btrMgr_streamOut +\nbtrMgr_streamOutGst\nA2DP GStreamer pipeline"]
    ACap["btrMgr_audioCap\nAudio capture (RMF or ACM)"]
    PersIf["btrMgr_persistIface\nbtmgrPersist.json (cJSON)"]
    SysDiag["btrMgr_SysDiag\nPower state / system info"]
    LEOnbrd["btrMgr_LEOnboarding\nWi-Fi provisioning via GATT"]
    Columbo["btrMgr_Columbo\nGATT diagnostics"]
    Battery["btrMgr_batteryService\n(LE mode only)"]
    GMainLoop["btrMgr_g_main_loop_Task\n(GThread, GLib main loop)"]
    AuthThread["btrMgr_incoming_auth_thread\n(GThread, per request)"]
    ReconnThread["btrMgr_reconnect_thread\n(GThread, per reconnect)"]
end

BTRCoreLib[("libbtrCore")]
IARMBus[("IARM Bus")]
RBusDaemon[("RBus daemon")]
GstPipeline[("GStreamer pipeline")]
PersistFile[("btmgrPersist.json")]

Main --> Core
RPC_IARM --> Core
RPC_RBUS --> Core
Core --> SOut
Core --> ACap
Core --> PersIf
Core --> SysDiag
Core --> LEOnbrd
Core --> Columbo
Core --> Battery
Core --> GMainLoop
Core --> AuthThread
Core --> ReconnThread
Core --> BTRCoreLib
SOut --> GstPipeline
PersIf --> PersistFile
RPC_IARM --> IARMBus
RPC_RBUS --> RBusDaemon
ACap --> IARMBus
SysDiag --> IARMBus
SysDiag --> RBusDaemon
```

### Threading Model

- **Threading Architecture**: Multi-threaded; GLib-based threads around a GLib main loop.
- **Main Thread**: Waits for `hci0` to come up (`hciconfig hci0` polled up to `BT_HCI0_TIMEOUT = 30` seconds), calls `BTRMGR_Init()`, starts IPC mode, then loops on `sleep(10)` until `gbExitBTRMgr = true` on `SIGTERM`.
- **Worker Threads**:
  - _`btrMgr_g_main_loop_Task`_ (`GThread`): Runs `g_main_loop_run()` on `gmainContext`. Processes all GLib timeout sources (retry timers, hold-off timers, deferred state change timers) registered by the core state machine.
  - _`btrMgr_incoming_auth_thread`_ (`GThread`, created per incoming connection/auth event): Handles incoming pairing/authentication requests from `btrCore_BTDeviceConnectionIntimationCb` or `btrCore_BTDeviceAuthenticationCb`. Protected by `gBtrMgrAuthMutex` (GMutex).
  - _`btrMgr_reconnect_thread`_ (`GThread`, created per reconnect operation): Executes reconnection logic for devices after transient disconnections; uses `BTRMGR_ConnectionInformation_t` as thread data.
- **Synchronization**: `GMutex gBtrMgrAuthMutex` for serializing incoming auth thread creation. GLib atomic operations for volatile `guint` timer reference tracking. No explicit mutex around the global device state arrays (marked as `TODO` in source).
- **Async / Event Dispatch**: `btr-core` status callbacks (device status, media status, discovery, connection intimation/auth) are received in the `btrCore` OutTask thread and dispatched synchronously into `btrMgr.c` handler functions, which then post GLib timeout sources to the GLib main loop thread for deferred processing or create per-operation GThreads for blocking operations.

### Prerequisites & Dependencies

**Documentation Verification Checklist:**

- [x] **Thunder / WPEFramework APIs**: No `IPlugin`, `JSONRPC`, or `Exchange` implementation found in this component. `wpeframework-powermanager.service` is a systemd dependency only; power state is queried via `PowerController` API or IARM.
- [x] **IARM Bus**: `IARM_Bus_Init`, `IARM_Bus_Connect`, `IARM_Bus_RegisterCall`, `IARM_Bus_RegisterEventHandler`, `IARM_Bus_BroadcastEvent` are used in `btmgr_iarm_internal_interface.c` and `btmgr_iarm_external_interface.c`.
- [x] **Device Services (DS) APIs**: No DS API calls found. Bluetooth hardware is accessed exclusively through the `libbtrCore` library.
- [x] **Persistent store**: `btrMgr_persistIface.c` reads and writes `/opt/lib/bluetooth/btmgrPersist.json` or `/opt/secure/lib/bluetooth/btmgrPersist.json` using `libcjson`.
- [x] **Systemd services**: `After=` and `Requires=` entries verified in `conf/btmgr.service`: `iarmbusd.service`, `bluetooth.service`, `audiocapturemgr.service`, `wpeframework-powermanager.service`.
- [x] **Configuration files**: No static runtime config files parsed. RFC parameters queried via `rfcapi.h` (excluded in `BUILD_FOR_PI` builds).

### RDK-V Platform and Integration Requirements

- **WPEFramework Version**: Not applicable — no Thunder plugin implementation. `wpeframework-powermanager.service` is a systemd runtime dependency only.
- **Build Dependencies**: C toolchain; autoconf >= 2.69, automake, libtool; `libbtrCore` (required); `glib-2.0 >= 2.24.0`; `gthread-2.0 >= 2.24.0`; `libcjson >= 1.0`; optional `gstreamer-1.0 >= 1.4` + `gstreamer-base-1.0` (`--enable-gstreamer1`); optional `librmfAudioCapture` (`--enable-ac_rmf`); optional `audiocapturemgr_iarm.h` + IARM libs (`--enable-acm`); optional `libsystemd` (`--enable-systemd-notify`); `libsafec` or stub; `librbus` (`--enable-rbusrpc`); `libecdhlib` for LE onboarding; `libcurl`, `libcjson`, `liburlHelper` for SysDiag/LEOnboarding IARM builds.
- **Plugin Dependencies**: None (no Thunder plugin).
- **Device Services / HAL**: `libbtrCore` must be present and BlueZ `bluetoothd` must be running. HCI adapter (`hci0`) must be up.
- **IARM Bus**: Bus name `BTRMgrBus`; IARM method names defined in `btmgr_iarm_interface.h`. Subscribes to events from `audiocapturemgr` bus.
- **Systemd Services**: `iarmbusd.service`, `bluetooth.service` (BlueZ), `audiocapturemgr.service`, and `wpeframework-powermanager.service` must all be running before `btmgr.service` starts.
- **Configuration Files**: `btmgrPersist.json` (read/write at runtime, path resolved dynamically). RDK logger config at `/etc/debug.ini` or `/opt/debug.ini` (override).
- **Startup Order**: Systemd `After=` / `Requires=` in `conf/btmgr.service` enforces startup order. The daemon additionally polls `hciconfig hci0` for up to `BT_HCI0_TIMEOUT = 30` seconds before proceeding.
- **Optional build flags**:
  - `--enable-rpc` → `IARM_RPC_ENABLED`: northbound IARM interface.
  - `--enable-rbusrpc` → northbound RBus interface.
  - `--enable-leonly` → `LE_MODE`: disables audio streaming; enables battery service.
  - `--enable-ac_rmf` → direct RMF AudioCapture for audio-in.
  - `--enable-acm` → IARM calls to `audiocapturemgr` for audio-in.
  - `--enable-gstreamer1` → GStreamer 1.x for A2DP stream-out.
  - `--enable-systemd-notify` → `ENABLE_SD_NOTIFY`: systemd `sd_notify` readiness signaling (`Type=notify` in service file).

---

### Component State Flow

#### Initialization to Active State

```mermaid
sequenceDiagram
    participant systemd as systemd
    participant Main as btrMgr_main.c
    participant Core as btrMgr.c (BTRMGR_Init)
    participant IARM as IARM Bus
    participant BTRCore as libbtrCore

    systemd->>Main: ExecStart /usr/bin/btMgrBus
    Main->>Main: poll hciconfig hci0 (up to 30s)
    Main->>Core: BTRMGR_Init()
    Core->>BTRCore: BTRCore_Init(&ghBTRCoreHdl)
    BTRCore-->>Core: handle + adapter list
    Core->>BTRCore: BTRCore_RegisterAgent()
    Core->>Core: g_thread_new("btrMgr_g_main_loop_Task")
    Core->>Core: Read btmgrPersist.json (btrMgr_PI_Init)
    Core->>Core: BTRMgr_SD_Init (SysDiag)
    Core-->>Main: BTRMGR_RESULT_SUCCESS

    Main->>IARM: BTRMgr_BeginIARMMode() — IARM_Bus_Init + Connect + RegisterCall(s)
    Main->>Main: sd_notify(READY=1)
    Main->>Core: BTRMGR_StartAudioStreamingOut_StartUp(0, AUDIO_OUTPUT)
    Main->>Core: BTRMGR_ConnectGamepads_StartUp(0, HID)
    Main->>Main: loop sleep(10) until SIGTERM

    systemd->>Main: SIGTERM
    Main->>Core: BTRMGR_DeInit()
    Core->>BTRCore: BTRCore_DeInit()
    Main->>IARM: BTRMgr_TermIARMMode()
```

#### Runtime State Changes

**State Change Triggers:**

- Discovery start/stop changes `ghBTRMgrDiscoveryHdl.m_disStatus` through `BTRMGR_DISCOVERY_ST_STARTED` → `BTRMGR_DISCOVERY_ST_STOPPED`. A `BTRMGR_DISCOVERY_HOLD_OFF_TIME = 120` second hold-off prevents immediate restart.
- Device pairing completion posts `BTRMGR_EVENT_DEVICE_PAIRING_COMPLETE` or `BTRMGR_EVENT_DEVICE_PAIRING_FAILED` to the registered `BTRMGR_EventCallback`. Pairing is retried up to `BTRMGR_PAIR_RETRY_ATTEMPTS = 10` times.
- Connection completion posts `BTRMGR_EVENT_DEVICE_CONNECTION_COMPLETE` or `BTRMGR_EVENT_DEVICE_CONNECTION_FAILED`. Auto-reconnect is attempted up to `BTMGR_RECONNECTION_ATTEMPTS = 3` times after a hold-off of `BTMGR_RECONNECTION_HOLD_OFF = 3` seconds.
- `BTRMGR_EVENT_DEVICE_OUT_OF_RANGE` is fired when a connected device is lost; a `BTRMGR_POST_OUT_OF_RANGE_HOLD_OFF_TIME = 6` second GLib timer guards against flapping.
- AVDTP suspend causes a stream restart retry up to `BTMGR_AVDTP_SUSPEND_MAX_RETRIES = 3` times before giving up.

**Context Switching Scenarios:**

- Power state changes from `wpeframework-powermanager` (received via `PowerController` or IARM) cause discovery to be paused/resumed and streaming sessions to be stopped/restarted depending on device type.
- LE mode (`--enable-leonly`) completely removes all audio streaming code paths and substitutes LE battery service and cellular modem state checks in the init and reconnect flows.
- RFC parameter changes via `rfcapi.h` affect audio-in service state and HID gamepad enable state at runtime.

---

### Call Flows

#### Initialization Call Flow

```mermaid
sequenceDiagram
    participant Main as btrMgr_main.c
    participant IARMInt as btmgr_iarm_internal_interface.c
    participant Core as btrMgr.c
    participant PI as btrMgr_persistIface.c
    participant BTRCore as libbtrCore

    Main->>Core: BTRMGR_Init()
    Core->>BTRCore: BTRCore_Init()
    Core->>BTRCore: BTRCore_GetListOfAdapters()
    Core->>BTRCore: BTRCore_RegisterAgent()
    Core->>PI: BTRMgr_PI_Init() — read btmgrPersist.json
    Core->>Core: g_thread_new("btrMgr_g_main_loop_Task")
    Core->>BTRCore: BTRCore_RegisterForDeviceFoundCb / StatusCb / MediaStatusCb / ConnIntimCb / ConnAuthCb
    Core-->>Main: BTRMGR_RESULT_SUCCESS
    Main->>IARMInt: BTRMgr_BeginIARMMode()
    IARMInt->>IARMInt: IARM_Bus_Init("BTRMgrBus") + Connect()
    IARMInt->>IARMInt: IARM_Bus_RegisterCall(GetNumberOfAdapters, PairDevice, ConnectToDevice, ...)
    IARMInt->>IARMInt: BTRMGR_Init() [internal] — link callback
```

#### Request Processing Call Flow

```mermaid
sequenceDiagram
    participant Client as IARM / RBus Client
    participant IARMInt as btmgr_iarm_internal_interface.c
    participant Core as btrMgr.c
    participant BTRCore as libbtrCore
    participant EventCb as BTRMGR_EventCallback

    Client->>IARMInt: IARM_Bus_Call("BTRMgrBus", "ConnectToDevice", payload)
    IARMInt->>Core: BTRMGR_ConnectToDevice(adapterIdx, deviceHandle, opType)
    Core->>BTRCore: BTRCore_ConnectDevice(ghBTRCoreHdl, devId, devType)
    BTRCore-->>Core: enBTRCoreSuccess
    Note over Core: GLib timer set for connection status check
    BTRCore->>Core: fPtr_BTRCore_StatusCb(enBTRCoreDevStConnected)
    Core->>Core: update ghBTRMgrDevHdlLastConnected, write btmgrPersist.json
    Core->>EventCb: BTRMGR_EVENT_DEVICE_CONNECTION_COMPLETE
    IARMInt->>IARMInt: btrMgr_EventCallback → IARM_Bus_BroadcastEvent(BTRMGR_IARM_EVENT_DEVICE_CONNECTION_COMPLETE)
    IARM-->>Client: event payload
```

---

## Internal Modules

| Module / Class | Description | Key Files |
| --- | --- | --- |
| `btrMgr_main` | Process entry point. Polls `hci0` readiness, calls `BTRMGR_Init()`, starts IARM or RBus IPC mode, starts audio/gamepad auto-connect (non-LE mode), runs heartbeat loop, calls `BTRMGR_DeInit()` on `SIGTERM`. | [src/main/btrMgr_main.c](src/main/btrMgr_main.c) |
| `btrMgr` (core interface) | Core Bluetooth state machine. Holds all module handles, GLib timer references, device and streaming state. Implements all `BTRMGR_*` public API functions, registers `btr-core` callbacks, and manages GLib main loop and per-operation threads. | [src/ifce/btrMgr.c](src/ifce/btrMgr.c), [include/btmgr.h](include/btmgr.h) |
| `btmgr_iarm_internal_interface` | IARM northbound handler. Registers all Bluetooth control methods as IARM callable functions and translates IARM calls to `BTRMGR_*` API calls. Broadcasts `BTRMGR_Events_t` events over IARM. Selected by `--enable-rpc`. | [src/rpc/btmgr_iarm_internal_interface.c](src/rpc/btmgr_iarm_internal_interface.c) |
| `btmgr_iarm_external_interface` | IARM client-side wrapper API (`BTRMGR_Init`, `BTRMGR_GetNumberOfAdapters`, etc.). Used by other processes to interact with `btr-mgr` via IARM without knowing bus internals. Registers IARM event handlers for device and media events. | [src/rpc/btmgr_iarm_external_interface.c](src/rpc/btmgr_iarm_external_interface.c) |
| `btmgr_rbus_internal_interface` | RBus northbound handler. Registers Bluetooth control methods and properties on the RBus data model. Selected by `--enable-rbusrpc`. | [src/rpc/btmgr_rbus_internal_interface.c](src/rpc/btmgr_rbus_internal_interface.c) |
| `btmgr_rbus_external_interface` | RBus client-side wrapper API. Provides `BTRMGR_*` public API backed by RBus method invocations. | [src/rpc/btmgr_rbus_external_interface.c](src/rpc/btmgr_rbus_external_interface.c) |
| `btrMgr_streamOut` + `btrMgr_streamOutGst` | A2DP audio stream-out. `btrMgr_streamOut.c` provides generic streaming state and callback management. `btrMgr_streamOutGst.c` implements the GStreamer 1.x pipeline for encoding and streaming PCM to A2DP sink. | [src/streamOut/btrMgr_streamOut.c](src/streamOut/btrMgr_streamOut.c), [src/streamOut/btrMgr_streamOutGst.c](src/streamOut/btrMgr_streamOutGst.c) |
| `btrMgr_audioCap` | Audio capture (stream-in) abstraction. Captures audio from an external BT audio source device. Backed by either direct RMF AudioCapture library (`USE_AC_RMF`) or by IARM calls to `audiocapturemgr` (`USE_ACM`). | [src/audioCap/btrMgr_audioCap.c](src/audioCap/btrMgr_audioCap.c) |
| `btrMgr_persistIface` | Persistent device and profile registry using `libcjson`. Reads/writes `btmgrPersist.json`. Stores adapter ID, paired profile/device lists, last-connected device, connection status, and (RDKTV) volume/mute. | [src/persistIf/btrMgr_persistIface.c](src/persistIf/btrMgr_persistIface.c), [include/persistIf/btrMgr_persistIface.h](include/persistIf/btrMgr_persistIface.h) |
| `btrMgr_SysDiag` | System diagnostics. Queries device power state via `PowerController`, QR code, and mesh backhaul status via IARM (`sysMgr`) or RBus (`syscfg`). Responds to `SysDiagInfo` IARM/RBus calls. | [src/sysDiag/btrMgr_SysDiag.c](src/sysDiag/btrMgr_SysDiag.c) |
| `btrMgr_LEOnboarding` | Wi-Fi provisioning over GATT. Exposes GATT characteristics for SSID list, public key, Wi-Fi config, and provision status. Uses ECDH (`libecdhlib`) for key exchange. | [src/leOnboarding/btrMgr_LEOnboarding.c](src/leOnboarding/btrMgr_LEOnboarding.c) |
| `btrMgr_Columbo` | GATT-based diagnostics interface (Columbo UUID: `64d9f574-7756-4ebc-9ebe-ed5f7f2871ab`). Exposes start/stop/status/report characteristics for remote diagnostic triggering. | [src/columbo/](src/columbo/) |
| `btrMgr_batteryService` | LE battery service (LE mode only). Manages periodic battery level polling, connection/reconnection to battery devices, GATT start-notify, and OTA firmware update flow for LE devices. | [src/batteryService/](src/batteryService/) |

---

## Component Interactions

### Interaction Matrix

| Target Component / Layer | Interaction Purpose | Key APIs / Topics |
| --- | --- | --- |
| **RDK-E Plugins** | | |
| `wpeframework-powermanager` | Receive power state change events to pause/resume BT operations (discovery, streaming). | `PowerController` API (IARM or direct library) |
| **Device Services / HAL** | | |
| `libbtrCore` | All Bluetooth operations — adapter control, device discovery, pairing, connection, A/V media sessions, LE/GATT. | `BTRCore_Init`, `BTRCore_StartDiscovery`, `BTRCore_PairDevice`, `BTRCore_ConnectDevice`, `BTRCore_GetMediaTrackInfo`, `BtrCore_LE_PerformGattOp`, etc. |
| RMF AudioCapture | Direct audio capture from BT audio source device (when `USE_AC_RMF` build flag set). | `RMF_AudioCapture_Open`, `RMF_AudioCapture_Start`, `RMF_AudioCapture_Stop`, `RMF_AudioCapture_Close` |
| GStreamer | A2DP audio stream-out pipeline management. | GStreamer 1.x element pipeline in `btrMgr_streamOutGst.c` |
| **IARM Bus** | | |
| `audiocapturemgr` | Audio-in capture control when built with `--enable-acm`. | `IARM_Bus_Call(audiocapturemgr, open/start/stop/close, ...)` |
| `sysMgr` | System diagnostics queries (device info, network status). | `IARM_Bus_Call(sysMgr, ...)` |
| **External Systems** | | |
| RFC (`rfcapi.h`) | Query RFC parameters for audio-in service enable state and HID gamepad enable state. | `getRFCParameter()` |

### Events Published

| Event Name | IARM / RBus Topic | Trigger Condition | Subscriber Components |
| --- | --- | --- | --- |
| `BTRMGR_EVENT_DEVICE_DISCOVERY_UPDATE` | IARM event on bus `BTRMgrBus` | Device found or updated during active scan | IARM clients that register event handlers |
| `BTRMGR_EVENT_DEVICE_PAIRING_COMPLETE` / `_FAILED` | IARM event on bus `BTRMgrBus` | Pairing operation completes or fails | IARM clients |
| `BTRMGR_EVENT_DEVICE_CONNECTION_COMPLETE` / `_FAILED` | IARM event on bus `BTRMgrBus` | Connection operation completes or fails | IARM clients |
| `BTRMGR_EVENT_DEVICE_DISCONNECT_COMPLETE` | IARM event on bus `BTRMgrBus` | Device disconnects | IARM clients |
| `BTRMGR_EVENT_MEDIA_TRACK_*` | IARM event on bus `BTRMgrBus` | AVRCP track state change (started, playing, paused, stopped, changed, position) | IARM clients |
| `BTRMGR_EVENT_MEDIA_PLAYER_*` | IARM event on bus `BTRMgrBus` | AVRCP player property change (name, volume, delay, equalizer, shuffle, repeat) | IARM clients |
| `BTRMGR_EVENT_RECEIVED_EXTERNAL_PAIR_REQUEST` | IARM event on bus `BTRMgrBus` | Incoming pairing request from a remote device | IARM clients |
| `BTRMGR_EVENT_BATTERY_INFO` | IARM event on bus `BTRMgrBus` | Battery level update from a connected LE device | IARM clients |
| `BTRMGR_EVENT_DEVICE_OUT_OF_RANGE` | IARM event on bus `BTRMgrBus` | Connected device goes out of range | IARM clients |

### IPC Flow Patterns

**Primary Request / Response Flow:**

```mermaid
sequenceDiagram
    participant Client as IARM Client Application
    participant IARM as IARM Bus
    participant IARMInt as btmgr_iarm_internal_interface.c
    participant Core as btrMgr.c
    participant BTRCore as libbtrCore

    Client->>IARM: IARM_Bus_Call("BTRMgrBus", method, payload)
    IARM->>IARMInt: Dispatch to registered handler
    IARMInt->>Core: BTRMGR_*(params)
    Core->>BTRCore: BTRCore_*(ghBTRCoreHdl, ...)
    BTRCore-->>Core: result
    Core-->>IARMInt: BTRMGR_RESULT_SUCCESS / FAILURE
    IARMInt-->>IARM: IARM_RESULT_SUCCESS with populated payload
    IARM-->>Client: Call return
```

**Event Notification Flow:**

```mermaid
sequenceDiagram
    participant BTRCore as libbtrCore (OutTask)
    participant Core as btrMgr.c
    participant GLibLoop as btrMgr_g_main_loop_Task
    participant IARMInt as btrMgr_EventCallback
    participant IARM as IARM Bus
    participant Client as IARM Client

    BTRCore->>Core: fPtr_BTRCore_StatusCb(stBTRCoreDevStatusCBInfo)
    Core->>GLibLoop: g_timeout_add() — deferred state change
    GLibLoop->>Core: timer fires → process state, update persist
    Core->>IARMInt: gfpcBBTRMgrEventOut(BTRMGR_EventMessage_t)
    IARMInt->>IARM: IARM_Bus_BroadcastEvent("BTRMgrBus", eventId, payload)
    IARM-->>Client: event callback with payload
```

---

## Implementation Details

### Major HAL APIs Integration

This component does not call Device Services (DS) HAL APIs directly. All BT hardware operations go through `libbtrCore`. The audio streaming pipeline uses GStreamer.

| API / Library | Purpose | Implementation File |
| --- | --- | --- |
| `BTRCore_Init` / `BTRCore_DeInit` | Initialize and teardown the btr-core library and BlueZ DBus connection. | [src/ifce/btrMgr.c](src/ifce/btrMgr.c) |
| `BTRCore_StartDiscovery` / `BTRCore_StopDiscovery` | Start and stop BT device scanning. | [src/ifce/btrMgr.c](src/ifce/btrMgr.c) |
| `BTRCore_PairDevice` / `BTRCore_UnPairDevice` | Pair and unpair a BT device. | [src/ifce/btrMgr.c](src/ifce/btrMgr.c) |
| `BTRCore_ConnectDevice` / `BTRCore_DisconnectDevice` | Connect and disconnect a paired device. | [src/ifce/btrMgr.c](src/ifce/btrMgr.c) |
| `BTRCore_GetMediaTrackInfo` / `BTRCore_MediaControl` | AVRCP media track queries and playback control. | [src/ifce/btrMgr.c](src/ifce/btrMgr.c) |
| `BtrCore_LE_PerformGattOp` / `BTRCore_LE_GetGattProperty` | GATT read/write/notify operations for LE devices. | [src/ifce/btrMgr.c](src/ifce/btrMgr.c) |
| `BTRCore_LE_StartAdvertisement` / `BTRCore_LE_StopAdvertisement` | LE advertisement registration and release. | [src/ifce/btrMgr.c](src/ifce/btrMgr.c) |
| `RMF_AudioCapture_Open/Start/Stop/Close` | Direct audio capture from BT source (when `USE_AC_RMF` is set). | [src/audioCap/btrMgr_audioCap.c](src/audioCap/btrMgr_audioCap.c) |

### Key Implementation Logic

- **State / Lifecycle Management**:
  - Device handle tracking uses a set of per-role global device handles: `ghBTRMgrDevHdlLastConnected`, `ghBTRMgrDevHdlCurStreaming`, `ghBTRMgrDevHdlLastPaired`, `ghBTRMgrDevHdlConnInProgress`, etc., all in [src/ifce/btrMgr.c](src/ifce/btrMgr.c).
  - Connection retry (`BTRMGR_CONNECT_RETRY_ATTEMPTS = 2`), pairing retry (`BTRMGR_PAIR_RETRY_ATTEMPTS = 10`), and modalias retry (`BTRMGR_MODALIAS_RETRY_ATTEMPTS = 5`) are driven by GLib timeout sources.
  - Auto-connect on startup: `BTRMGR_AUTOCONNECT_ON_STARTUP_TIMEOUT = 40` seconds GLib timer guards the startup audio reconnection sequence.

- **Event Processing**:
  - `btr-core` calls `btrMgr.c` status callbacks synchronously. The callback sets a GLib timeout source (typically 0 or short delay) to process the event in the GLib main loop thread, updating device state and then calling `gfpcBBTRMgrEventOut` to deliver the `BTRMGR_EventMessage_t` to the registered listener (IARM or RBus interface layer).
  - Background discovery (`ghBTRMgrBgDiscoveryHdl`) runs concurrently with foreground discovery (`ghBTRMgrDiscoveryHdl`) for specific device types.

- **Error Handling Strategy**:
  - `BTRMGR_Result_t` return codes: `BTRMGR_RESULT_SUCCESS (0)`, `BTRMGR_RESULT_GENERIC_FAILURE (-1)`, `BTRMGR_RESULT_INVALID_INPUT (-2)`, `BTRMGR_RESULT_INIT_FAILED (-3)`.
  - IARM handlers return `IARM_RESULT_INVALID_STATE` when called before `BTRMGR_Init()` completes.
  - AVDTP suspend events trigger a stream restart; after `BTMGR_AVDTP_SUSPEND_MAX_RETRIES = 3` failures the stream is abandoned.

- **Logging & Diagnostics**:
  - `RDK_LOGGER_BTMGR_NAME` = `"LOG.RDK.BTRMGR"` and `RDK_LOGGER_BTCORE_NAME` = `"LOG.RDK.BTRCORE"` are the RDK logger module names.
  - Debug artifacts are written to `BTRMGR_DEBUG_DIRECTORY = "/tmp/btrMgr_DebugArtifacts"` when `gDebugModeEnabled` is set.
  - Telemetry events are reported via `bt-telemetry.c` wrappers (same library as `btr-core`).

---

## Configuration

### Key Configuration Files

| Configuration File | Purpose | Override Mechanism |
| --- | --- | --- |
| `/opt/lib/bluetooth/btmgrPersist.json` | Primary persistent storage. Stores adapter ID, profile list, per-device connection status, last-connected device, beacon detection setting, and optionally volume/mute. | Written by `btrMgr_persistIface.c` at runtime. Path falls back to `/opt/secure/lib/bluetooth/btmgrPersist.json` if `/opt/lib/bluetooth/` is not accessible. |
| `/etc/debug.ini` | RDK logger configuration. | Overridden by `/opt/debug.ini` if present. |

### Key Configuration Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `BTRMGR_DEVICE_COUNT_MAX` | `int` macro | `32` | Maximum number of paired devices tracked. Defined in [include/btmgr.h](include/btmgr.h). |
| `BTRMGR_DISCOVERED_DEVICE_COUNT_MAX` | `int` macro | `128` | Maximum number of concurrently scanned devices. Defined in [include/btmgr.h](include/btmgr.h). |
| `BTRMGR_PAIR_RETRY_ATTEMPTS` | `int` constant | `10` | Maximum pairing retry attempts. Defined in [src/ifce/btrMgr.c](src/ifce/btrMgr.c). |
| `BTRMGR_CONNECT_RETRY_ATTEMPTS` | `int` constant | `2` | Maximum connection retry attempts per request. Defined in [src/ifce/btrMgr.c](src/ifce/btrMgr.c). |
| `BTMGR_RECONNECTION_ATTEMPTS` | `int` constant | `3` | Maximum automatic reconnection attempts. Defined in [src/ifce/btrMgr.c](src/ifce/btrMgr.c). |
| `BTMGR_RECONNECTION_HOLD_OFF` | `int` constant | `3` | Seconds to wait before attempting auto-reconnect. Defined in [src/ifce/btrMgr.c](src/ifce/btrMgr.c). |
| `BTRMGR_DISCOVERY_HOLD_OFF_TIME` | `int` constant | `120` | Seconds of hold-off after discovery stops before it can restart. Defined in [src/ifce/btrMgr.c](src/ifce/btrMgr.c). |
| `BTRMGR_AUTOCONNECT_ON_STARTUP_TIMEOUT` | `int` constant | `40` | Seconds allowed for startup auto-connect sequence. Defined in [src/ifce/btrMgr.c](src/ifce/btrMgr.c). |
| `BTMGR_AVDTP_SUSPEND_MAX_RETRIES` | `int` constant | `3` | Maximum AVDTP suspend restart retries before stream is abandoned. Defined in [src/ifce/btrMgr.c](src/ifce/btrMgr.c). |
| `BT_HCI0_TIMEOUT` | `int` constant | `30` | Maximum seconds to wait for `hci0` to be up at startup. Defined in [src/main/btrMgr_main.c](src/main/btrMgr_main.c). |
| `BTRMGR_MAX_PERSISTENT_DEVICE_COUNT` | `int` macro | `5` | Max devices stored per profile in persist file. Defined in [include/persistIf/btrMgr_persistIface.h](include/persistIf/btrMgr_persistIface.h). |
| `BTRMGR_MAX_PERSISTENT_PROFILE_COUNT` | `int` macro | `5` | Max profiles stored in persist file. Defined in [include/persistIf/btrMgr_persistIface.h](include/persistIf/btrMgr_persistIface.h). |

### Runtime Configuration

Runtime behavior changes are applied through IARM or RBus method calls:

```bash
# Example: change adapter discoverable state
IARM_Bus_Call("BTRMgrBus", "SetAdapterDiscoverable", payload)

# Example: start audio streaming out
IARM_Bus_Call("BTRMgrBus", "StartAudioStreamingOut", payload)

# Example: perform LE GATT operation
IARM_Bus_Call("BTRMgrBus", "PerformLeOp", payload)
```

RFC parameters (queried via `rfcapi.h`) control audio-in service state and HID gamepad enable at runtime without daemon restart.

### Configuration Persistence

The following are persisted in `btmgrPersist.json` across reboots by `btrMgr_persistIface.c`:
- Adapter ID
- Per-profile paired device list (up to `BTRMGR_MAX_PERSISTENT_PROFILE_COUNT = 5` profiles, `BTRMGR_MAX_PERSISTENT_DEVICE_COUNT = 5` devices each)
- Per-device connection status and last-connected flag
- Beacon detection limit setting
- Volume and mute values (only when built with `RDKTV_PERSIST_VOLUME`)

All other runtime state (discovery results, current streaming session, active connection) is not persisted and is re-established after a restart.
