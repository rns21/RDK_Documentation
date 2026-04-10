# WAN Manager - Kavia freeflow

## Overview

`wan-manager` (RdkWanManager) is an RDK-B middleware component responsible for WAN interface orchestration. It consumes physical-link status and related hints from interface managers (for example, DOCSIS, Ethernet WAN, GPON, cellular, xDSL) and then performs the link-layer and IP-layer configuration required to bring up WAN connectivity on the device.

The component’s mission objectives, as stated in the repository, are that interface managers bring up the physical layer and report link status and configuration hints, while WAN Manager performs the higher-layer configuration using RDK components (for example, VLAN Manager, DHCP Manager) and/or Linux networking utilities. WAN Manager also runs the business logic that selects an interface (or interfaces), validates connectivity, and performs runtime failover between groups of interfaces.

WAN Manager exposes configuration and operational state through a TR-181 data model plugin and, when compiled with RBUS support, publishes/consumes RBUS properties, events, and methods for both external control and internal coordination.

## Key Features

WAN Manager provides a set of behaviors that are implemented in the current repository code and data models.

It can run a single failover policy instance that governs runtime switching between interface groups. It can also run one selection policy instance per interface group, allowing different selection algorithms for different groups, and it can run a per-virtual-interface state machine to build and tear down the WAN stack from bottom to top.

WAN Manager supports both RBUS and WebConfig for remote configuration. RBUS is also used for internal communications, including publishing interface status properties/events and receiving readiness events at boot.

It supports multiple WAN stack elements as represented in the TR-181 tree and internal structures, including VLAN, DHCPv4, DHCPv6, PPP, MAP-T/MAP-E related parameters, DS-Lite, and per-interface marking.

It integrates telemetry hooks (Telemetry2.0 when enabled at build time) and also supports optional `systemd` readiness notification (`sd_notify`) when built with notify support.

## Design

WAN Manager is structured as a CCSP component with a core daemon/executable and a TR-181 data model plugin. At a high level, the daemon provides the runtime orchestration, state machines, policies, and platform/event integration, while the TR-181 plugin registers getters, setters, validate/commit hooks, and table handlers that present the configuration and state via the CCSP data model.

The design is explicitly split between “physical interface managers” and WAN Manager responsibilities. WAN Manager does not attempt to own physical bring-up; instead, it treats physical status and base-interface readiness as inputs. WAN Manager then configures the link/IP layers, uses policy engines to decide which interface should be active, and uses a per-virtual-interface state machine to apply configuration and to deconfigure when an interface is no longer selected.

When RBUS is enabled, WAN Manager registers RBUS data elements for top-level state such as “current active interface”, as well as table-based properties per interface (and per virtual interface when unification is enabled). It also exposes RBUS methods to start/stop/activate/deactivate WAN and to optionally disable/enable “auto routing” (control handoff) in the failover policy.

The design also includes an event-serialization mechanism for DHCP client events: DHCP lease updates arrive via RBUS events and are queued into a FIFO protected by a mutex and condition variable. A single worker thread drains this queue, ensuring the order of DHCP events is preserved while allowing the RBUS callback path to remain lightweight.

## Prerequisites and Dependencies

WAN Manager is an RDK-B middleware component that assumes the presence of the CCSP message bus runtime and, optionally, the RBUS runtime. It also depends on platform services that exist on target devices, including `syscfg` and `sysevent`, and it uses standard Linux process and networking facilities.

At the source-code level, the repository shows explicit inclusion and use of `syscfg/syscfg.h` and use of `syscfg_get` (for example, reading `Device_Mode` during RBUS initialization/update logic). The component writes a PID file to `/var/tmp/wanmanager.pid` at startup and uses a marker file `/tmp/wanmanager_initialized` to inform the WebConfig framework whether the component is coming up after a crash.

The TR-181 plugin depends on CCSP “COSA plugin” interfaces and acquires function pointers from the CCSP framework (for example, `COSAGetParamValueByPathName`, `COSASetParamValueByPathName`, and others) during initialization. The plugin also includes `ccsp_psm_helper.h`, indicating that persistent storage via PSM is part of the design. The repository also contains a large set of PSM key definitions used to store configuration and per-interface parameters.

## Build-Time Flags and Configuration

The build is Autotools based. The key build-time feature flags visible in `configure.ac` are described below in terms of what they enable in the compiled binaries.

`--enable-notify` enables systemd notify support. When enabled, the build defines `ENABLE_SD_NOTIFY` and links with `-lsystemd`. In the daemon’s main function, this causes WAN Manager to call `sd_notifyf` to indicate readiness.

