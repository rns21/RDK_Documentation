# RDK-WanManager Documentation

## 1. Overview

- **Purpose in RDK‑B Stack**: RDK‑WanManager (aka `wanmanager`) coordinates WAN interfaces on RDK‑B devices. It manages interface discovery and configuration, runs selection/failover policies, processes WebConfig blobs, handles DHCP client events, and exposes TR‑181 management interfaces so other middleware and cloud services can observe and configure WAN behavior.
- **Key Features & Responsibilities**:
  - Manage multiple WAN interfaces and virtual sub‑interfaces (CPEInterface table).
  - Implement WAN selection and failover policies (AutoWAN, parallel scan, primary/secondary policies).
  - Provide TR‑181 data model (see `config/RdkWanManager.xml`) and DML APIs for interface and DHCP configuration.
  - Handle WebConfig msgpack blobs to apply WAN configuration and marking rules.
  - Act as the glue between CCSP/Message Bus (DBus), WebConfig framework, DHCP client processes (udhcpc), sysevents and lower‑level platform/network utilities.
  - Expose IPC entry points for other components and runs an internal IPC server.
- **Role in Broadband Router Architecture**: Positioned in the middleware layer. It consumes TR‑181 configuration and WebConfig inputs, translates them into interface state machine actions, configures the DHCP client, and signals other components via message bus and sysevents. It enforces failover/selection policies and maintains operational status exposed via TR‑181.

## 2. Architecture / Design

### 2.1 High‑Level Design Principles

- Single process (systemd service) deployed as `wanmanager` that owns WAN decision logic and the DML glue.
- Modular internal components separated by responsibility: Core lifecycle, Data model (DML), Interface state machines, IPC, DHCP handler, WebConfig blob handler and policy implementations.
- Use existing platform message bus (CCSP/DBus) and WebConfig APIs for integration; avoid reinventing IPC protocols.
- Keep TR‑181 accurate and authoritative for configuration; operations are reflected back into the DML and persisted via existing CCSP mechanisms.

### 2.2 Component Boundaries & Responsibilities

- Process boundary: The `wanmanager` binary runs as a single system process managed by systemd.
- It talks to other components over:
  - CCSP Message Bus / DBus (component registration and parameter APIs)
  - WebConfig framework (msgpack blob → applies configuration)
  - SysEvent (publish/subscribe lightweight events)
  - Local IPC (internal clients) via `ipc_msg` based server
  - External helper processes (e.g., `udhcpc` for DHCP)

Detailed boundary responsibilities:
- TR‑181 DML (in `config/RdkWanManager.xml`) — canonical configuration schema and function mappings.
- WanMgr Core (`wanmgr_core.c`) — lifecycle init/start/finalise.
- Data layer (`wanmgr_data.*`) — in‑memory model of interfaces, groups, virtual interfaces and marking tables.
- Interface State Machine (`wanmgr_interface_sm.*`) — per‑interface state machine handling operational status and transitions.
- Policy controller (`wanmgr_controller.*`, `wanmgr_policy_*.c`) — selection/failover logic.
- DHCP handlers (`wanmgr_dhcpv4_apis.*`, `wanmgr_dhcpv6_*`) — process DHCP client events and expose DHCP DML APIs.
- WebConfig handler (`wanmgr_webconfig_*.c`) — parse msgpack blobs and apply configuration (markings, interface properties).
- SSP / Message Bus integration (`wanmgr_ssp_*.c`) — component registration, bus callbacks and CCD/MBI glue.

### 2.3 Threading Model (if applicable)

- `wanmanager` is single process with multiple internal threads handled by the core and DML frameworks. WebConfig blob callbacks and the core start path may execute in separate threads driven by the platform frameworks. The code relies on explicit locking helpers (see `wanmgr_data.h` functions like `WanMgr_GetConfigData_locked`) to protect shared data.

### 2.4 C4 System Context Diagram

