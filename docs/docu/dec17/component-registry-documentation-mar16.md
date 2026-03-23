# Component Registry (CcspCr)

Component Registry (CR) is a core RDK-B middleware component that serves as the central registration and discovery service for all CCSP components in the system. The Component Registry maintains a comprehensive database of all registered components, their supported namespaces, capabilities, and communication endpoints, enabling dynamic service discovery and component interaction across the RDK-B middleware stack. CR acts as the primary authority for component lifecycle management, namespace resolution, and inter-component communication routing.

The Component Registry loads device profile XML configurations that define expected components and their capabilities, validates component registrations against these profiles, and provides query interfaces for namespace discovery and component lookup. CR supports both RBus and D-Bus messaging protocols, enabling flexible deployment configurations and migration paths between messaging infrastructures. The component exposes methods for capability registration, namespace discovery, data type validation, and system readiness monitoring that are consumed by all other RDK-B middleware components.

Component Registry enables the CCSP middleware architecture by decoupling components from direct dependencies and providing runtime service binding through namespace-based discovery. This architectural pattern supports modular component development, flexible deployment configurations, and dynamic system composition without compile-time component dependencies.

```mermaid
graph TB
    subgraph External ["External Systems"]
        RM["Remote Management<br/>(TR-069/WebPA)"]
        WEBUI["Web UI / Dashboard"]
    end
    
    subgraph Middleware ["RDK-B CCSP Middleware"]
        CR["Component Registry<br/>(CcspCrSsp)"]
        PAM["PandM"]
        WIFI["WiFi Agent"]
        PSM["PSM"]
        OTHER["Other Components"]
    end
    
    subgraph IPC ["Inter-Process Communication"]
        RBUS["RBus (Modern)"]
        DBUS["D-Bus (Legacy)"]
    end
    
    subgraph System ["System Services"]
        SYSCFG["Syscfg"]
        TELEMETRY["Telemetry"]
        UNPRIV["libunpriv"]
    end
    
    LINUX["Linux OS / Kernel"]
    
    RM -.->|discovery| CR
    WEBUI -.->|queries| CR
    
    PAM <-->|register/discover| CR
    WIFI <-->|register/discover| CR
    PSM <-->|register/discover| CR
    OTHER <-->|register/discover| CR
    
    CR -->|messages| RBUS
    CR -->|messages| DBUS
    
    CR -->|read config| SYSCFG
    CR -->|publish events| TELEMETRY
    CR -->|privileges| UNPRIV
    
    RBUS --> LINUX
    DBUS --> LINUX
    SYSCFG --> LINUX
    TELEMETRY --> LINUX
    
    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef middleware fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef ipc fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef system fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef kernel fill:#f1f8e9,stroke:#558b2f,stroke-width:2px
    
    class RM,WEBUI external
    class CR,PAM,WIFI,PSM,OTHER middleware
    class RBUS,DBUS ipc
    class SYSCFG,TELEMETRY,UNPRIV system
    class LINUX kernel
    class SYSCFG,TELEMETRY,UNPRIV,LINUX system
```

**Key Features & Responsibilities**: 

- **Component Registration Management**: Accepts and validates component capability registrations including namespace ownership, RBus/D-Bus endpoints, and version information against device profile configurations
- **Namespace Discovery Service**: Provides lookup services to discover which components support specific data model namespaces and dynamic table instances for inter-component parameter access
- **Device Profile Loading**: Parses and validates XML device profile configurations that define expected component topology, dependencies, and namespace allocations for the platform
- **Data Type Validation**: Verifies data model parameter types against registered namespace schemas to ensure type consistency across component boundaries
- **System Readiness Coordination**: Tracks component registration status and dependency fulfillment to determine overall system readiness state for upper-layer services
- **Session Management**: Manages registration sessions with priority handling and session ID allocation for transactional component registration operations
- **Dual IPC Support**: Supports both RBus and D-Bus messaging protocols through conditional compilation enabling flexible deployment configurations and migration strategies


## Design

Component Registry implements a centralized registration and discovery architecture that serves as the authoritative source for component topology and namespace ownership information in the RDK-B middleware stack. The design prioritizes runtime flexibility, allowing components to dynamically register capabilities while maintaining schema validation against pre-configured device profiles. The architecture separates profile management from runtime registration tracking, enabling static validation rules while supporting dynamic component lifecycle management.