`--enable-gtestapp` enables unit test build support. When enabled, the build defines `-DGTEST_ENABLE` and configures the `source/test/Makefile` generation. The repository includes a `source/test/` folder with GoogleTest test sources.

`--enable-wanunificationsupport` enables WAN unification support. This sets an Automake conditional `WAN_UNIFICATION_ENABLED` and is used in multiple code paths to switch between “v1/v2” style DML and to add virtual-interface table exposure in RBUS and TR-181.

`--enable-dhcp_manager` enables DHCP Manager support. This sets an Automake conditional `DHCPMANAGER_ENABLED`. The TR-181 XML also uses preprocessor-style conditionals such as `<?ifndef FEATURE_RDKB_DHCP_MANAGER?>` to include local DHCPv4/DHCPv6 object trees when DHCP Manager is not used.

In addition to the above configure flags, the codebase uses several compile-time macros to include or exclude feature logic. Examples visible in the repository include `RBUS_BUILD_FLAG_ENABLE` (guards major RBUS integration in the daemon and RBUS handler), `ENABLE_FEATURE_TELEMETRY2_0` (enables `t2_init("wanmanager")`), and `INCLUDE_BREAKPAD` (switches between Breakpad exception handling and signal handlers).

## RDK-B Platform and Integration Requirements

WAN Manager is intended to be deployed as a CCSP component in an RDK-B stack. As part of platform integration, it needs the CCSP message bus configuration and component registration to be correct for `COMPONENT_ID_WANMANAGER` and `COMPONENT_PATH_WANMANAGER`. The daemon’s startup path calls `ssp_Mbi_MessageBusEngage(...)`, then `ssp_create()` and `ssp_engage()` to attach to the CCSP bus.

When RBUS is enabled, WAN Manager assumes that RBUS namespaces and data elements can be registered for the WAN Manager component name (`WANMANAGER`) and that dependencies publish certain events, such as `wan_ready_to_go`. WAN Manager explicitly subscribes to `wan_ready_to_go` at boot for up to 120 seconds and waits (up to 180 seconds) for the readiness signal before proceeding.

WAN Manager also integrates with other RDK components through RBUS method invocation and event subscriptions. A concrete example implemented in the repository is interaction with the “TandD connectivity check” APIs: WAN Manager invokes RBUS methods to start and stop connectivity checks and subscribes to a per-interface “MonitorResult” event path to receive connectivity results.

For remote-device/mesh scenarios, WAN Manager contains code paths gated by `FEATURE_RDKB_INTER_DEVICE_MANAGER` where it subscribes to IDM events such as remote device changes and remote invoke results. In these flows, WAN Manager uses `Device.X_RDK_Remote.Invoke()` (RBUS method invocation) to request remote WAN parameter values and optionally establish subscriptions.

## Threading Model

WAN Manager is multi-threaded and uses threads for background work and to avoid blocking event callback contexts.

The daemon itself daemonizes (unless run with `-c`) and then starts the core runtime via `WanMgr_Core_Start()` after initialization. The precise set of core threads is implemented in the core module, but the repository clearly shows multiple additional threads created in the RBUS handler layer for specific tasks.

The DHCP client event subsystem creates one persistent worker thread lazily on first event. RBUS delivers DHCP client events into `WanMgr_DhcpClientEventsHandler`. That callback allocates an event record, copies the interface name and the lease payload (bytes), and enqueues the event into a global FIFO queue. The first enqueue starts a single worker thread, and that worker thread drains the queue in strict FIFO order using a mutex and condition variable. The actual DHCP processing occurs outside the queue lock in `WanMgr_ProcessDhcpClientEvent(...)`.

WAN Manager also creates detached threads for remote interface configuration to serialize complex work and to avoid blocking the original RBUS event handler. The function `WanMgr_WanRemoteIfaceConfigure(...)` spawns `WanMgr_WanRemoteIfaceConfigure_thread(...)`, which then uses a mutex (`RemoteIfaceConfigure_mutex`) to serialize remote interface table updates and RBUS row registration.

WAN Manager creates a thread to configure WAN connectivity checks (WCC) via `WanMgr_Configure_WCC_Thread` so that RBUS handle usage does not deadlock against WAN Manager’s internal locks. This thread performs RBUS method invocations and manages subscribe/unsubscribe behavior for connectivity-result events.

Overall, the threading approach is a mix of long-lived worker threads (for FIFO DHCP event processing) and “fire-and-forget” detached threads for heavier tasks (remote interface configuration and connectivity-check orchestration). Synchronization is done using POSIX mutexes and condition variables.

