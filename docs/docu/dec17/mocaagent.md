# MoCA Agent Documentation

The MoCA (Multimedia over Coax Alliance) Agent is a critical RDK-B middleware component responsible for managing and monitoring MoCA network interfaces in residential gateway devices. This component provides comprehensive management capabilities for MoCA networks, which enable high-speed data communication over existing coaxial cable infrastructure within the home. The MoCA Agent serves as the primary interface between the RDK-B middleware stack and the underlying MoCA hardware abstraction layer (HAL), facilitating network configuration, topology management, performance monitoring, and Quality of Service (QoS) control for MoCA-connected devices.

In the RDK-B ecosystem, the MoCA Agent acts as a bridge between high-level network management orchestration (performed by cloud management systems, TR-069 Auto Configuration Servers, or Web UI interfaces) and low-level hardware control (executed through vendor-specific MoCA HAL implementations). It exposes a comprehensive TR-181 data model for MoCA network configuration and monitoring, supports WebConfig framework integration for remote bulk provisioning, and provides real-time network topology information. The component ensures that MoCA networks remain operational throughout device lifecycle events including bootup, firmware upgrades, and network transitions, while maintaining compliance with MoCA Alliance specifications and CableLabs standards.

```mermaid
graph TD
    subgraph External ["External Systems"]
        ACS[("ACS/TR-069<br/>Remote Management")]
        WebUI[("Web UI<br/>Local Management")]
        WebConfig[("WebConfig Server<br/>Bulk Provisioning")]
    end
    
    subgraph RDKBMiddleware ["RDK-B Middleware Layer"]
        CR[("Component Registrar<br/>CR")]
        PAM[("PAM Agent<br/>Platform Abstraction")]
        PSM[("PSM<br/>Persistent Storage")]
        MoCAAgent[("MoCA Agent<br/>Network Management")]
        LMLite[("LM Lite<br/>Host Discovery")]
        TelemetryAgent[("Telemetry<br/>Event Reporting")]
        SysCfg[("Syscfg<br/>Configuration DB")]
    end
    
    subgraph HALPlatform ["HAL & Platform Layer"]
        MoCAHAL[("MoCA HAL<br/>Hardware Abstraction")]
        Linux[("Linux Network Stack<br/>Routing/Bridging")]
        Hardware[("MoCA Hardware<br/>Coax Transceiver")]
    end
    
    ACS -->|TR-069/CWMP| CR
    WebUI -->|HTTP/HTTPS| CR
    WebConfig -->|HTTPS/msgpack| MoCAAgent
    
    CR <-->|D-Bus| MoCAAgent
    PAM <-->|D-Bus| MoCAAgent
    MoCAAgent <-->|D-Bus| PSM
    MoCAAgent -->|Events| TelemetryAgent
    MoCAAgent <-->|API Calls| SysCfg
    LMLite -->|Query MoCA Devices| MoCAAgent
    
    MoCAAgent -->|HAL API Calls| MoCAHAL
    MoCAHAL -->|Control/Status| Hardware
    MoCAHAL -->|Routing/Bridging| Linux
    
    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef middleware fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef hal fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    
    class ACS,WebUI,WebConfig external;
    class CR,PAM,PSM,MoCAAgent,LMLite,TelemetryAgent,SysCfg middleware;
    class MoCAHAL,Linux,Hardware hal;
```

**Simplified System Context (Horizontal View):**

```mermaid
graph LR
    subgraph "External Systems"
        RemoteMgmt["Remote Management<br/>(ACS/TR-069)"]
        LocalUI["Local Web UI"]
        CloudMgmt["WebConfig Server<br/>(Bulk Provisioning)"]
    end

    subgraph "RDK-B Platform"
        subgraph "Management Agents"
            PAMAgent["PAM Agent"]
            TR069Agent["TR-069 Agent"]
            WebPA["WebPA Agent"]
        end

        subgraph "Network Management Middleware"
            MoCAAgent["MoCA Agent<br/>(Network Management)"]
            LMLite["LM Lite<br/>(Host Discovery)"]
        end

        subgraph "Supporting Components"
            ComponentReg["Component<br/>Registrar"]
            PSM["Persistent<br/>Storage Manager"]
            Syscfg["Syscfg<br/>(Config DB)"]
            Telemetry["Telemetry<br/>Agent"]
        end
    end

    subgraph "System & HAL Layer"
        MoCAHAL["MoCA HAL"]
        LinuxStack["Linux Network<br/>Stack"]
    end

    subgraph "Hardware Layer"
        MoCAHW["MoCA Hardware<br/>(Coax Transceiver)"]
    end

    %% External connections
    RemoteMgmt -->|TR-069/CWMP| TR069Agent
    LocalUI -->|HTTP/HTTPS| PAMAgent
    CloudMgmt -->|HTTPS/msgpack| MoCAAgent

    %% Management to MoCA Agent
    TR069Agent -->|D-Bus| MoCAAgent
    PAMAgent -->|D-Bus| MoCAAgent
    WebPA -->|D-Bus| MoCAAgent

    %% MoCA Agent to Supporting Components
    MoCAAgent <-->|D-Bus| ComponentReg
    MoCAAgent <-->|D-Bus| PSM
    MoCAAgent <-->|API| Syscfg
    MoCAAgent -->|Events| Telemetry
    
    %% MoCA Agent to Other Network Components
    LMLite -->|Query| MoCAAgent

    %% MoCA Agent to HAL
    MoCAAgent <-->|HAL APIs| MoCAHAL

    %% System integration
    MoCAHAL <-->|Driver APIs| LinuxStack
    MoCAHAL <-->|Control| MoCAHW

    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef mocaAgent fill:#e1f5fe,stroke:#0277bd,stroke-width:3px;
    classDef rdkbComponent fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef system fill:#fce4ec,stroke:#c2185b,stroke-width:2px;
    classDef hardware fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    class RemoteMgmt,LocalUI,CloudMgmt external;
    class MoCAAgent mocaAgent;
    class PAMAgent,TR069Agent,WebPA,LMLite,ComponentReg,PSM,Syscfg,Telemetry rdkbComponent;
    class MoCAHAL,LinuxStack system;
    class MoCAHW hardware;
```

**Key Features & Responsibilities**: 

- **MoCA Network Configuration**: Manages MoCA interface configuration including enable/disable control, frequency settings, privacy enable, password management, preferred network controller (NC) selection, and beacon power level adjustments for optimal network performance
- **Topology Discovery & Monitoring**: Provides real-time MoCA network topology information including associated device discovery, node status tracking, mesh PHY rates, and network admission control for comprehensive network visibility
- **Performance Monitoring & Statistics**: Collects and reports detailed network performance metrics including packet statistics, link quality measurements, PHY rates, transmission power levels, and error counters for capacity planning and troubleshooting
- **Quality of Service (QoS) Management**: Implements MoCA QoS flow management including ingress/egress node control, packet aggregation, flow table management, and priority-based traffic shaping for real-time application support
- **WebConfig Framework Integration**: Supports remote bulk configuration through WebConfig framework using msgpack-encoded MoCA parameter sets, enabling zero-touch provisioning and cloud-based configuration management
- **Network Isolation & Security**: Provides MoCA network isolation capabilities, whitelist control for node admission, and privacy key management to ensure secure coexial network operation
- **Multicast Routing Daemon (MRD)**: Includes integrated MRD functionality for efficient multicast packet handling over MoCA networks, supporting IPTV and streaming media applications
- **Persistent Configuration Storage**: Maintains MoCA network configuration across reboots through syscfg integration and PSM persistence, ensuring consistent network behavior after power cycles and firmware upgrades