The CR component initializes by loading XML device profile configurations from the filesystem that enumerate expected components, their versions, and namespace ownership patterns. During runtime, components invoke registration APIs providing their RBus/D-Bus endpoints, version information, and supported namespace arrays which CR validates against profile expectations. The namespace manager sub-component maintains indexed data structures for efficient namespace prefix matching and component lookup operations that service discovery requests from other middleware components. Registration state is maintained in memory queues tracking known components, unknown registrations, and remote CR instances in multi-subsystem deployments.

The northbound interface exposes component registration, namespace discovery, and data type validation APIs through both RBus and D-Bus protocols depending on build configuration. RBus support enables modern deployments with improved performance and reduced complexity while D-Bus support provides backward compatibility with legacy CCSP deployments. The southbound interface reads device profile XML files from the filesystem and integrates with syscfg for configuration data and telemetry services for event reporting. Component Registry does not persist registration state to non-volatile storage; instead, all components must re-register on each system initialization, ensuring registration state reflects current runtime topology.

```mermaid
graph TB
    Config["XML Device Profile<br/>(cr-deviceprofile.xml)"] 
    
    ssp_main["ssp_main.c<br/>Initialization & Lifecycle"]
    ssp_ipc["ssp_rbus.c / ssp_dbus.c<br/>Message Bus Interface"]
    
    ProfileLoader["Profile Loader<br/>(ccsp_cr_profile.c)"]
    RegHandler["Registration Handler<br/>(ccsp_cr_operation.c)"]
    NamespaceMgr["Namespace Manager"]
    ComponentQueue["Component Registry Queue"]
    
    libxml2["libxml2"]
    libunpriv["libunpriv"]
    libtelemetry["libtelemetry"]
    rbus_dbus["RBus / D-Bus"]
    
    Config -->|load| ProfileLoader
    ProfileLoader -->|parse| libxml2
    ProfileLoader -->|populate| ComponentQueue
    
    ssp_main -->|init| ProfileLoader
    ssp_main -->|drop privs| libunpriv
    ssp_main -->|send events| libtelemetry
    ssp_main -->|launch| ssp_ipc
    
    ssp_ipc -->|register methods| rbus_dbus
    ssp_ipc -->|invoke| RegHandler
    ssp_ipc -->|publish events| rbus_dbus
    
    RegHandler -->|lookup| ComponentQueue
    RegHandler -->|register namespaces| NamespaceMgr
    RegHandler -->|check readiness| ComponentQueue
    
    NamespaceMgr -->|index| ComponentQueue
    
    rbus_dbus -->|component registration| RegHandler
    rbus_dbus -->|namespace discovery| RegHandler
    
    classDef config fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef ssp fill:#e3f2fd,stroke:#0277bd,stroke-width:2px
    classDef core fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef external fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef bus fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    
    class Config config
    class ssp_main,ssp_ipc ssp
    class ProfileLoader,RegHandler core
    class NamespaceMgr,ComponentQueue data
    class libxml2,libunpriv,libtelemetry external
    class rbus_dbus bus
```

### Prerequisites and Dependencies

**Build-Time Flags and Configuration:**

| Configure Option | DISTRO Feature | Build Flag | Purpose | Default |
|------------------|----------------|------------|---------|---------|
| `--with-rbus-build=none` | N/A | N/A | Build without RBus support (D-Bus only) | N/A |
| `--with-rbus-build=only` | N/A | `RBUS_MAIN_ENABLED` | Build RBus-only variant (no D-Bus support) | N/A |
| `--with-rbus-build=integrated` | N/A | N/A | Build with both D-Bus and RBus support enabled | `integrated` |
| `--enable-notify` | `systemd` | `ENABLE_SD_NOTIFY` | Enable systemd readiness notification via sd_notify() | Disabled |
| `--enable-gtestapp` | N/A | `GTEST_ENABLE` | Enable Google Test unit test suite | Disabled |
| N/A | `rdkb_wan_manager` | N/A | Apply WAN Manager ready event patch | Conditional |
| N/A | `no_mta_support` | N/A | Remove MTA component registration from device profiles | Conditional |

**RDK-B Platform and Integration Requirements:**