```mermaid
graph TD
  classDef user fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
  classDef component fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
  classDef external fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;

  User[👤 Administrator / Cloud Controller]:::user
  WebUI[🌐 Web UI / WebConfig]:::external
  MessageBus[(CCSP Message Bus / DBus)]:::external
  SysEvent[(sysevent)]:::external
  Platform[(Platform / HAL)]:::external

  subgraph "RDK‑B Middleware (systemd)"
    WanManager[📦 RDK‑WanManager]:::component
  end

  User -->|Config / Ops| WebUI
  WebUI -->|msgpack blob (WebConfig)| WanManager
  WanManager -->|DBus CCSP parameter APIs| MessageBus
  WanManager -->|sysevent publish| SysEvent
  WanManager -->|Platform APIs / net utils| Platform
  WanManager -->|logs / telemetry| User
```

### 2.5 C4 Container Diagram

```mermaid
graph TD
  subgraph "Runtime: RDK‑B / systemd"
    subgraph "wanmanager process"
      Core[WanMgr Core]
      IPC[IPC Server (ipc_msg)]
      DML[TR‑181 DML Layer]
      IfSM[Interface State Machines]
      DHCP[DHCP Handler (udhcpc integration)]
      WebCfg[WebConfig Blob Handler]
      Policies[Policy Implementations (AutoWan, Parallel Scan, Failover)]
      Telemetry[T2 Telemetry & T2 Sender]
    end

    subgraph "External Services"
      MessageBus[(CCSP Message Bus / DBus)]
      SysEvent[(sysevent)]
      DHCPClient[(udhcpc / DHCP agent)]
    end
  end

  WebCfg -->|msgpack| DML
  DML -->|update/read| IfSM
  IfSM -->|notify| Policies
  IfSM -->|invoke| DHCP
  Core -->|start/stop| IfSM
  Core -->|register| MessageBus
  Core -->|publish| SysEvent
  Policies -->|configure| DML
```

### 2.6 Design Explanation & Request Flow

- Request Flow Sequence (high‑level): Web UI / cloud issues configuration → WebConfig framework builds msgpack blob → `WanMgr_Process_Webconfig_Request` (in `wanmgr_webconfig_apis.c`) parses the msgpack, populates `WanMgr_WebConfig_t`, and maps to DML entries via helpers like `WanIf_SetParam*`/`Marking_SetParam*` which in turn call TR‑181/DML APIs and add table rows with `CcspCcMbi_AddTblRow`. The code commits changes with `Marking_Commit` to persist config.
- Technology Stack: C (system components), CCSP/DBus messaging stack, msgpack for WebConfig blobs, udhcpc for DHCP, systemd for process management, sysevent for lightweight events.

## 3. Internal Modules

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| Core | Lifecycle init/start/finalise and orchestrates startup | `wanmgr_core.c`, `wanmgr_main.c` |
| Data Model (DML) | In‑memory representation of WAN interfaces, VLANs, markings and groups | `wanmgr_data.h`, `wanmgr_data.c`, `TR-181/` files |
| Interface State Machine | Per‑interface state machine handling operational transitions and actions | `wanmgr_interface_sm.c`, `wanmgr_interface_sm.h` |
| IPC Server | Local IPC server to receive control commands | `wanmgr_ipc.c`, `wanmgr_ipc.h` |
| DHCP Handler | Handles DHCPv4/IPv6 events and exposes DML APIs for DHCP clients | `wanmgr_dhcpv4_apis.c`, `wanmgr_dhcpv6_*` |
| WebConfig | WebConfig blob parsing and apply logic (msgpack -> DML) | `wanmgr_webconfig.c`, `wanmgr_webconfig_apis.c` |
| Policies | Implementations for selection, failover and auto‑wan policies | `wanmgr_controller.h`, `wanmgr_policy_*.c` (e.g. `wanmgr_policy_auto_impl.c`, `wanmgr_policy_pp_impl.c`) |
| SSP / MessageBus | Component registration and CCSP/MBI callback wiring | `wanmgr_ssp_action.c`, `wanmgr_ssp_messagebus_interface.c`, `wanmgr_ssp_internal.h` |
| Utilities & Platform | Networking utilities, telemetry, sysevent helpers | `wanmgr_net_utils.c`, `wanmgr_utils.c`, `wanmgr_sysevents.c`, `wanmgr_telemetry.c` |