## Component Flow (Request/Response)

WAN Manager participates in several “request/response” style interactions, primarily via RBUS properties/methods and via TR-181 get/set/commit flows. It also participates in event-driven flows where asynchronous events from other components drive updates.

### Initialization Flow

At startup, the daemon initializes logging, performs data initialization (`WanMgr_Data_Init()`), engages with the CCSP bus, initializes the CCSP data model layer (`Cdm_Init`), optionally notifies systemd readiness, and then initializes the WAN core (`WanMgr_Core_Init()`).

If RBUS is enabled, WAN Manager subscribes to `wan_ready_to_go` and waits for up to 180 seconds for that signal. This boot-time wait is meant to ensure required platform readiness before WAN Manager begins active orchestration.

After readiness, WAN Manager initializes WebConfig integration via `WanMgrDmlWanWebConfigInit()` and then starts the core runtime (`WanMgr_Core_Start()`), which is the main operational loop.

### RBUS Method Calls (Request/Response)

WAN Manager exposes RBUS methods under the `Device.X_RDK_WanManager.Interface.{i}` namespace.

The following methods are registered in the RBUS handler implementation:

- `Device.X_RDK_WanManager.Interface.{i}.WanStart()`, which parses the interface index and calls `WanMgr_StartWanVISM(index-1, WAN_IFACE_SELECTED)` to start the per-interface state machine for that interface.
- `Device.X_RDK_WanManager.Interface.{i}.WanStop()`, which calls `WanMgr_StopWanVISM(index-1)` to stop the interface.
- `Device.X_RDK_WanManager.Interface.{i}.Activate()`, which calls `WanMgr_ActivateInterface(index-1)`.
- `Device.X_RDK_WanManager.Interface.{i}.Deactivate()`, which calls `WanMgr_DeactivateInterface(index-1)`.
- `Device.X_RDK_WanManager.DisableAutoRouting()`, which sets a runtime flag `DisableAutoRouting = TRUE` in config data to take control away from failover policy logic.
- `Device.X_RDK_WanManager.EnableAutoRouting()`, which clears `DisableAutoRouting` so control returns to the failover policy.

These are synchronous method handlers from the RBUS perspective, with status communicated back via the RBUS method return code.

### RBUS Property Get/Set and Event Publish

WAN Manager registers and serves RBUS properties such as:

- `Device.X_RDK_WanManager.CurrentActiveInterface`
- `Device.X_RDK_WanManager.CurrentStatus`
- `Device.X_RDK_WanManager.CurrentStandbyInterface`
- `Device.X_RDK_WanManager.InterfaceAvailableStatus`
- `Device.X_RDK_WanManager.InterfaceActiveStatus`
- `Device.X_RDK_WanManager.CurrentActiveDNS`

It also registers the interface table and properties under `Device.X_RDK_WanManager.Interface.{i}`, including selection enable, alias, phy status, WAN status, and link status (and additional virtual-interface/IP properties when WAN unification is enabled).

For certain properties (for example, `Selection.Enable`), the RBUS set handler updates both in-memory state and persists the value to storage by calling `WanMgr_RdkBus_SetParamValuesToDB(...)` with a PSM-derived key such as `dmsb.wanmanager.if.%d.Selection.Enable`.

WAN Manager publishes events to RBUS when values change and there are active subscribers. This is implemented by `WanMgr_Rbus_EventPublishHandler` and specific publish-on-change helpers. Subscriptions are tracked per-interface so WAN Manager can avoid event work when no consumers are listening.

### DHCP Client Events via RBUS (Asynchronous Flow)

WAN Manager subscribes to `<DhcpInterface>.Events` paths and receives DHCP lease update events. Those events are translated into structured `DhcpEventThreadArgs`, with a copy of the lease bytes for v4 or v6, and then queued to a FIFO worker thread. The worker thread processes events in the order they were received.

This is an asynchronous “event-in / processing-out” design: RBUS receives the event, WAN Manager queues it, and actual WAN-side state updates happen later in the worker context.

## TR-181 Data Models

WAN Manager includes TR-181 data model XML definitions under the repository’s `config/` directory (on disk in this workspace, that directory lives under the `wan-manager-2474/` folder). Two XML files are present: `RdkWanManager.xml` and `RdkWanManager_v2.xml`. Both define module `TR181_RdkWanManager` and expose an `X_RDK_WanManager` object tree, but the “v2” model includes additional group and virtual-interface constructs aligned with WAN unification support.

### X_RDK_WanManager (Top-Level)