## Design

The MoCA Agent is architected as a CCSP (Common Component Software Platform) component following the standardized RDK-B middleware design pattern. The component consists of three primary architectural layers: the Service Specific Platform (SSP) layer which handles component initialization, message bus registration, and lifecycle management; the Middle Layer which implements TR-181 data model interfaces and business logic; and the Board Specific API (SBAPI) layer which abstracts hardware-specific operations through the MoCA HAL. This layered architecture ensures clean separation of concerns, enabling the component to be portable across different hardware platforms while maintaining consistent TR-181 data model behavior.

The design emphasizes robust inter-process communication through D-Bus message bus integration for northbound interfaces (communicating with TR-069 agents, Web UI, and other RDK-B components) and direct HAL API invocation for southbound interfaces (controlling MoCA hardware). The component registers the TR-181 namespace `Device.MoCA.*` for comprehensive MoCA network management parameters. State management is handled through a combination of runtime caching, PSM (Persistent Storage Manager) for configuration persistence, and syscfg for bootstrap parameters. The component implements intelligent polling mechanisms for dynamic MoCA network information including associated devices, mesh topology, and performance statistics.

The MoCA Agent employs an event-driven architecture where external configuration changes trigger D-Bus method invocations that flow through the middle layer validation and commit phases before being applied to hardware through HAL calls. The component supports asynchronous device synchronization through dedicated threads that periodically poll MoCA HAL for network topology changes and update internal data structures. WebConfig integration enables the component to receive bulk configuration updates encoded in msgpack format, which are decoded, validated, and applied atomically to ensure configuration consistency without service interruption.

Data persistence is achieved through multiple mechanisms: syscfg for simple key-value configuration storage such as enable/disable state and privacy settings, PSM for complex data model parameters that require transaction support, and runtime caching for frequently accessed dynamic information like associated device lists and statistics. The component ensures data integrity by validating all configuration changes against MoCA Alliance specifications before committing to persistent storage and hardware. Error handling follows RDK-B conventions with comprehensive logging through RDK Logger (rdklogger) and telemetry event generation for critical state transitions and error conditions.

```mermaid
graph TD
    subgraph MoCAAgent ["MoCA Agent"]
        subgraph SSP ["Service Specific Platform"]
            SSPMain["ssp_main.c"]
            SSPMsgBus["ssp_messagebus_interface.c"]
            SSPAction["ssp_action.c"]
        end

        subgraph MiddleLayer ["Middle Layer (TR-181 DML)"]
            PluginMain["plugin_main.c"]
            MoCADml["cosa_moca_dml.c"]
            MoCAInternal["cosa_moca_internal.c"]
            MoCANetworkInfo["cosa_moca_network_info.c"]
        end

        subgraph SBAPI ["Board Specific API"]
            MoCAApis["cosa_moca_apis.c"]
            MoCAHelpers["cosa_moca_helpers.c"]
            MoCAParam["cosa_moca_param.c"]
            MoCAWebConfig["cosa_moca_webconfig_api.c"]
        end

        subgraph MRD ["Multicast Routing Daemon"]
            MRDModule["mrd.c"]
        end
    end

    subgraph ExternalSystems ["External Systems"]
        RdkbComponents["Other RDK-B Components<br/>(TR-069, WebUI, PAM, LMLite)"]
        WebConfigServer["WebConfig Server"]
        PSM[("PSM<br/>Persistent Storage")]
        Syscfg[("Syscfg<br/>Config DB")]
    end

    subgraph HALLayer ["HAL Layer"]
        MoCAHAL["moca_hal.h<br/>MoCA HAL Interface"]
    end

    SSPMain --> SSPMsgBus
    SSPMain --> SSPAction
    
    SSPMsgBus --> PluginMain
    PluginMain --> MoCADml
    MoCADml --> MoCAInternal
    MoCADml --> MoCANetworkInfo
    MoCAInternal --> MoCAApis
    MoCANetworkInfo --> MoCAApis

    WebConfigServer --> MoCAWebConfig
    MoCAWebConfig --> MoCAApis
    MoCAApis --> MoCAHelpers
    MoCAApis --> MoCAParam

    RdkbComponents <--> SSPMsgBus
    PSM <--> MoCAInternal
    Syscfg <--> MoCAApis

    MoCAApis --> MoCAHAL
    MRDModule --> MoCAHAL

    classDef mocaAgent fill:#e3f2fd,stroke:#1976d2,stroke-width:2px;
    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef hal fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;

    class SSPMain,SSPMsgBus,SSPAction,PluginMain,MoCADml,MoCAInternal,MoCANetworkInfo,MoCAApis,MoCAHelpers,MoCAParam,MoCAWebConfig,MRDModule mocaAgent;
    class RdkbComponents,WebConfigServer,PSM,Syscfg external;
    class MoCAHAL hal;
```

### Prerequisites and Dependencies

**Build-Time Flags and Configuration:**

| Configure Option | DISTRO Feature | Build Flag | Purpose | Default |
|------------------|----------------|------------|---------|---------|
| `--enable-unitTestDockerSupport` | N/A | Unit test support | Enable Docker support for unit testing with modified test configurations | Disabled |
| N/A | `safec` | `pkg-config --cflags/--libs libsafec` | Enable bounds-checking string functions via safec library; adds SafeC compiler and linker flags | Not set (uses `SAFEC_DUMMY_API`) |
| N/A | `!safec` | `SAFEC_DUMMY_API` | Define stub implementations for SafeC functions when safec library is not available | Enabled when safec absent |
| N/A | `kirkstone` | Uses `python3native` | Yocto Kirkstone build system adjustments; selects Python 3 interpreter for build scripts | Not set (uses `pythonnative`) |
| N/A (always) | N/A | `CONFIG_VENDOR_CUSTOMER_COMCAST` | Comcast/Xfinity operator-specific customizations and features | Enabled |
| N/A (always) | N/A | `CONFIG_CISCO_HOTSPOT` | Cisco hotspot feature support for MoCA network integration | Enabled |
| N/A (always) | N/A | `CONFIG_SYSTEM_MOCA` | MoCA system support enablement flag; when undefined, enables simulation mode (`_COSA_SIM_`) | Enabled |
| N/A (always) | N/A | `FEATURE_SUPPORT_RDKLOG` | RDK Logger integration for structured logging (inherited from ccsp_common.inc) | Enabled |
| N/A (always) | N/A | `_COSA_HAL_` | HAL-based implementation; explicitly marks non-simulation build | Enabled |
| N/A (always) | N/A | `-U_COSA_SIM_` | Explicitly undefine simulation mode for real hardware builds | Undefined |
| N/A (always) | N/A | `_ANSC_LINUX` | Linux platform target identification | Enabled |
| N/A (always) | N/A | `_ANSC_USER` | User-space component (not kernel module) | Enabled |
| N/A (always) | N/A | `_ANSC_LITTLE_ENDIAN_` | Little-endian byte order architecture | Enabled |
| N/A (always) | N/A | `_CCSP_CWMP_TCP_CONNREQ_HANDLER` | TR-069 CWMP TCP connection request handler support | Enabled |
| N/A (always) | N/A | `_COSA_INTEL_USG_ARM_` | Intel USG ARM platform identifier | Enabled |
| N/A (always) | N/A | `_COSA_FOR_COMCAST_` | Comcast operator-specific customizations | Enabled |
| N/A (always) | N/A | `FEATURE_SUPPORT_SYSLOG` | Syslog integration for system logging | Enabled |
| N/A (always) | N/A | `INCLUDE_BREAKPAD` | Google Breakpad crash reporting and minidump generation | Enabled |
| N/A (always) | N/A | `USE_NOTIFY_COMPONENT` | Systemd notify protocol support for service management | Enabled |
| N/A (always) | N/A | `_NO_EXECINFO_H_` | Disable execinfo.h backtrace functions (platform-dependent) | Enabled |
| N/A (always) | N/A | `CCSP_SUPPORT_ENABLED` | CCSP framework core support | Enabled |
| N/A (recipe) | N/A | `-Wall -Werror -Wextra` | Enable strict compiler warnings and treat warnings as errors | Enabled |
| N/A (recipe) | N/A | `-Wno-address` | Suppress address comparison warnings | Enabled |
| N/A (recipe) | N/A | `-Wno-enum-conversion` | Suppress enum conversion warnings | Enabled |
| N/A (recipe) | N/A | `breakpad-logmapper` inheritance | Breakpad process/logfile mapping for crash analysis | Enabled |