### 3.1 Module Breakdown Diagram

```mermaid
flowchart TD
  subgraph "RDK‑WanManager (process)"
    Data[Data Model (wanmgr_data.c)]
    IfSM[Interface State Machines]
    DHCP[DHCP Handler]
    WebCfg[WebConfig Handler]
    Policies[Policies (selection/failover)]
    IPC[IPC Server]
    SSP[SSP / Message Bus]
  end

  WebCfg --> Data
  Data --> IfSM
  IfSM --> DHCP
  IfSM --> Policies
  Policies --> Data
  IPC --> Core[WanMgr Core]
  SSP --> Core
```

## 4. Interaction with Other Middleware Components

| Component | Purpose of Interaction | Protocols/Mechanisms |
|-----------|-----------------------|----------------------|
| CCSP Message Bus | Component registration; TR‑181 parameter get/set callbacks; event registration | DBus / CCSP BaseIf (CcspBaseIf_SetCallback) |
| WebConfig Framework | Receives/manage configuration blobs, triggers apply callbacks | msgpack blob via WebConfig framework (`WanMgr_Process_Webconfig_Request`) |
| SysEvent | Publish/subscribe for lightweight system events | sysevent APIs (sysevent) |
| DHCP Client (udhcpc) | External DHCP client process invoked or managed; DHCP events processed | udhcpc, IPC/handler functions (`wanmgr_dhcpv4_apis.c`) |
| Cellular Manager | (optional) retrieves IP information for cellular interfaces | internal update functions such as `WanMgr_UpdateIpFromCellularMgr` |

### 4.1 Middleware Interaction Diagram

```mermaid
flowchart TD
  WebConfig -->|msgpack blob| WanManager
  WanManager -->|DBus TR‑181 APIs| CCSP[(CCSP/MessageBus)]
  WanManager -->|sysevent publish| SysEvent[(sysevent)]
  WanManager -->|exec/monitor| udhcpc[(udhcpc DHCP client)]
```

## 5. Interaction with Other Layers

- HAL: Platform specific network bring‑up/tear‑down and hardware info is used by `wanmgr_net_utils.*` and lower layer helpers.
- Platform: systemd service, sysctl/netlink helpers, and persistent storage for component state.
- External: Cloud/controller or local Web UI via WebConfig; these provide configuration blobs and expect TR‑181 reflect the current state.

| Layer/Service | Interaction Description | Mechanism |
|---------------|-------------------------|----------|
| HAL | Platform network control and link status | netutils, ioctl/netlink (via `wanmgr_net_utils`)
| Platform | Process lifecycle, logging, telemetry | systemd, `/etc/debug.ini`, T2 telemetry
| External | Web UI / Cloud configuration | WebConfig msgpack blobs, TR‑181 reads/writes

### 5.1 Layered Architecture View

```mermaid
graph TD
  HAL[(HAL / Kernel)] --> WanManager[📦 RDK‑WanManager]
  WanManager --> Platform[(Platform / systemd / udhcpc)]
  Platform --> External[(Web UI / Cloud)]
```

## 6. IPC Mechanism

- **Type of IPC**: Multiple mechanisms used:
  - CCSP/Message Bus (DBus) for TR‑181 and component registration.
  - Local IPC server implemented with `ipc_msg` (see `wanmgr_ipc.c` / `wanmgr_ipc.h`) to serve local clients.
  - WebConfig uses msgpack blobs and callback hooks.
  - SysEvent for events.