- **Build Dependencies**: `ccsp-common-library`, `dbus`, `telemetry`, `utopia`, `libunpriv`, `rbus` (conditionally), `libxml2`, `syscfg`, `utapi`, `utctx`, `ulog`, `cjson`, `msgpackc`
- **RDK-B Components**: All CCSP middleware components depend on CR for registration; CR does not depend on other middleware components except during registration operations
- **Systemd Services**: CR should start early in the RDK-B middleware stack before components that depend on registration services; systemd notify support is available via `--enable-notify` configure option
- **Message Bus**: Registers on RBus or D-Bus depending on build configuration at namespace `com.cisco.spvtg.ccsp.CR`; provides registration and discovery methods
- **Configuration Files**: 
  - `/usr/ccsp/cr-deviceprofile.xml` - Standard device profile defining expected component topology
  - `/usr/ccsp/cr-ethwan-deviceprofile.xml` - Ethernet WAN device profile used when `/nvram/ETHWAN_ENABLE` exists
- **Startup Order**: CR must initialize and load device profiles before other CCSP components attempt registration; no hard dependencies on other middleware components at startup

**Threading Model:** 

Component Registry uses a multi-threaded request processing model with dedicated threads for system readiness monitoring and message bus interactions.

- **Threading Architecture**: Multi-threaded with asynchronous message processing
  - **D-Bus variant**: Uses CCSP message bus framework with internal threading via `DslhCreateCpeController::Engage()`; spawns `waitingForSystemReadyTask` as separate task
  - **RBus variant**: Explicitly spawns threads for waiting on system ready (`waitForSystemReady`) and monitoring component dependencies (`pollingComponentReady`)
- **Main Thread**: Supervises component lifecycle and yields to IPC message processing threads
- **Synchronization**: Uses mutex locks (`pthread_mutex_t`) and condition variables (`pthread_cond_t`) for thread-safe access to component registry and system readiness state; synchronization mechanisms protect shared data structures during concurrent registration and discovery operations

### Component State Flow

**Initialization to Active State**

Component Registry follows a sequential initialization flow establishing foundational services before entering active registration and discovery mode. The component must successfully load device profile configurations defining expected component topology before accepting registration requests from other middleware components.

```mermaid
stateDiagram-v2
    [*] --> Initializing: Process Start
    Initializing --> LoadingProfile: Create CR Manager Object
    LoadingProfile --> ProfileLoaded: Parse Device Profile XML
    LoadingProfile --> Failed: XML Parse Error
    ProfileLoaded --> InitializingIPC: Create Namespace Manager
    InitializingIPC --> RegisteringBus: Initialize D-Bus/RBus
    RegisteringBus --> Active: Register Methods & Properties
    Active --> Active: Process Registrations & Queries
    Active --> Shutdown: SIGTERM/SIGINT
    Failed --> [*]: Exit Process
    Shutdown --> [*]: Cleanup & Exit
    
    note right of LoadingProfile
        Loads cr-deviceprofile.xml or
        cr-ethwan-deviceprofile.xml
        based on ETHWAN_ENABLE flag
    end note
    
    note right of Active
        Accepts RegisterCapabilities()
        Serves DiscoverComponent()
        Tracks System Readiness
    end note
```

**Runtime State Changes and Context Switching**

Component Registry maintains minimal runtime state changes after entering active mode. The primary state tracked is system readiness which transitions from not-ready to ready when all expected components from the device profile have successfully registered.

**State Change Triggers:**

- Component registration completion transitions system readiness state when all profile-defined components have registered capabilities
- Configuration file reload (via SIGUSR2 signal) triggers data model XML export without interrupting registration services
- Component unregistration or loss triggers removal from namespace manager and component queues

**Context Switching Scenarios:**

- Device profile context switches between standard and Ethernet WAN profiles based on `/nvram/ETHWAN_ENABLE` file presence at startup
- IPC context varies between RBus and D-Bus processing depending on `--with-rbus-build` configuration