<br>

**Platform/Product-Specific Build Flags (Conditional):**

| Build Flag | Condition | Purpose | Source Location |
|------------|-----------|---------|-----------------|
| `_CM_HIGHSPLIT_SUPPORTED_` | Platform-specific | Cable modem high-split frequency support; enables diplexer mode checking and MoCA disable logic when high-split mode active | cosa_moca_internal.c, cosa_moca_apis.c, cosa_moca_dml.c, cosa_moca_webconfig_api.c |
| `_XB6_PRODUCT_REQ_` | XB6 platform | XB6 (Arris) product-specific customizations including modified HAL calls and parameter handling | cosa_moca_apis.c, cosa_moca_dml.c |
| `_COSA_BCM_ARM_` | Broadcom ARM | Broadcom ARM architecture-specific code paths | cosa_moca_apis.c |
| `_COSA_BCM_MIPS_` | Broadcom MIPS | Broadcom MIPS architecture-specific implementations | cosa_moca_network_info.c |
| `INTEL_PUMA7` | Intel Puma7 | Intel Puma7 chipset-specific modifications | cosa_moca_network_info.c, cosa_moca_apis.c |
| `_XF3_PRODUCT_REQ_` | XF3 platform | XF3 (Technicolor XB3) product-specific exclusions (when NOT defined) | cosa_moca_network_info.c |
| `CISCO_MOCA_CPE` | Cisco CPE | Cisco CPE device-specific MoCA features | cosa_moca_network_info.c |
| `SA_CUSTOM` | SA customization | South American region customizations | cosa_moca_apis.c |
| `MOCA_DIAGONISTIC` | Diagnostic mode | Enable MoCA diagnostic features and extended testing capabilities | cosa_moca_dml.c, cosa_moca_apis.c |
| `MULTILAN_FEATURE` | Multi-LAN support | Enable multi-LAN bridge feature support | cosa_moca_apis.c |
| `MRD_DEBUG` | Debug build | Enable verbose MRD debug logging to trace file | mrd.c |
| `_BUILD_ANDROID` | Android build | Android platform build (when NOT defined for Linux) | ssp_main.c |
| `_DEBUG` | Debug mode | Enable debug builds with additional logging (when NOT defined, disables debug output) | ssp_main.c |

<br>

**Additional Build Configuration:**

- **WebConfig Support**: WebConfig framework is a mandatory dependency (not optional) for MoCA Agent, enabling remote bulk provisioning via msgpack-encoded configuration blobs

- **CCSP Framework Flags**: Inherited from `ccsp_common.inc` and applied automatically to all CCSP components

- **Platform-Specific Flags**: Defined in platform/product bbappend files or HAL configuration; conditionally compiled in source code

- **SafeC Integration**: When `safec` DISTRO feature is enabled, pkg-config automatically adds appropriate compiler/linker flags; otherwise `SAFEC_DUMMY_API` provides stub implementations

- **Yocto Release Variations**: Kirkstone uses `python3native`, earlier releases use `pythonnative`; SafeC library naming varies (`libsafec-3.5.1` for dunfell, `libsafec` for kirkstone)

**RDK-B Platform and Integration Requirements:**

- **Build Dependencies**: 
  - `ccsp-common-library` (CCSP framework and base interfaces)
  - `webconfig-framework` (Required for bulk configuration support)
  - `utopia` (System utility functions and configuration)
  - `hal-moca` (MoCA hardware abstraction layer)
  - `curl` (HTTP/HTTPS client for WebConfig)
  - `trower-base64` (Base64 encoding/decoding for data serialization)
  - `msgpack-c` (MessagePack serialization for WebConfig)
  - `libunpriv` (Privilege management and capability control)
  - `safec-lib` (Bounds-checking string functions - optional)
  
- **RDK-B Components**: 
  - **Component Registrar (CR)**: Must be running for D-Bus component discovery and registration
  - **PAM (Platform and Application Manager)**: Provides platform-level configuration management
  - **PSM (Persistent Storage Manager)**: Required for persisting MoCA configuration across reboots
  - **LM Lite**: Queries MoCA Agent for MoCA-connected device information
  - **Telemetry**: Receives MoCA network events and statistics for cloud reporting
  
- **HAL Dependencies**: 
  - `moca_hal.h` interface implementation (minimum version depends on platform)
  - HAL must provide: `moca_GetIfConfig()`, `moca_SetIfConfig()`, `moca_GetAssocDevices()`, `moca_GetMeshTable()`, `moca_GetFlowStatistics()`, QoS management APIs
  
- **Systemd Services**: 
  - `dbus.service` must be active
  - `CcspCrSsp.service` (Component Registrar) should start before MoCA Agent
  - `PsmSsp.service` (PSM) should be available before MoCA Agent initialization completes
  
- **Message Bus**: 
  - D-Bus system bus registration required
  - Component ID: `com.cisco.spvtg.ccsp.moca`
  - D-Bus path: `/com/cisco/spvtg/ccsp/moca`
  - TR-181 namespace: `Device.MoCA.*`
  
- **Configuration Files**: 
  - `/usr/ccsp/moca/CcspMoCA.cfg` - Component configuration (component ID, D-Bus path)
  - `/usr/ccsp/moca/CcspMoCADM.cfg` - Data model XML configuration
  - `/nvram/moca_initialized_bootup` - Bootup state tracking file
  - `/etc/syscfg` - Persistent configuration storage (moca_enabled, privacy settings)
  
- **Startup Order**: 
  1. D-Bus system bus
  2. Component Registrar (CR)
  3. PSM (for configuration loading)
  4. MoCA Agent initialization
  5. Async MoCA device synchronization thread
  6. WebConfig Framework (for remote provisioning)

**Threading Model** 

The MoCA Agent implements a multi-threaded architecture designed to handle concurrent message bus operations, periodic network topology updates, multicast routing daemon operations, telemetry logging, and sysevent monitoring without blocking critical configuration requests.

- **Threading Architecture**: Multi-threaded with main event loop and specialized worker threads for different operational domains
- **Main Thread**: 
  - Handles component initialization and registration with Component Registrar
  - Processes D-Bus method calls for TR-181 parameter get/set operations
  - Manages WebConfig bulk configuration requests
  - Coordinates HAL API calls for configuration changes

**Thread Summary:**