- **Message Format**: TR‑181 parameters and DML calls use CCSP conventions. WebConfig uses msgpack formatted blobs. Local IPC uses `ipc_msg` (custom struct in the codebase).
- **Flow**: Synchronous TR‑181 get/set calls via message bus; asynchronous WebConfig apply (callback) that parses blob and commits changes; local clients can call into IPC server for forced actions (e.g., `Wan_ForceRenewDhcpIPv6`, `WanMgr_SetInterfaceStatus`).

### 6.1 IPC Flow Diagram

```mermaid
sequenceDiagram
    participant Web as WebConfig
    participant WM as RDK-WanManager
    participant DML as TR-181/DML layer
    participant MB as CCSP_MessageBus

    Web->>WM: WebConfig blob (msgpack)
    WM->>WM: WanMgr_Process_Webconfig_Request (parse)
    WM->>DML: Marking / WanIf set calls (Marking_SetParam*, WanIf_*SetParam*)
    DML-->>MB: CcspCcMbi_AddTblRow / commit
    DML-->>WM: Commit result
    WM-->>Web: Apply result (BLOB_EXEC_SUCCESS / FAILURE)
```

## 7. TR‑181 Data Models

- **Implemented Parameters**: The TR‑181 model is defined in `config/RdkWanManager.xml`. Key objects and parameters include:
  - `X_RDK_WanManager` object
    - `Enable` (boolean)
    - `Data` (string)
    - `Policy` (mapped uint32 — e.g., AUTOWAN_MODE(6))
    - `ResetActiveInterface` (boolean)
    - `AllowRemoteInterfaces` (boolean)
    - `WanFailoverData` (string)
  - `X_RDK_WanManager.DnsConnectivityCheck.Enable` (boolean)
  - `X_RDK_WanManager.CPEInterface` (dynamicTable; maxInstance 128) — contains:
    - `EnableOperStatusMonitor` (bool)
    - `ConfigureWanEnable` (bool)
    - `EnableCustomConfig` (bool)
    - `CustomConfigPath` (string)
    - `Name` / `DisplayName`
    - Sub‑objects: `Phy`, `Wan`, `IP`, `PPP` with many config/operational parameters (Enable, Type, OperationalStatus, IPv4Status, IPv6Status, etc.)

- **Parameter Registration**: TR‑181 functions are wired via the DML registration. In `RdkWanManager.xml` the named callbacks are (examples):
  - `WanManager_GetParamUlongValue`, `WanManager_SetParamUlongValue`, `WanManager_GetParamStringValue`, `WanManager_SetParamStringValue`, `WanManager_GetParamBoolValue`, `WanManager_SetParamBoolValue`, `WanManager_Validate`, `WanManager_Commit` at the `X_RDK_WanManager` root.
  - Table callbacks for `CPEInterface` like `WanIf_GetEntryCount`, `WanIf_GetEntry`, `WanIf_GetParamStringValue`, `WanIf_SetParamStringValue`, `WanIf_Validate`, `WanIf_Commit`, `WanIf_Rollback`.

- **Custom Extensions**: `X_RDK_*` namespace provides RDK extensions such as `WanFailoverData`, custom marking tables and other RDK specific configuration fields.

### 7.1 TR‑181 Parameter Table (sample)

| Parameter | Description | Access (R/W) | Default | Notes |
|-----------|-------------|--------------|---------|-------|
| `X_RDK_WanManager.Enable` | Master enable for wanmanager features | R/W | true | Controls component behavior |
| `X_RDK_WanManager.Policy` | Selection policy enum | R/W | AUTOWAN_MODE (6) | Mapped uint values defined in XML |
| `X_RDK_WanManager.CPEInterface.{i}.Wan.Enable` | Per‑interface enable | R/W | true/false | governs interface availability |
| `X_RDK_WanManager.CPEInterface.{i}.IP.IPv4Status` | IPv4 operational status | R/W | Up/Down | reflects current IP stack status |

## 8. Implementation Details