In `RdkWanManager.xml`, `X_RDK_WanManager` exposes parameters including:

- `Enable` (boolean, writable)
- `Data` (string, writable)
- `Policy` (mapped enum represented as uint32/mapped; may be writable depending on `WANMGR_POLICY_TR181_READONLY`)
- `ResetActiveInterface` (boolean, writable)
- `AllowRemoteInterfaces` (boolean, writable)
- `ResetDefaultConfig` (boolean, writable)
- `RestorationDelay` (uint32, writable)
- `WanFailoverData` (string, writable)

In `RdkWanManager_v2.xml`, the top-level includes a `Version` string parameter and also includes `AllowRemoteInterfaces`, `ResetDefaultConfig`, `RestorationDelay`, and `WanFailoverData`. Policy control is represented under a `Group` table in v2.

### Interface Tables

In `RdkWanManager.xml`, the main interface table is `X_RDK_WanManager.CPEInterface.{i}`, which contains objects for `Phy`, `Wan`, `IP`, `PPP`, `MAP`, `DSLite`, and `Marking`. These objects map to registered COSA plugin functions such as `WanIfPhy_GetParam...`, `WanIfCfg_GetParam...`, and similar.

In `RdkWanManager_v2.xml`, the model includes both `CPEInterface.{i}` and a richer `Interface.{i}` table with a `Selection` object and a `VirtualInterface.{i}` table nested under `Interface`. This matches the RBUS handler’s behavior when `WAN_MANAGER_UNIFICATION_ENABLED` is defined, where per-virtual-interface properties and table rows are registered.

### DHCPv4/DHCPv6 Objects

Both XML files include DHCPv4 and DHCPv6 object trees under preprocessor-like conditions `<?ifndef FEATURE_RDKB_DHCP_MANAGER?>`. This indicates that WAN Manager can expose local DHCPv4/DHCPv6 clients and related options when DHCP Manager is not present/enabled in the platform integration.

Additionally, the DHCPv6 model includes `X_RDKCENTRAL-COM_RcvOption` parameters that represent MAP-T/MAP-E option extraction values, which are exposed as read-only in the data model.

### MAP Object (v2)

`RdkWanManager_v2.xml` also contains a separate top-level `MAP` object tree with `Domain`, `Rule`, and `Interface` structures and `Stats`, mapping to functions such as `WanMapDomain_GetParam...` and `WanMapRule_GetParam...`. This corresponds to a more explicit MAP domain/rule representation.

## Internal Modules

WAN Manager’s source is split into a runtime daemon side (under `source/WanManager/`) and a TR-181 “middle layer” and plugin (under `source/TR-181/`). The repository also includes a dedicated DHCPv6 message handler module folder.

The following table summarizes the major modules and their roles as evidenced in the repository.

| Module | Description | Key Files |
|---|---|---|
| Daemon entry and lifecycle | Initializes logging, drops privileges, engages CCSP bus, initializes core, waits for system readiness (RBUS), initializes WebConfig, and starts core runtime. | `source/WanManager/wanmgr_main.c` |
| TR-181 plugin initialization | Registers COSA/CCSP function pointers and registers TR-181 functions for WAN objects and tables; creates and initializes backend object. | `source/TR-181/middle_layer_src/wanmgr_plugin_main.c` |
| RBUS integration layer | Registers RBUS data elements, interface tables, properties, and methods; handles get/set; subscribes to required events; publishes events. | `source/TR-181/middle_layer_src/wanmgr_rbus_handler_apis.c` |
| DHCP client event handling | Subscribes to DHCP client events, copies lease payload, and queues events to a FIFO worker thread for ordered processing. | `source/TR-181/middle_layer_src/wanmgr_rbus_dhcp_client_events.c` |
| Persistent configuration keys (PSM) | Declares the PSM key strings used throughout the component for group/interface/virtual-interface settings and marking lists. | `source/TR-181/include/dmsb_tr181_psm_definitions.h` |
| TR-181 data model XML | Defines the TR-181 object trees, parameters, and COSA function mapping, including v1 and v2/unification variants. | `config/RdkWanManager.xml`, `config/RdkWanManager_v2.xml` |

## Key Implementation Logic

### Bus and Data Model Initialization

The daemon’s `cmd_dispatch('e')` path engages the CCSP message bus and starts the SSP framework (`ssp_create()` and `ssp_engage()`). After bus attach, the daemon initializes the CCSP data model via `Cdm_Init(...)`. This reflects the classic CCSP component pattern where the process attaches to the CCSP bus and loads/registers its data model plugin.