| Thread Name | Function Name | Purpose | Lifecycle | Priority/Detach |
|-------------|---------------|---------|-----------|-----------------|
| **Main Thread** | `main()` (ssp_main.c) | Component initialization, D-Bus message bus processing, TR-181 parameter handling, WebConfig updates, HAL coordination | Created at process start; runs until process termination | Default (joinable) |
| **MoCA Device Sync Thread** | `SynchronizeMoCADevices()` | Periodically polls MoCA HAL for associated device updates, mesh topology changes, network status; updates internal data structures; triggers LM Lite notifications on topology changes | Created during `CosaMoCAInitialize()`; runs continuously polling every 10 seconds | Default (joinable) |
| **Sysevent Handler Thread** | `Moca_sysevent_handler()` | Monitors sysevent notifications for `moca_updated` events; triggers MoCA configuration updates and device synchronization when external changes occur | Created during `CosaMoCACreate()`; runs continuously waiting for sysevent notifications | Default (joinable) |
| **Logger Thread** | `Logger_Thread()` | Performs periodic MoCA logging operations based on configured log interval; writes MoCA status and statistics to log files | Created by `CosaMoCALogger()`; runs with configurable sleep periods (default 60 sec intervals) | Default (joinable) |
| **Telemetry xOps Settings Thread** | `MocaTelemetryxOpsLogSettingsEventThread()` | Monitors `/tmp/moca_telemetry_xOpsLogSettings.txt` file using inotify for configuration changes; updates telemetry logging settings dynamically | Created during `CosaMoCATelemetryInit()`; runs continuously monitoring file changes | Detached |
| **Telemetry Logging Thread** | `MocaTelemetryLoggingThread()` | Performs periodic telemetry data collection and logging based on dynamic xOps configuration; writes MoCA metrics to `/rdklogs/logs/moca_telemetry.txt` | Created during `CosaMoCATelemetryInit()`; runs with configurable intervals controlled by xOps settings | Detached |
| **MoCA Interface Reset Thread** | `MoCA_Interface_Reset()` | Handles MoCA interface reset operations asynchronously; performs HAL reset calls with configured delays (5 seconds) to prevent blocking D-Bus operations | Created on-demand during TR-181 `Reset()` operation; terminates after reset completion | Default (joinable) |
| **Multicast Routing Daemon (MRD)** | `main()` (mrd.c) | Manages multicast packet routing over MoCA network; monitors ARP cache for multicast group membership; manages whitelist verification; injects multicast packets using libnet | Standalone process (not pthread); runs as separate executable `/usr/bin/mrd`; continuous main loop | Process (not thread) |

**Synchronization Mechanisms:**

- **Mutex Locks**: Protects shared data structures including MoCA interface tables, associated device lists, and telemetry configuration variables (e.g., `pthread_mutex_t mutex` in telemetry subsystem)
- **Condition Variables**: Used for thread communication in telemetry logging subsystem (`pthread_cond_t cond`) to signal configuration changes
- **Atomic Operations**: Thread-safe counter updates through pthread mechanisms for statistics collection
- **Sysevent Tokens**: Sysevent file descriptors (`sysevent_fd`, `sysevent_token`) for inter-process event notification
- **Shared Memory**: MRD process uses System V shared memory (shmget/shmat) for device whitelist access shared with xupnp service
- **File-Based Locking**: inotify mechanisms for configuration file monitoring without explicit locks
- **PSM Synchronization**: PSM database operations are synchronous and handled through D-Bus calls to PSM component ensuring atomic configuration persistence


### Component State Flow

**Initialization to Active State**

The MoCA Agent follows a structured initialization sequence that aligns with CCSP component lifecycle requirements. The component begins in an uninitialized state and progresses through configuration loading, data model registration, message bus engagement, HAL initialization, and device synchronization before entering an active operational state. This phased approach ensures all dependencies are satisfied and the component is fully ready to service requests before advertising availability to other RDK-B components.

```mermaid
sequenceDiagram
    autonumber
    participant SystemD as Systemd
    participant Main as ssp_main.c
    participant MsgBus as Message Bus Interface
    participant Plugin as Plugin Main
    participant Internal as MoCA Internal
    participant HAL as MoCA HAL
    participant SyncThread as Device Sync Thread
    participant WebCfg as WebConfig Framework

    SystemD->>Main: Start CcspMoC ASsp Process
    Note over Main: State: Initializing<br/>Load component config<br/>Setup logging

    Main->>Main: Parse Command Line Args
    Main->>Main: Load CcspMoCA.cfg
    
    Main->>MsgBus: Initialize Message Bus
    MsgBus->>MsgBus: Connect to D-Bus
    Note over MsgBus: Register component ID<br/>com.cisco.spvtg.ccsp.moca

    Main->>Plugin: COSA_Init()
    Plugin->>Internal: CosaMoCACreate()
    Internal->>HAL: moca_GetIfConfig()
    HAL-->>Internal: MoCA Interface Config
    Internal->>Internal: Initialize Data Structures
    Internal-->>Plugin: MoCA Object Created
    Plugin-->>Main: Plugin Initialized

    Main->>Internal: CosaMoCAInitialize()
    Internal->>HAL: moca_GetIfConfig() for all interfaces
    Internal->>HAL: moca_GetDynamicInfo()
    HAL-->>Internal: Interface Status & Config
    Internal->>Internal: Populate MoCA Tables
    
    Internal->>SyncThread: pthread_create(SynchronizeMoCADevices)
    Note over SyncThread: Background thread started<br/>Polls for topology changes

    Internal->>WebCfg: webConfigFrameworkInit()
    WebCfg->>WebCfg: Register "moca" subdoc
    WebCfg-->>Internal: WebConfig Registered
    
    Internal-->>Main: Initialization Complete
    
    Main->>MsgBus: ssp_Mbi_MessageBusEngage()
    MsgBus->>MsgBus: Register D-Bus Methods
    Note over MsgBus: State: Active<br/>Ready to handle requests

    Main->>SystemD: Notify READY (systemd)
    Note over Main: State: Active<br/>Processing TR-181 requests

    loop Runtime Operations
        SyncThread->>HAL: Poll for Associated Devices
        HAL-->>SyncThread: Device List
        SyncThread->>SyncThread: Update Internal Cache
        SyncThread->>SyncThread: Detect Topology Changes
    end
```

**Runtime State Changes and Context Switching**

During normal operation, the MoCA Agent responds to various runtime events that trigger state changes in the underlying MoCA network and service configuration. These state transitions are primarily driven by external configuration changes, network topology events, and HAL status updates.

**State Change Triggers:**

- **MoCA Enable/Disable State Changes**: When MoCA interface enable state changes through TR-181 parameter `Device.MoCA.Interface.{i}.Enable`, the component transitions between operational and non-operational states, triggering HAL configuration updates, network topology resets, and telemetry events
- **Network Admission Control Events**: Dynamic node admission or removal from MoCA network causes topology table updates, triggers device synchronization thread to poll HAL, and generates notifications to LM Lite for host management updates
- **Privacy Mode Transitions**: Enabling or disabling privacy mode with password changes triggers network re-formation, existing node re-authentication, and new security key distribution to all admitted nodes
- **WebConfig Bulk Updates**: Receipt of MoCA configuration blob from WebConfig server triggers atomic configuration application including validation, HAL updates, and persistence operations without service interruption
- **Preferred NC Selection Changes**: Changing preferred network controller (NC) node can trigger network re-organization, backup NC promotion, and temporary service disruption during NC transition
- **Frequency Band Changes**: Modifying operating frequency parameters requires network shutdown, HAL reconfiguration, and network restart with new frequency settings