### Call Flow

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant Init as System Init
    participant Main as ssp_main
    participant CR as CR Manager
    participant Profile as Profile Loader
    participant IPC as IPC Layer
    participant WaitThr as SystemReady<br/>Monitor Thread

    Init->>Main: Execute CcspCrSsp
    Main->>Main: Initialize Logging & Tracing
    Main->>Main: Drop Root Privileges
    Main->>CR: CcspCreateCR()
    CR->>CR: Allocate CR Manager<br/>Initialize Component Queues
    CR-->>Main: CR Handle
    Main->>Profile: LoadDeviceProfile()
    Profile->>Profile: Check /nvram/ETHWAN_ENABLE
    Profile->>Profile: Parse XML Device Profile
    Profile->>CR: Populate Component Info Queue
    Profile-->>Main: Success
    Main->>IPC: Initialize Message Bus<br/>(RBus or D-Bus)
    IPC->>IPC: Register Methods & Properties
    IPC-->>Main: Success
    Main->>WaitThr: Spawn SystemReady<br/>Monitor Thread
    WaitThr->>WaitThr: Wait for All Components<br/>to Register
    Main->>Main: Continue in Main Loop<br/>(Daemon Mode)
    Note over WaitThr: Publishes SystemReady event<br/>when all components registered
```

**Request Processing Call Flow:**

```mermaid
sequenceDiagram
    participant Comp as CCSP Component
    participant IPC as RBus/D-Bus Layer
    participant CROper as CR Operations
    participant NS as Namespace Manager
    participant Queue as Component Queue

    Comp->>IPC: RegisterCapabilities(name, version, bus_path, namespaces[])
    IPC->>CROper: CcspCrRegisterCapabilities()
    CROper->>Queue: Lookup Component by Name
    Queue-->>CROper: Component Profile Info
    CROper->>CROper: Validate Version Match
    CROper->>NS: RegisterNamespaces(name, path, namespaces[])
    NS->>NS: Index Namespaces by Prefix
    NS->>NS: Store Component to Namespace Mapping
    NS-->>CROper: Registration Success
    CROper->>Queue: Mark Component Registered
    CROper->>CROper: Check System Readiness
    CROper-->>IPC: Return Status Code
    IPC-->>Comp: Registration Confirmed

    Note over Comp,Queue: Namespace Discovery Flow
    
    Comp->>IPC: DiscoverComponentSupportingNamespace("Device.WiFi.Radio.")
    IPC->>CROper: CcspCrDiscoverComponentSupportingNamespace()
    CROper->>NS: FindComponentByNamespace("Device.WiFi.Radio.")
    NS->>NS: Prefix Match Search
    NS-->>CROper: Component Name and Bus Path
    CROper-->>IPC: Component Info Array
    IPC-->>Comp: [Component Name, Bus Path, Subsystem]