- **Key Algorithms or Logic**:
  - Interface selection and failover handled by the policy controller (`wanmgr_controller.h` / `wanmgr_policy_*.c`). It tracks `WanMgr_Policy_Controller_t` state including selected interface indices and timeouts.
  - Per‑interface state machines manage operational probes, DHCP client integration and marking table enforcement.
  - WebConfig blob apply algorithm: parse msgpack → map entries to existing DML entries (match by `Name`) → update existing marking entries or add table rows via `CcspCcMbi_AddTblRow` → commit marking entries.
- **Error Handling Strategy**:
  - Return ANSC_STATUS codes across API boundaries. WebConfig apply returns `BLOB_EXEC_SUCCESS` / `BLOB_EXEC_FAILURE` and includes a rollback stub for future extension (`WanMgr_WanData_Rollback_Handler`).
  - Logging via `CcspTrace*` macros across modules.
- **Logging & Debugging**:
  - Uses `rdk_logger_init("/etc/debug.ini")` to initialize logging (see `wanmgr_main.c`).
  - Runtime pid file: `/var/tmp/wanmanager.pid` is created on startup. WebConfig creates `/tmp/wanmanager_initialized` to mark successful initialization.

## 9. Key Configuration Files

| Configuration File | Purpose | Key Parameters | Default Values | Override Mechanisms |
|--------------------|---------|----------------|----------------|---------------------|
| `config/RdkWanManager.xml` | TR‑181 data model definition | Parameter names & function callback names | N/A | Build/config macros (see file header) |
| `config/RdkWanManager_v2.xml` | Alternative/extended TR‑181 model | Additional objects | N/A | N/A |
| `msg_daemon.cfg` (message bus config) | Message bus configuration file referenced by SSP | Bus endpoints | N/A | system runtime config |
| `/etc/debug.ini` | Logging configuration | Trace levels | Platform defaults | Replace file contents |

## 10. API Endpoints (if applicable)

- The component does not expose HTTP endpoints itself; it exposes TR‑181 DML APIs and local IPC functions. Key programmatic APIs (C functions / exported symbols) include:

Public lifecycle & core APIs

- `ANSC_STATUS WanMgr_Core_Init(void)` — initialize internal core structures (`wanmgr_core.c`)
- `ANSC_STATUS WanMgr_Core_Start(void)` — start main processing loop
- `ANSC_STATUS WanMgr_Core_Finalise(void)` — shutdown/cleanup

Policy / controller APIs

- `ANSC_STATUS WanController_Init_StateMachine(void)`
- `ANSC_STATUS WanMgr_Controller_PolicyCtrlInit(WanMgr_Policy_Controller_t* pWanPolicyCtrl)`
- `ANSC_STATUS WanMgr_Policy_AutoWan(void)`
- `ANSC_STATUS WanMgr_Policy_AutoWanPolicy(void)`

IPC / control APIs

- `ANSC_STATUS WanMgr_StartIpcServer()` — start IPC server to handle clients (`wanmgr_ipc.c`)
- `ANSC_STATUS Wan_ForceRenewDhcpIPv6(char * ifName)` — force DHCPv6 renew
- `ANSC_STATUS WanMgr_SetInterfaceStatus(char *ifName, wanmgr_iface_status_t state)` — set interface state

DHCP & DML APIs (examples)

- `ANSC_STATUS wanmgr_handle_dhcpv4_event_data(DML_VIRTUAL_IFACE* pVirtIf)` — process DHCPv4 events
- `ANSC_STATUS IPCPStateChangeHandler (DML_VIRTUAL_IFACE* pVirtIf)` — IPCP state changes for PPP/IPv6
- `ANSC_STATUS WanMgr_DmlDhcpInit(ANSC_HANDLE hDml, PANSC_HANDLE phContext)` — DHCP DML init
- Multiple DML list/get/set functions: `WanMgr_DmlDhcpcGetNumberOfEntries`, `WanMgr_DmlDhcpcGetEntry`, `WanMgr_DmlDhcpcSetCfg`, `WanMgr_DmlDhcpcRenew`, etc. (see `wanmgr_dhcpv4_apis.h`)