**Context Switching Scenarios:**

- **Bootstrap to Normal Configuration**: During first boot or factory reset, the component loads default MoCA configuration from syscfg (`moca_enabled`), applies vendor-specific HAL defaults, then transitions to runtime configuration mode where changes are persisted to PSM and syscfg
- **High-Split Mode Coexistence**: When cable modem high-split mode is detected (via sysevent), the component adjusts MoCA frequency parameters to avoid interference with DOCSIS upstream channels, temporarily reconfiguring the network
- **Multicast Routing State Changes**: MRD daemon dynamically enables/disables multicast routing based on IGMP group membership, switching between multicast forwarding and non-forwarding states
- **Failover and Recovery**: If MoCA HAL operations fail (timeout, hardware error), the component logs errors, generates telemetry events, and may retry operations or enter a degraded state while maintaining data model accessibility for diagnostics

### Call Flow

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant Init as System Init
    participant SSP as SSP Main
    participant Plugin as Plugin Main
    participant DML as MoCA DML
    participant Internal as MoCA Internal
    participant HAL as MoCA HAL

    Init->>SSP: Start Component
    SSP->>SSP: Load Configuration
    SSP->>Plugin: COSA_Init()
    Plugin->>Internal: CosaMoCACreate()
    Internal->>HAL: moca_GetIfConfig()
    HAL-->>Internal: Interface Config
    Internal-->>Plugin: Object Created
    SSP->>Internal: CosaMoCAInitialize()
    Internal->>HAL: Get All Interface Info
    HAL-->>Internal: Status & Dynamic Info
    Internal->>Internal: Start Sync Thread
    Internal-->>SSP: Init Complete
    SSP->>Init: Component Active
```

**TR-181 Parameter Get Request Flow:**

```mermaid
sequenceDiagram
    participant Client as TR-069/WebUI
    participant DBus as D-Bus Message Bus
    participant DML as cosa_moca_dml.c
    participant Internal as cosa_moca_internal.c
    participant APIs as cosa_moca_apis.c
    participant HAL as MoCA HAL

    Client->>DBus: GetParameterValues(Device.MoCA.Interface.1.Enable)
    DBus->>DML: MoCAIf_GetParamBoolValue()
    
    alt Cached Value Available
        DML->>Internal: Get from MoCAIfFullTable
        Internal-->>DML: Cfg.bEnabled
        DML-->>DBus: Boolean Value
    else Dynamic Info Needed
        DML->>APIs: CosaDmlMocaIfGetDinfo()
        APIs->>HAL: moca_GetIfConfig()
        HAL-->>APIs: Interface Config
        APIs->>Internal: Update Cache
        APIs-->>DML: Dynamic Info
        DML-->>DBus: Boolean Value
    end
    
    DBus-->>Client: Response with MoCA Enable Status
```

**TR-181 Parameter Set Request Flow:**

```mermaid
sequenceDiagram
    participant Client as TR-069/WebUI
    participant DBus as D-Bus Message Bus
    participant DML as cosa_moca_dml.c
    participant Internal as cosa_moca_internal.c
    participant APIs as cosa_moca_apis.c
    participant HAL as MoCA HAL
    participant Syscfg as Syscfg DB

    Client->>DBus: SetParameterValues(Device.MoCA.Interface.1.Enable=true)
    DBus->>DML: MoCAIf_SetParamBoolValue()
    
    Note over DML: Validation Phase
    DML->>DML: Validate Parameter Value
    DML->>Internal: Update MoCAIfFullTable.Cfg
    Internal-->>DML: Validation Success
    
    Note over DML: Commit Phase
    DML->>DML: MoCAIf_Commit()
    DML->>APIs: CosaDmlMocaIfSetCfg()
    
    APIs->>HAL: moca_SetIfConfig(bEnabled=true)
    HAL->>HAL: Configure MoCA Hardware
    HAL-->>APIs: Success
    
    APIs->>Syscfg: syscfg_set("moca_enabled", "1")
    Syscfg-->>APIs: Persisted
    
    APIs-->>DML: Configuration Applied
    DML-->>DBus: Success Response
    DBus-->>Client: SetParameterValues Response
    
    Note over HAL: MoCA Network<br/>Initialization Started
```

**WebConfig MoCA Bulk Configuration Flow:**

```mermaid
sequenceDiagram
    participant WebCfg as WebConfig Server
    participant Framework as WebConfig Framework
    participant Handler as cosa_moca_webconfig_api.c
    participant APIs as cosa_moca_apis.c
    participant HAL as MoCA HAL
    participant Syscfg as Syscfg DB

    WebCfg->>Framework: POST /moca subdoc (msgpack)
    Framework->>Framework: Validate Version
    Framework->>Handler: Process_Moca_WebConfigRequest()
    
    Handler->>Handler: Unpack msgpack blob
    Note over Handler: Extract MoCA parameters:<br/>Enable, PrivacyEnable,<br/>Password, etc.
    
    Handler->>Handler: Validate Configuration
    
    alt Configuration Valid
        Handler->>APIs: Apply MoCA Configuration
        APIs->>HAL: moca_SetIfConfig()
        HAL->>HAL: Configure Hardware
        HAL-->>APIs: Success
        
        APIs->>Syscfg: Persist Settings
        Syscfg-->>APIs: Committed
        
        APIs-->>Handler: Configuration Applied
        Handler->>Framework: setBlobVersion("moca", new_version)
        Handler-->>Framework: Success (execRetVal=0)
        Framework-->>WebCfg: HTTP 200 OK
    else Validation Failed
        Handler-->>Framework: Failure (execRetVal=1)
        Framework-->>WebCfg: HTTP 400 Bad Request
    end
```

**MoCA Device Topology Sync Flow:**

```mermaid
sequenceDiagram
    participant SyncThread as SynchronizeMoCADevices Thread
    participant APIs as cosa_moca_apis.c
    participant HAL as MoCA HAL
    participant Internal as MoCA Internal
    participant LMLite as LM Lite

    loop Every 60 Seconds
        SyncThread->>APIs: CosaDmlMocaIfGetAssocDevices()
        APIs->>HAL: moca_GetNumAssociatedDevices()
        HAL-->>APIs: Device Count
        
        APIs->>HAL: moca_GetAssociatedDeviceTable()
        HAL-->>APIs: Associated Device Array
        
        APIs->>Internal: Update pMoCAAssocDevice Cache
        
        alt Topology Changed
            Internal->>Internal: Detect New/Removed Devices
            Internal->>LMLite: Notify Device Changes
            Note over LMLite: Update Host Table
        end
        
        SyncThread->>SyncThread: sleep(60)
    end