The TR-181 plugin’s `WanManagerDmlInit(...)` function acquires function pointers (get/set by path name, getters for bool/int/string/ulong, registry root folder, message bus handle, subsystem prefix) and then registers a long list of object functions via `pPlugInfo->RegisterFunction(...)`. Finally, it creates the backend object via `BackEndManagerCreate()` and calls its `Initialize` method.

### Boot Readiness Gate via RBUS

When `RBUS_BUILD_FLAG_ENABLE` is defined, the daemon performs an explicit boot-time readiness wait. It subscribes to `wan_ready_to_go` using `WanMgr_Rbus_SubscribeWanReady()` and waits for up to 180 seconds for the global boolean `wan_ready_to_go` to be set by the RBUS event handler. If RBUS is not enabled, the daemon logs that it is continuing without this gate.

This logic ensures WAN Manager can defer the start of active configuration until dependent subsystems are ready and publishing the readiness event.

### RBUS Request Handling and Persistence Updates

WAN Manager’s RBUS set handler supports updates such as per-interface selection enable. When a client sets `Device.X_RDK_WanManager.Interface.{i}.Selection.Enable`, WAN Manager updates the in-memory selection enable flag and persists the value using a PSM key computed from `PSM_WANMANAGER_IF_SELECTION_ENABLE`.

This is an example of a “northbound set” that results in both runtime and persistent state changes.

WAN Manager also exposes “start/stop/activate/deactivate” actions via RBUS methods. These handlers resolve the target interface index (by numeric instance or alias) and then call internal interface state machine control APIs such as `WanMgr_StartWanVISM(...)` and `WanMgr_StopWanVISM(...)`.

### DHCP Lease Update Processing Serialization

The DHCP event subsystem implements strict ordering using a FIFO queue and a single worker thread. This is important because DHCP lease updates can arrive quickly and out of order relative to processing time; by always processing in arrival order, the component avoids inconsistent intermediate states.

The worker thread design also prevents heavy processing in RBUS callback context, improving overall responsiveness and reducing the likelihood of reentrancy issues.

### Connectivity Check Orchestration via TandD

WAN Manager integrates with a “TandD” connectivity-check component by invoking RBUS methods to start and stop connectivity checks and by subscribing to the per-interface monitor result event path. WAN Manager processes those monitor results and records them into the virtual interface’s connectivity status fields, also generating telemetry markers for up/down results.

This logic is run in a dedicated thread (`WanMgr_Configure_WCC_Thread`) specifically to avoid deadlocks between WAN Manager internal locks and RBUS handle usage.

## Key Configuration Files

WAN Manager’s primary “configuration surface” is its TR-181 data model, backed by persistent storage (PSM keys) and runtime memory structures. In addition, there are repository-provided configuration/definition files that are required for correct integration.

The TR-181 XML data model definitions are:

- `wan-manager/config/RdkWanManager.xml`, which defines the base model including `X_RDK_WanManager` and `CPEInterface` and can include DHCPv4/DHCPv6 object trees depending on build/integration flags. In this workspace the file is located at `wan-manager-2474/config/RdkWanManager.xml`.
- `wan-manager/config/RdkWanManager_v2.xml`, which defines the v2/unification-oriented model including `Group`, `Interface`, and nested `VirtualInterface`, plus MAP domain/rule structures. In this workspace the file is located at `wan-manager-2474/config/RdkWanManager_v2.xml`.

The PSM key namespace is defined in:

- `wan-manager/source/TR-181/include/dmsb_tr181_psm_definitions.h`, which contains the actual string keys used for persistent configuration, including global parameters (`dmsb.wanmanager.*`), per-group parameters, per-interface parameters, and per-virtual-interface parameters. In this workspace the file is located at `wan-manager-2474/source/TR-181/include/dmsb_tr181_psm_definitions.h`.

At runtime, the daemon uses:

- `/etc/debug.ini` for logger initialization (passed to `rdk_logger_init`).
- `/var/tmp/wanmanager.pid` for PID file output.
- `/tmp/wanmanager_initialized` as a marker file for crash detection and WebConfig framework signaling.

## Notes on Repository Evidence and Scope

This document is intentionally constrained to behaviors and interfaces that are visible in the repository contents. For platform-specific interactions that require external components (for example, exact systemd unit files, Yocto recipes, or specific interface-manager implementations), those artifacts are not present in this repository tree and are therefore not described as concrete files here. Where compile-time flags indicate optional integration paths, the documentation reflects the conditions as implemented in the code and in the TR-181 XML conditionals.