SSP / MessageBus APIs (component callbacks)

- `ANSC_STATUS ssp_Mbi_MessageBusEngage(char* component_id, char* config_file, char* path)`
- `int ssp_Mbi_Initialize(void* user_data)`
- `int ssp_Mbi_Finalize(void* user_data)`
- `int ssp_Mbi_Buscheck(void* user_data)`
- `int ssp_Mbi_FreeResources(int priority, void* user_data)`

DML callbacks named in `RdkWanManager.xml` (examples):

- `WanManager_GetParamUlongValue`
- `WanManager_SetParamUlongValue`
- `WanIf_GetEntryCount`, `WanIf_GetEntry`, `WanIf_GetParamStringValue`, `WanIf_SetParamStringValue`, `WanIf_Commit` (see `wanmgr_data.h` and TR‑181 XML)

## 11. Deployment & Runtime Environment

- **Container Runtime**: Typically runs on bare RDK‑B image under systemd. Deployed as a system service `wanmanager`.
- **Orchestration**: systemd unit (platform packaging) manages the process.
- **Resource Requirements**: Small system process — typical embedded requirements (low MBs of RAM). Specific CPU/memory depend on telemetry and feature flags.
- **Supported Platforms**: RDK‑B targets (Linux / Board specific network stacks). Source contains board specific ML support under `TR‑181/board_*` directories.
- **Startup Parameters**: `wanmanager` accepts `-c` to run in foreground (non‑daemon) and `-subsys <prefix>` to set component prefix (see `wanmgr_main.c`).

## 12. Monitoring & Security

- **Monitoring**:
  - Telemetry hooks (T2) via `wanmgr_t2_telemetry.c` and `wanmgr_telemetry.c` when `ENABLE_FEATURE_TELEMETRY2_0` is enabled.
  - Logs via `rdk_logger` and `CcspTrace*` macros; PID file `/var/tmp/wanmanager.pid` created.
- **Authentication & Authorization**: Uses CCSP/MessageBus security model (component registration) and system capabilities management code attempts to drop root caps in `wanmgr_main.c`.
- **Auditing & Compliance**: Uses existing RDK logging & telemetry; no special GDPR/HIPAA features embedded in component code itself.

## 13. Validation & Review Checklist

- [x] **Deployment Accuracy**: Process boundary accurately represented (single systemd process).
- [x] **Communication Specificity**: Protocols labeled (DBus/CCSP, msgpack/WebConfig, ipc_msg, sysevent).
- [x] **Scaling Representation**: `CPEInterface` table supports multiple instances; marking entries are per‑interface.
- [x] **Technology Versions**: Source uses C + RDK CCSP frameworks; specific lib versions come from platform build system.
- [x] **Implementation Details**: Filenames and function names included above.
- [x] **Visual Hierarchy**: Mermaid diagrams use classDef and subgraphs to distinguish runtimes/components.
- [x] **Protocol Labels**: Connection labels include formats (msgpack, DBus) and purposes.
- [x] **Mermaid Syntax**: Diagrams use `graph`, `flowchart` and `sequenceDiagram` variants; verify in MkDocs with Mermaid plugin.
- [x] **TR‑181 Coverage**: Key parameters and DML callbacks from `config/RdkWanManager.xml` are documented.
- [x] **Code Accuracy**: Key function names and file paths extracted from the source tree.

## 14. Conclusion & Next Steps

RDK‑WanManager is the middleware component that centralizes WAN selection, policy enforcement and TR‑181 DML handling for WAN interfaces. The documentation above fills the RDK‑B template with the implementation details discovered in the `wan-manager` source tree. Recommended next steps:

- Add a small examples section with common WebConfig blobs and their expected TR‑181 side effects (testing/QA asset).
- Add unit tests or integration tests that exercise WebConfig apply logic and policy selection (there are tests in the `test/` folder — see `RdkWanManagerTest.cpp`).
- Maintain a short runbook with troubleshooting steps (how to force DHCP renew, where to find logs and telemetry counters).


---

Requirements coverage:
- Followed `rdkb-document-template.md` structure exactly: All numbered sections present and populated.
- Applied `workflow.md` steps: code analysis (files listed), data extraction (APIs, configs), diagrams created, validation checklist applied.
- Mermaid diagrams follow `diagram-guidelines.md` rules: subgraphs for deployment, protocol labels, and classDef styling.

Files referenced (key paths):
- `source/WanManager/wanmgr_core.c`, `wanmgr_main.c`, `wanmgr_data.h`, `wanmgr_interface_sm.c`, `wanmgr_ipc.c`, `wanmgr_webconfig_apis.c`, `wanmgr_dhcpv4_apis.h`, `wanmgr_ssp_action.c`.
- `config/RdkWanManager.xml`, `config/RdkWanManager_v2.xml`.

Verification performed: inspected the source files above and extracted public APIs, DML callbacks listed in XML and the WebConfig apply flow. Please tell me if you want this document written to a different filename or if you'd like me to also add a small example WebConfig blob and a short test script to exercise it.

## 15. Examples & Tests

This section provides concrete WebConfig blob examples (msgpack) and two test approaches you can use on a development device or in CI to exercise the WebConfig apply logic implemented in `wanmgr_webconfig_*.c`.

### 15.1 Example 1 — Simple WanFailoverData blob (JSON -> msgpack)

This example enables the "allow_remote_interfaces" flag in the `wanfailover` subdocument.

JSON representation (easy to read):

```json
{
  "wanfailover": {
    "allow_remote_interfaces": true
  }
}
```

Python helper to produce a msgpack blob file (`make_wan_blob.py`):

```python
#!/usr/bin/env python3
"""
Create a WebConfig msgpack blob for WAN Manager and write it to disk.
Requires: pip install msgpack
"""
import msgpack
import sys

blob = {
    "wanfailover": {
        "allow_remote_interfaces": True
    }
}

out = 'wan_blob.msgpack'
with open(out, 'wb') as f:
    f.write(msgpack.packb(blob))

print(f'Wrote {out} ({len(open(out, "rb").read())} bytes)')

if __name__ == '__main__':
    pass
```

Usage (on your workstation or the target device if Python/msgpack is available):

```powershell
# create msgpack blob
python3 make_wan_blob.py

# copy to device (if creating locally)
# scp wan_blob.msgpack root@device:/tmp/wan_blob.msgpack
```

How to apply the blob on a device (options):
- If your platform provides a WebConfig CLI or REST API, use that to apply `/tmp/wan_blob.msgpack` as a WebConfig subdocument for the WanManager component.
- For a direct in‑process unit test (see next example) you can load the blob bytes and call the component's WebConfig handler function `WanMgrDmlWanFailOverDataSet` from a unit test binary.

### 15.2 Example 2 — Python + larger blob (interface + marking)

JSON example that configures a virtual interface entry and a marking row (human readable):

```json
{
  "CPEInterface": [
    {
      "Name": "wan0",
      "Marking": [
        { "Alias": "DATA", "EthernetPriorityMark": 5 }
      ]
    }
  ]
}
```

You can extend the `make_wan_blob.py` script above to include this structure and produce a larger blob. The WebConfig apply logic in `wanmgr_webconfig_apis.c` will try to match `Name` to an existing DML interface and then add/commit marking rows via `CcspCcMbi_AddTblRow`.

### 15.3 Unit test (C++ / gtest) — call WebConfig handler directly