```

## Internal Modules

The MoCA Agent is organized into distinct functional modules that implement the CCSP component architecture pattern. Each module has specific responsibilities ranging from system integration and message bus handling to data model implementation, hardware abstraction, and multicast routing.

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| **Service Specific Platform (SSP)** | Component entry point and lifecycle management. Handles process initialization, command-line argument parsing, component configuration loading, message bus connection establishment, and graceful shutdown. Provides health monitoring interface and signal handling for crash recovery with breakpad integration. | `ssp_main.c`, `ssp_action.c`, `ssp_global.h`, `ssp_internal.h` |
| **Message Bus Interface** | D-Bus integration layer implementing CCSP message bus protocol. Manages component registration with Component Registrar, handles incoming D-Bus method calls (GetParameterValues, SetParameterValues, GetParameterNames, GetParameterAttributes), and routes requests to appropriate data model handlers. | `ssp_messagebus_interface.c`, `ssp_messagebus_interface.h` |
| **Plugin Main** | Data model plugin infrastructure providing COSA (Component Object Service Architecture) initialization. Implements plugin entry points for DM library integration, manages data model object creation/destruction, and provides versioning support for TR-181 implementation. | `plugin_main.c`, `plugin_main.h`, `plugin_main_apis.h` |
| **MoCA DML (Data Model Layer)** | TR-181 Device.MoCA.* object implementation providing standardized interface for MoCA network configuration and monitoring. Implements get/set/commit handlers for all TR-181 parameters including interface configuration, statistics, QoS settings, and associated device tables. Provides parameter validation and change notification capabilities. | `cosa_moca_dml.c`, `cosa_moca_dml.h` |
| **MoCA Internal Manager** | Backend manager responsible for MoCA object lifecycle, data structure initialization, and state management. Manages MoCA interface tables, associated device cache, mesh topology cache, and flow statistics. Coordinates device synchronization thread and WebConfig framework initialization. | `cosa_moca_internal.c`, `cosa_moca_internal.h` |
| **MoCA Network Info** | Network topology and device information module providing comprehensive visibility into MoCA network structure. Manages associated device discovery, node status tracking, mesh PHY rate reporting, and network admission control information. Implements caching strategies for performance optimization. | `cosa_moca_network_info.c`, `cosa_moca_network_info.h` |
| **MoCA APIs (SBAPI)** | Board-specific API layer abstracting MoCA HAL interactions. Provides wrapper functions for all HAL operations including interface configuration, statistics retrieval, QoS management, and device enumeration. Implements error handling, retry logic, and data conversion between TR-181 and HAL data structures. | `cosa_moca_apis.c` |
| **MoCA Helpers** | Utility functions for MoCA parameter validation, data format conversion, and common operations. Provides helper routines for MAC address manipulation, frequency band calculations, PHY rate conversions, and configuration sanity checks. | `cosa_moca_helpers.c`, `cosa_moca_helpers.h` |
| **MoCA Parameters** | Parameter definition and management module providing centralized parameter metadata. Defines parameter constraints, default values, and validation rules for MoCA configuration parameters. Supports parameter serialization for WebConfig integration. | `cosa_moca_param.c`, `cosa_moca_param.h` |
| **WebConfig API** | WebConfig framework integration module enabling remote bulk provisioning. Implements msgpack-based configuration blob parsing, version management, parameter validation, and atomic configuration application. Registers "moca" subdocument with WebConfig framework and provides version get/set callbacks. | `cosa_moca_webconfig_api.c`, `cosa_moca_webconfig_api.h` |
| **Multicast Routing Daemon (MRD)** | Standalone multicast routing daemon for efficient multicast packet handling over MoCA networks. Monitors ARP cache for multicast group membership, manages shared memory for multicast routing table, and performs libnet-based packet injection for multicast forwarding. Supports IPTV and streaming media applications. | `mrd.c` |

```mermaid
graph TD
    subgraph SSPLayer ["Service Specific Platform"]
        SSPMain[ssp_main.c<br/>Entry Point]
        SSPMsgBus[ssp_messagebus_interface.c<br/>D-Bus Handler]
        SSPAction[ssp_action.c<br/>Lifecycle]
    end

    subgraph MiddleLayer ["Middle Layer (TR-181)"]
        Plugin[plugin_main.c<br/>COSA Plugin]
        MoCADML[cosa_moca_dml.c<br/>Data Model Layer]
        MoCAInternal[cosa_moca_internal.c<br/>Backend Manager]
        MoCANetInfo[cosa_moca_network_info.c<br/>Topology Info]
    end

    subgraph SBAPILayer ["Board Specific API"]
        MoCAAPIs[cosa_moca_apis.c<br/>HAL Wrapper]
        MoCAHelpers[cosa_moca_helpers.c<br/>Utilities]
        MoCAParam[cosa_moca_param.c<br/>Parameters]
        MoCAWebCfg[cosa_moca_webconfig_api.c<br/>WebConfig]
    end

    subgraph MRDModule ["Multicast Routing"]
        MRD[mrd.c<br/>Multicast Daemon]
    end

    SSPMain --> SSPMsgBus
    SSPMain --> SSPAction
    SSPMsgBus --> Plugin
    Plugin --> MoCADML
    MoCADML --> MoCAInternal
    MoCADML --> MoCANetInfo
    MoCAInternal --> MoCAAPIs
    MoCANetInfo --> MoCAAPIs
    MoCAWebCfg --> MoCAAPIs
    MoCAAPIs --> MoCAHelpers
    MoCAAPIs --> MoCAParam
    MRD -.-> MoCAAPIs

    classDef ssp fill:#e3f2fd,stroke:#1976d2,stroke-width:2px;
    classDef middle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef sbapi fill:#fff9c4,stroke:#f57f17,stroke-width:2px;
    classDef mrd fill:#e0f2f1,stroke:#00796b,stroke-width:2px;

    class SSPMain,SSPMsgBus,SSPAction ssp;
    class Plugin,MoCADML,MoCAInternal,MoCANetInfo middle;
    class MoCAAPIs,MoCAHelpers,MoCAParam,MoCAWebCfg sbapi;
    class MRD mrd;
```

## Component Interactions

The MoCA Agent maintains extensive interactions with RDK-B middleware components, system services, and external management systems to provide comprehensive MoCA network management and monitoring capabilities. These interactions span multiple protocols and communication patterns including synchronous API calls, asynchronous event notifications, and data synchronization mechanisms.

```mermaid
flowchart TD
    subgraph "External Services"
        ACS[ACS/TR-069 Server]
        WebCfgSrv[WebConfig Server]
        WebUI[Local Web UI]
    end
    
    subgraph "Middleware Layer"
        MoCAAgent[MoCA Agent]
        PAM[PAM Agent]
        TR069[TR-069 Agent]
        LMLite[LM Lite]
        PSM[PSM]
        Telemetry[Telemetry]
    end
    
    subgraph "HAL/Platform Layer"
        MoCAHAL[MoCA HAL]
        Syscfg[Syscfg]
        Linux[Linux Network Stack]
    end

    ACS -->|CWMP| TR069
    WebCfgSrv -->|HTTPS/msgpack| MoCAAgent
    WebUI -->|HTTP| PAM
    
    TR069 <-->|D-Bus GetParameterValues/SetParameterValues| MoCAAgent
    PAM <-->|D-Bus| MoCAAgent
    MoCAAgent <-->|D-Bus Parameter Persistence| PSM
    MoCAAgent -->|Event Notifications| Telemetry
    LMLite -->|D-Bus Query MoCA Devices| MoCAAgent
    
    MoCAAgent <-->|HAL APIs| MoCAHAL
    MoCAAgent <-->|syscfg_get/syscfg_set| Syscfg
    MoCAHAL <-->|Driver Control| Linux

    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef middleware fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef hal fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;

    class ACS,WebCfgSrv,WebUI external;
    class MoCAAgent,PAM,TR069,LMLite,PSM,Telemetry middleware;
    class MoCAHAL,Syscfg,Linux hal;