```

## Internal Modules

Component Registry is organized into distinct modules separating platform integration concerns, core registration logic, and data management responsibilities. Each module encapsulates specific functionality while maintaining clear interfaces for inter-module communication and data sharing.

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| **SSP Main** | Process entry point and lifecycle management handling initialization, signal processing, privilege dropping, and message bus setup | `ssp_main.c`, `ssp_global.h` |
| **SSP RBus Interface** | RBus IPC integration supporting method handlers for registration and system readiness properties over RBus protocol | `ssp_rbus.c` |
| **SSP D-Bus Interface** | D-Bus IPC integration providing component interface implementation for registration and discovery methods over D-Bus | `ssp_dbus.c`, `ssp_cmd.c` |
| **CR Manager** | Core component instance providing registration, discovery, and session management APIs with component queue management | `ccsp_cr_base.c` |
| **CR Operations** | External API implementation for capability registration, namespace discovery, data type validation, and component unregistration | `ccsp_cr_operation.c` |
| **Profile Loader** | XML device profile parser loading expected component definitions, namespace allocations, and remote CR configurations | `ccsp_cr_profile.c` |
| **Session Manager** | Transaction management for registration sessions with priority handling and session ID allocation for batch operations | `ccsp_cr_session.c` |
| **CR Utility** | Helper functions for component lookup, queue management, and common operations supporting core registration logic | `ccsp_cr_utility.c` |
| **Data Model Export** | Dynamic data model XML generation for Motive-compliant export functionality triggered by SIGUSR2 signal | `ccsp_cr_exportDM.c` |

## Component Interactions

Component Registry serves as the central hub for all CCSP middleware interactions enabling component discovery and namespace resolution. CR interacts with every CCSP component during initialization registration and provides ongoing discovery services for inter-component communication routing.

### Interaction Matrix

| Target Component/Layer | Interaction Purpose | Key APIs/Endpoints |
|------------------------|-------------------|------------------|
| **RDK-B Middleware Components** |
| All CCSP Components | Component capability registration, namespace ownership declaration | `Device.CR.RegisterComponent()` (RBus), `com.cisco.spvtg.ccsp.CR.registerCapabilities()` (D-Bus) |
| All CCSP Components | Namespace-to-component discovery for inter-component parameter access | `com.cisco.spvtg.ccsp.CR.discoverComponentSupportingNamespace()` |
| All CCSP Components | System readiness monitoring and component lifecycle tracking | `Device.CR.SystemReady`, `eRT.com.cisco.spvtg.ccsp.CR.GetHealth()` |
| All CCSP Components | Component unregistration and namespace cleanup during shutdown | `com.cisco.spvtg.ccsp.CR.unregisterComponent()` |
| **System & Platform Services** |
| Syscfg | Read system configuration for initialization parameters | `syscfg_get()` via libsyscfg |
| Telemetry | Send component health and operational telemetry events | `t2_event_s()` via libtelemetry_msgsender |
| libunpriv | Drop root privileges after initialization and before message loop | `drop_root()` via libunpriv |
| libxml2 | Parse XML device profile configurations defining component topology | `xmlParseFile()`, `xmlDocGetRootElement()` |

**Events Published by Component Registry:**

| Event Name | Event Topic/Path | Trigger Condition | Subscriber Components |
|------------|-----------------|-------------------|---------------------|
| Component_Registration | `Device.CR.ComponentRegistered` | Component successfully registers capabilities | Dependent components waiting for specific component availability |
| System_Ready | `Device.CR.SystemReady` (property change) | All profile-defined components have registered | Upper-layer services (WebPA, TR-069) requiring full stack initialization |
| Component_Health | `eRT.com.cisco.spvtg.ccsp.CR.GetHealth()` | Health query invoked | Watchdog services, diagnostic tools |

### IPC Flow Patterns

**Primary IPC Flow - Component Registration:**

```mermaid
sequenceDiagram
    participant WiFi as CcspWiFiAgent/OneWifi
    participant BusLayer as RBus/D-Bus
    participant CRSsp as CR SSP Interface
    participant CROps as CR Operations
    participant NSMgr as Namespace Manager
    
    WiFi->>BusLayer: RegisterCapabilities(name="com.cisco.spvtg.ccsp.wifi", version=1, path="/com/cisco/spvtg/ccsp/wifi", namespaces=["Device.WiFi."])
    BusLayer->>CRSsp: Method Invocation
    CRSsp->>CROps: CcspCrRegisterCapabilities()
    CROps->>CROps: Validate Component in Profile
    CROps->>CROps: Verify Version Match
    CROps->>NSMgr: RegisterNamespaces(component, path, namespaces[])
    NSMgr->>NSMgr: Build Namespace Index
    NSMgr-->>CROps: Success
    CROps->>CROps: Update Component Queue (Registered=True)
    CROps->>CROps: Check System Readiness
    CROps-->>CRSsp: CCSP_SUCCESS
    CRSsp-->>BusLayer: Return Status
    BusLayer-->>WiFi: Registration Confirmed
    
    Note over CROps: If all components registered, publish SystemReady event
```

**Namespace Discovery Flow:**

```mermaid
sequenceDiagram
    participant PAM as CcspPandM
    participant BusLayer as RBus/D-Bus
    participant CRSsp as CR SSP Interface
    participant CROps as CR Operations
    participant NSMgr as Namespace Manager
    
    PAM->>BusLayer: DiscoverComponentSupportingNamespace("Device.WiFi.Radio.1.Enable")
    BusLayer->>CRSsp: Method Invocation
    CRSsp->>CROps: CcspCrDiscoverComponentSupportingNamespace()
    CROps->>NSMgr: FindComponentByNamespace("Device.WiFi.Radio.1.Enable")
    NSMgr->>NSMgr: Prefix Match: "Device.WiFi."
    NSMgr-->>CROps: Component Info (name, bus_path, version)
    CROps-->>CRSsp: Component Array
    CRSsp-->>BusLayer: Return Component Details
    BusLayer-->>PAM: [{"componentName": "com.cisco.spvtg.ccsp.wifi", "busPath": "/com/cisco/spvtg/ccsp/wifi", "subsystem": "eRT."}]
    
    Note over PAM: PAM now knows to contact WiFi component for parameter access