If you want to exercise the component code directly in CI (recommended for deterministic verification), add a small gtest that packs a msgpack blob and calls the `WanMgrDmlWanFailOverDataSet` function exposed by the WebConfig module. The sample below shows a minimal test you can place under the component `test/` folder (e.g. `test/TestWanWebConfig.cpp`). It depends on `msgpack-c` and your component build artifacts.

```cpp
// test/TestWanWebConfig.cpp
#include <gtest/gtest.h>
#include <msgpack.h>
#include "ansc_status.h"

// The WebConfig entry point in the WAN manager implementation
extern ANSC_STATUS WanMgrDmlWanFailOverDataSet(const void* pData, size_t len);

TEST(WanMgrWebConfig, WanFailoverApply)
{
    // Build msgpack for: { "wanfailover": { "allow_remote_interfaces": true } }
    msgpack_sbuffer sbuf;
    msgpack_sbuffer_init(&sbuf);

    msgpack_packer pk;
    msgpack_packer_init(&pk, &sbuf, msgpack_sbuffer_write);

    // outer map with 1 key
    msgpack_pack_map(&pk, 1);

    // key: "wanfailover"
    const char* k1 = "wanfailover";
    msgpack_pack_str(&pk, strlen(k1));
    msgpack_pack_str_body(&pk, k1, strlen(k1));

    // value: map with one boolean field
    msgpack_pack_map(&pk, 1);
    const char* k2 = "allow_remote_interfaces";
    msgpack_pack_str(&pk, strlen(k2));
    msgpack_pack_str_body(&pk, k2, strlen(k2));
    msgpack_pack_true(&pk);

    // Call the component handler
    ANSC_STATUS status = WanMgrDmlWanFailOverDataSet(sbuf.data, sbuf.size);

    // Expect success in a real test environment where the data layer is initialized
    // If run in isolation you may need to initialize the component's data (WanMgr_Data_Init)
    EXPECT_EQ(status, ANSC_STATUS_SUCCESS);

    msgpack_sbuffer_destroy(&sbuf);
}
```

Build & run notes for the gtest example:

- Add `TestWanWebConfig.cpp` to the `test/` directory and update `test/Makefile.am` (or the project's test build system) to compile and link the file. Link against:
  - component object files (the files containing `WanMgrDmlWanFailOverDataSet` / `wanmgr_webconfig_apis.c`)
  - `msgpack-c` (libmsgpackc)
  - gtest (or your project's test framework)

Example g++ (conceptual) — adjust include paths and libs to your build environment:

```bash
g++ -std=c++11 -I/path/to/msgpack/include -I/path/to/wanmgr/include \
    test/TestWanWebConfig.cpp \
    <component_objects_or_libs> -lmsgpackc -lgtest -lpthread -o TestWanWebConfig

# run
./TestWanWebConfig
```

Notes and troubleshooting:
- The unit test above calls the WebConfig handler directly; some functions expect the component data model to be initialized (e.g., `WanMgr_Data_Init`) and for TR‑181 tables to be present. In CI you can initialize the minimal environment by calling `WanMgr_Data_Init()` before invoking the handler or mocking the DML functions.
- If you prefer a pure black‑box test, use the Python msgpack producer and then apply the blob through the platform WebConfig CLI/REST API and assert the expected TR‑181 changes (read back parameters via DBus or rbus).

### 15.4 Quick smoke test checklist

1. Produce blob:

```powershell
python3 make_wan_blob.py
```

2. Copy to device and apply via WebConfig framework or run the unit test binary that calls `WanMgrDmlWanFailOverDataSet`.

3. Verify results:
  - Confirm TR‑181 parameter `X_RDK_WanManager.WanFailoverData` or `X_RDK_WanManager.CPEInterface.{i}.Wan.Refresh` changed as expected using the platform DBus/CCSP tools or `rbus`/`dmcli` utilities.
  - Check `wanmanager` logs (CcspTrace / `/var/log/`) for WebConfig apply messages and commit traces.

4. Cleanup: remove temporary blob files and revert test changes via TR‑181 or CCSP calls.