```

### Interaction Matrix

| Target Component/Layer | Interaction Purpose | Key APIs/Endpoints |
|------------------------|-------------------|------------------|
| **RDK-B Middleware Components** |
| Component Registrar | Component discovery, registration, and namespace reservation | `registerCapabilities()`, component registration via D-Bus |
| PAM Agent | Platform configuration management, system-level MoCA enable/disable control | D-Bus: `Device.MoCA.*` parameter access |
| TR-069 Agent | Remote management via CWMP, parameter synchronization with ACS | D-Bus: `GetParameterValues`, `SetParameterValues`, `AddObject`, `DeleteObject` |
| WebPA Agent | Cloud-based device management and configuration via WebPA protocol | D-Bus: TR-181 parameter access, event subscriptions |
| LM Lite | MoCA-connected device discovery for host management and network analytics | D-Bus: Query `Device.MoCA.Interface.{i}.AssociatedDevice.{i}.*` |
| PSM (Persistent Storage Manager) | Configuration persistence across reboots for MoCA interface settings | `PSM_Set_Record_Value2()`, `PSM_Get_Record_Value2()`, D-Bus based |
| Telemetry Agent | Network event reporting, statistics collection for cloud analytics | Telemetry marker posting for MoCA state changes and errors |
| **System & HAL Layers** |
| MoCA HAL | Hardware control, status monitoring, network topology discovery | `moca_GetIfConfig()`, `moca_SetIfConfig()`, `moca_GetAssocDevices()`, `moca_GetMeshTable()`, `moca_GetFlowStatistics()`, `moca_GetQoSFlowTable()` |
| Syscfg | Persistent key-value storage for bootstrap configuration | `syscfg_get()`, `syscfg_set()`, `syscfg_commit()` for moca_enabled, privacy settings |
| Linux Network Stack | Network interface bridging, routing table management, ARP cache monitoring | File system access to `/proc/net/arp`, `/sys/class/net/`, network interface ioctls |
| Sysevent | Event-driven system configuration synchronization (for high-split mode) | `sysevent_get()`, `sysevent_set()` for CM operational mode detection |

**Events Published by MoCA Agent:**

| Event Name | Event Topic/Path | Trigger Condition | Subscriber Components |
|------------|-----------------|-------------------|---------------------|
| MoCA_Interface_Enable_Change | `Device.MoCA.Interface.{i}.Enable` | MoCA interface enabled or disabled | PAM, TR-069, Telemetry |
| MoCA_Device_Associated | `Device.MoCA.Interface.{i}.AssociatedDeviceNumberOfEntries` | New MoCA device joins network | LM Lite, Telemetry |
| MoCA_Device_Disassociated | `Device.MoCA.Interface.{i}.AssociatedDeviceNumberOfEntries` | MoCA device leaves network | LM Lite, Telemetry |
| MoCA_Network_Status_Change | `Device.MoCA.Interface.{i}.Status` | Network status transitions (Up, Down, Error) | PAM, Telemetry |
| MoCA_Privacy_Mode_Change | `Device.MoCA.Interface.{i}.PrivacyEnabledSetting` | Privacy mode enabled/disabled or password changed | Telemetry, Security Components |
| MoCA_NC_Change | `Device.MoCA.Interface.{i}.NetworkCoordinator` | Network Coordinator (NC) role changes | Telemetry |

### IPC Flow Patterns

**Primary IPC Flow - TR-181 Parameter Access:**

```mermaid
sequenceDiagram
    participant Client as TR-069/PAM/WebUI
    participant DBus as D-Bus System Bus
    participant MoCAAgent as MoCA Agent
    participant HAL as MoCA HAL

    Client->>DBus: D-Bus Method Call<br/>GetParameterValues("Device.MoCA.Interface.1.Status")
    DBus->>MoCAAgent: Route to MoCA Component
    Note over MoCAAgent: Validate request & check cache
    
    alt Cached Value Fresh
        MoCAAgent-->>DBus: Return Cached Value
    else Need Fresh Data
        MoCAAgent->>HAL: moca_GetIfConfig(ifIndex)
        HAL-->>MoCAAgent: Interface Status
        MoCAAgent->>MoCAAgent: Update Internal Cache
        MoCAAgent-->>DBus: Return Fresh Value
    end
    
    DBus-->>Client: D-Bus Response (Status="Up")
```

**Event Notification Flow:**

```mermaid
sequenceDiagram
    participant SyncThread as Device Sync Thread
    participant MoCAAgent as MoCA Agent
    participant HAL as MoCA HAL
    participant LMLite as LM Lite
    participant Telemetry as Telemetry Agent

    loop Every 60 Seconds
        SyncThread->>HAL: Poll for Associated Devices
        HAL-->>SyncThread: Device List
        SyncThread->>SyncThread: Compare with Cached List
        
        alt Topology Changed
            Note over SyncThread: New device detected or<br/>existing device removed
            SyncThread->>MoCAAgent: Update Internal Cache
            SyncThread->>LMLite: Notify Device Change (D-Bus)
            LMLite-->>SyncThread: Ack
            SyncThread->>Telemetry: Post Telemetry Event
            Telemetry-->>SyncThread: Ack
        end
    end
```

**WebConfig Bulk Configuration Flow:**

```mermaid
sequenceDiagram
    participant Cloud as WebConfig Server
    participant Framework as WebConfig Framework
    participant MoCAAgent as MoCA Agent (WebConfig Handler)
    participant HAL as MoCA HAL
    participant Syscfg as Syscfg

    Cloud->>Framework: HTTP POST /moca subdoc<br/>(msgpack blob + version)
    Framework->>Framework: Check Version
    
    alt Version > Current
        Framework->>MoCAAgent: Process_Moca_WebConfigRequest(blob)
        MoCAAgent->>MoCAAgent: Unpack msgpack
        MoCAAgent->>MoCAAgent: Validate Parameters
        
        alt Validation Success
            MoCAAgent->>HAL: Apply Configuration
            HAL-->>MoCAAgent: Success
            MoCAAgent->>Syscfg: Persist Settings
            Syscfg-->>MoCAAgent: Committed
            MoCAAgent->>Framework: setBlobVersion("moca", new_version)
            MoCAAgent-->>Framework: execRetVal=0 (Success)
            Framework-->>Cloud: HTTP 200 OK
        else Validation Failed
            MoCAAgent-->>Framework: execRetVal=1 (Failure)
            Framework-->>Cloud: HTTP 400 Bad Request
        end
    else Version <= Current
        Framework-->>Cloud: HTTP 304 Not Modified
    end