```

**System Readiness Monitoring Flow:**

```mermaid
sequenceDiagram
    participant WebPA as WebPA Agent
    participant BusLayer as RBus
    participant CRRbus as CR RBus Handler
    participant CRMgr as CR Manager
    
    WebPA->>BusLayer: Subscribe("Device.CR.SystemReady")
    BusLayer->>CRRbus: Subscribe Handler
    CRRbus->>CRRbus: Add Subscriber to List
    CRRbus-->>BusLayer: Subscription Confirmed
    BusLayer-->>WebPA: Ack
    
    Note over CRMgr: Component Registrations Continue...
    
    CRMgr->>CRMgr: Last Expected Component Registered
    CRMgr->>CRMgr: Set isSystemReady = 1
    CRMgr->>CRRbus: Notify SystemReady Changed
    CRRbus->>BusLayer: rbusEvent_Publish("Device.CR.SystemReady", value=1)
    BusLayer->>WebPA: Event Notification (SystemReady = 1)
    
    Note over WebPA: WebPA proceeds with cloud connection establishment
```

## Implementation Details

### Major HAL APIs Integration

Component Registry does not directly integrate with HAL APIs. CR operates entirely within the RDK-B middleware layer and interacts with other CCSP components through message bus protocols. The component reads configuration files from the filesystem and uses standard Linux system calls for file I/O operations.

### Key Implementation Logic

- **Device Profile Selection**: CR determines which device profile XML to load by checking for `/nvram/ETHWAN_ENABLE` file existence at startup; if present, loads `cr-ethwan-deviceprofile.xml`, otherwise loads `cr-deviceprofile.xml`
  - Files: `ccsp_cr_profile.c` - `CcspCrLoadDeviceProfile()` function
  
- **Component Version Validation**: Registration requests validate component version against device profile expectations; mismatched versions result in registration rejection with `CCSP_CR_ERR_UNKNOWN_COMPONENT` error
  - Files: `ccsp_cr_operation.c` - `CcspCrRegisterCapabilities()` version check logic
  
- **Namespace Prefix Matching**: Discovery operations use longest-prefix matching algorithm to find owning component for namespace queries
  - Files: Namespace Manager from ccsp-common-library - invoked by `CcspCrDiscoverComponentSupportingNamespace()` in `ccsp_cr_operation.c`
  
- **System Readiness Determination**: CR tracks registered components against expected profile components; system is ready when all profile-defined components have successfully registered capabilities
  - Files: `ccsp_cr_base.c` - `CcspCrIsSystemReady()` function checking component queue registration status

- **IPC Protocol Abstraction**: Build system conditionally compiles RBus or D-Bus interface layers based on `--with-rbus-build` configure option; core CR logic remains protocol-agnostic
  - Files: `Makefile.am` - conditional compilation based on `RBUS_BUILD_ONLY` and `RBUS_BUILD_INTEGRATED` flags
  
- **Error Handling Strategy**: Registration failures log warnings but component operation continues; unknown component registrations are accepted and tracked in separate queue for diagnostic purposes
  - Files: `ccsp_cr_operation.c` - registration validates against profile but does not reject unknown components
  
- **Logging & Debugging**: Both RBus and D-Bus variants use RDK Logger via RDK_LOG macros when `DISABLE_RDK_LOGGER` is not defined; falls back to rtLog functions when RDK Logger is disabled. Also uses CCSP trace macros (AnscTrace) for general trace output.
  - Files: `ssp_main.c`, `ssp_rbus.c`, `ssp_dbus.c`; RDK Logger initialized in main via `RDK_LOGGER_INIT()` when `FEATURE_SUPPORT_RDKLOG` is defined

### Key Configuration Files

Component Registry relies on XML device profile configurations that define expected component topology and namespace allocations for the platform.

| Configuration File | Purpose | Override Mechanisms |
|--------------------|---------|---------------------|
| `/usr/ccsp/cr-deviceprofile.xml` | Standard device profile defining expected CCSP component registrations and namespace allocations | Selected by default; overridden by Ethernet WAN profile if `/nvram/ETHWAN_ENABLE` exists |
| `/usr/ccsp/cr-ethwan-deviceprofile.xml` | Ethernet WAN device profile with modified component topology for Ethernet WAN configurations | Automatically selected when `/nvram/ETHWAN_ENABLE` file is present |