```

## Implementation Details

### Major HAL APIs Integration

The MoCA Agent integrates comprehensively with the MoCA HAL interface to provide full control and monitoring of MoCA hardware. The component abstracts hardware-specific implementations through standardized HAL APIs while maintaining flexibility for vendor-specific optimizations and extensions.

**Core HAL APIs:**

| HAL API | Purpose | Implementation File |
|---------|---------|-------------------|
| `moca_GetIfConfig()` | Retrieve MoCA interface configuration including enable state, preferred NC, frequency mask, privacy settings, and operational parameters | `cosa_moca_apis.c`: `CosaDmlMocaIfGetCfg()` |
| `moca_SetIfConfig()` | Apply MoCA interface configuration changes to hardware including network enable/disable, frequency adjustments, privacy mode, and power settings | `cosa_moca_apis.c`: `CosaDmlMocaIfSetCfg()` |
| `moca_GetDynamicInfo()` | Query dynamic MoCA interface information including link status, current NC node ID, backup NC ID, network version, and operational frequency | `cosa_moca_apis.c`: `CosaDmlMocaIfGetDinfo()` |
| `moca_GetStaticInfo()` | Retrieve static interface information such as firmware version, hardware version, MAC address, and supported feature capabilities | `cosa_moca_apis.c`: `CosaDmlMocaIfGetSinfo()` |
| `moca_GetStats()` | Collect interface-level statistics including packet counters, byte counters, error statistics, and unicast/broadcast/multicast traffic | `cosa_moca_apis.c`: `CosaDmlMocaIfGetStats()` |
| `moca_GetNumAssociatedDevices()` | Get count of MoCA nodes currently associated with the network | `cosa_moca_apis.c`: `CosaDmlMocaIfGetAssocDevices()` |
| `moca_GetAssociatedDeviceTable()` | Enumerate all associated MoCA devices with detailed information including MAC address, node ID, PHY rates, link status, and active status | `cosa_moca_apis.c`: `CosaDmlMocaIfGetAssocDevices()` |
| `moca_GetMeshTable()` | Retrieve mesh PHY rate table showing transmission rates between all node pairs for network performance analysis | `cosa_moca_apis.c`: `CosaDmlMocaIfGetMeshTable()` |
| `moca_GetFlowStatistics()` | Query per-flow statistics for QoS flow tracking including ingress/egress node IDs, packet counts, and flow priority | `cosa_moca_apis.c`: `CosaDmlMocaIfGetFlowTable()` |
| `moca_GetQoSFlowTable()` | Retrieve QoS flow configuration table with flow parameters, packet aggregation settings, and priority assignments | `cosa_moca_apis.c`: `CosaDmlMocaIfExtCounterGetInfo()` |
| `moca_SetPreferredNC()` | Configure preferred Network Coordinator node for network leadership selection | `cosa_moca_apis.c`: `CosaDmlMocaIfSetCfg()` |
| `moca_SetPrivacyPassword()` | Set MoCA network privacy password for secure network operation and node authentication | `cosa_moca_apis.c`: `CosaDmlMocaIfSetCfg()` |
| `moca_cancelAssociation()` | Force disassociation of a specific MoCA node from the network by MAC address | `cosa_moca_apis.c`: `CosaDmlMocaIfExtAggrCounterGetInfo()` |
| `moca_GetResetCount()` | Query MoCA interface reset counter for stability monitoring and diagnostics | `cosa_moca_apis.c`: `CosaDmlMocaGetResetCount()` |

### Key Implementation Logic

- **Device Synchronization Engine**: Multi-threaded polling system (`SynchronizeMoCADevices` in `cosa_moca_internal.c`) that periodically queries MoCA HAL for network topology changes. Runs every 60 seconds to discover new associated devices, detect node departures, and update internal cache. Implements change detection algorithms to minimize D-Bus notification overhead by only reporting actual topology changes to subscribers like LM Lite. Thread-safe access to shared device tables using mutex protection.

- **WebConfig Integration**: Msgpack-based bulk configuration system (`Process_Moca_WebConfigRequest` in `cosa_moca_webconfig_api.c`) supporting atomic configuration updates from cloud management. Implements version control through syscfg to prevent configuration rollback. Validates all parameters before HAL application to ensure configuration consistency. Supports rollback on partial failure to maintain service availability. Persists configuration to both syscfg and PSM for redundancy.

- **Parameter Validation & Sanity Checks**: Comprehensive validation in `cosa_moca_dml.c` for all TR-181 parameter sets including frequency mask range checking, privacy password length validation (12-17 characters), transmit power level bounds checking, and beacon power adjustment limits. Implements interdependency validation such as requiring privacy password when privacy is enabled. Provides detailed error codes for debugging configuration issues.

- **MoCA Isolation & Whitelist Control**: Network security features (`MoCA_isolation.sh`, `moca_whitelist_ctl.sh`) implementing node admission control and network isolation from untrusted devices. Whitelist management supports MAC address-based filtering for controlled network access. Isolation mode prevents unauthorized node association while maintaining existing connections.

- **Multicast Routing Optimization**: MRD daemon (`mrd.c`) implements efficient multicast packet forwarding over MoCA by monitoring ARP cache for multicast group membership (224.0.0.0/4), managing shared memory-based multicast routing table, and performing libnet-based packet injection for multicast streams. Supports IGMP snooping integration and reduces CPU overhead for IPTV applications by offloading multicast replication to MoCA hardware where supported.

- **Event Processing**: Asynchronous event handling for D-Bus requests with non-blocking I/O. Parameter get operations utilize cached data when available to minimize HAL calls and improve response latency. Parameter set operations implement two-phase commit (validate then apply) to ensure atomic configuration changes. WebConfig requests processed in dedicated handler thread to prevent blocking main message bus thread.

- **Error Handling Strategy**: Comprehensive error detection with retry logic for transient HAL failures. HAL error codes mapped to CCSP error codes for consistent error reporting. Timeout handling with configurable thresholds for HAL operations (default 30 seconds). Graceful degradation during HAL unavailability - component remains responsive to queries using cached data while logging errors. Automatic recovery mechanisms including HAL reinitialization on persistent failures. Telemetry event generation for all critical errors enabling remote diagnostics.

- **Logging & Debugging**: Multi-level logging system using RDK Logger with component-specific log file (`MOCAlog.txt.0`). Structured logging with function name, line number, and contextual information. Debug logging for all HAL interactions including API calls, parameters, and return values. Performance logging for device synchronization timing and cache update durations. Console debug mode support via command-line flag for development troubleshooting. Trace logging for message bus transactions and parameter access patterns.

### Key Configuration Files

| Configuration File | Purpose | Override Mechanisms |
|--------------------|---------|---------------------|
| `CcspMoCA.cfg` | Component registration configuration defining component ID (`com.cisco.spvtg.ccsp.moca`), D-Bus path (`/com/cisco/spvtg/ccsp/moca`), and data model XML reference | Compile-time configuration, no runtime override |
| `CcspMoCADM.cfg` | Data model XML configuration pointer specifying TR-181 data model XML file location for COSA framework | Configuration file path, can be overridden via component config |
| `TR181-MoCA.XML` | Complete TR-181 MoCA data model definition including object hierarchy, parameter types, access permissions, and DML function mappings | Data model version updates via XML replacement |
| `/etc/syscfg` (moca_enabled) | Persistent MoCA enable/disable state stored as "0" (disabled) or "1" (enabled) | `syscfg set moca_enabled <value>; syscfg commit` |
| `/etc/syscfg` (moca_version) | WebConfig subdocument version tracking for configuration synchronization | WebConfig framework automatic version management |
| `/nvram/moca_initialized_bootup` | Bootup state marker file indicating component initialization status for crash recovery | File presence/absence, automatically managed |
| `MoCA_isolation.sh` | Shell script implementing MoCA network isolation controls via iptables rules and bridge filtering | Script parameters: `enable`/`disable` |
| `moca_whitelist_ctl.sh` | Whitelist management script for MAC-based node admission control | Script parameters: `add <MAC>`/`remove <MAC>`/`clear` |
| `moca_mroute.sh` | Multicast routing setup script configuring multicast forwarding rules for MoCA interface | Executed during MoCA enable, no runtime parameters |
| `moca_mroute_ip.sh` | IP-specific multicast routing configuration for IPTV stream forwarding | Executed with IP parameters for specific multicast groups |

---

**Documentation Complete!** The MoCA Agent documentation now includes:
- Comprehensive component overview with system context diagrams
- Detailed design architecture with component breakdown
- Complete prerequisites, dependencies, and build-time configuration
- Threading model and state flow diagrams
- Initialization and operational call flows
- Internal module organization and responsibilities
- Component interactions with matrix and IPC patterns
- Implementation details with HAL APIs and key logic
- Configuration file reference with override mechanisms

