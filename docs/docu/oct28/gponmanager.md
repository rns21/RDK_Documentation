# GPON Manager Documentation

The GPON Manager is the RDK-B component responsible for managing GPON WAN functionality on fiber-optic broadband devices. This component serves as the primary interface between the RDK-B software stack and the underlying GPON HAL, providing comprehensive management of ONT operations, physical media monitoring, and virtual ethernet interface point (VEIP) management. The GPON Manager enables service providers to deploy fiber-optic broadband services with monitoring, configuration, and state management capabilities. The component provides essential services to the RDK-B ecosystem by maintaining real-time visibility into GPON link status, optical power levels, and physical media characteristics. As a device-level service, it ensures reliable fiber connectivity by monitoring optical signal quality, managing interface states, and providing comprehensive telemetry data for network operations. At the module level, the GPON Manager implements a sophisticated state machine architecture that responds to hardware events, manages configuration persistence, and provides standardized TR-181 data model interfaces for integration with other RDK-B components and external management systems.

```mermaid
graph LR
    subgraph "External Systems"
        ACS[ACS/TR-069 Server]
        NMS[Network Management System]
        OLT[Optical Line Terminal]
    end
    
    subgraph "RDK-B Middleware"

        WM[WAN Manager]
        TR069[TR-069 PA]
        GPON[GPON Manager]
        PSM[PSM]

        CCSP[CCSP Common Library]
    end
    

    subgraph "Platform Layer"
        HAL[(GPON HAL)]
        Kernel[(Linux Kernel)]
        HW[(GPON Hardware)]
    end



    ACS -->|TR-069/CWMP| TR069
    NMS -->|SNMP/HTTP| WM

    TR069 -->|RBus| GPON
    WM -->|RBus| GPON
    GPON -->|RBus| PSM


    GPON -->|JSON RPC| HAL
    HAL -->|Drivers| Kernel
    Kernel -->|Device Interface| HW
    OLT <-->|Optical Signal| HW


    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef middleware fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;

    classDef platform fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;

    
    class ACS,NMS,OLT external;
    class WM,TR069,GPON,PSM,CCSP middleware;


    class HAL,Kernel,HW platform;
```

**Key Features & Responsibilities**: 

- **GPON Physical Media Management**: Monitors and manages physical media characteristics including optical power levels, signal quality, module information, and connection status for GPON interfaces
- **Link State Machine Management**: Implements sophisticated state management for GPON link status transitions, handling up/down states, dormant conditions, and error recovery scenarios
- **VEIP Interface Management**: Manages Virtual Ethernet Interface Point (VEIP) configurations, administrative states, and operational status for ethernet bridging over GPON
- **HAL Event Processing**: Subscribes to and processes hardware abstraction layer events including physical media status changes, alarm conditions, and PLOAM (Physical Layer Operations, Administration and Maintenance) registration states
- **TR-181 Data Model Implementation**: Provides comprehensive TR-181 parameter support for GPON ONT management with BBF-compliant object hierarchy and parameter validation
- **Real-time Telemetry and Monitoring**: Delivers optical power measurements, voltage monitoring, bias current tracking, and alarm threshold management for proactive network maintenance


## Design

The GPON Manager is architected around an event-driven design that integrates HAL interactions with standardized TR-181 data model management. The core design principle centers on responsive state management, where hardware events from the GPON chipset trigger well-defined state transitions that propagate through the system to update interface configurations, publish status changes to dependent components, and maintain persistent configuration state. This reactive architecture ensures minimal latency between hardware state changes and system response, critical for maintaining reliable fiber-optic connectivity.

The design strategically separates concerns through a layered architecture where the hardware abstraction interactions are isolated in dedicated modules, TR-181 data model operations are centralized in specialized data management components, and inter-process communication is handled through dedicated message bus interfaces. The north-bound integration with other RDK-B components utilizes RBus messaging for real-time event publication and TR-181 parameter access, ensuring both immediate notification capabilities and standardized parameter management. The south-bound integration with the GPON HAL leverages JSON-based API calls with schema validation, providing type-safe hardware interactions and enabling comprehensive error handling and recovery mechanisms.

The IPC architecture is designed around RBus messaging patterns, where RBus handles both high-frequency event publication for real-time status updates to components like WAN Manager and structured TR-181 parameter access required by management interfaces and configuration systems. Data persistence is achieved through a hybrid approach combining in-memory state management for operational data with file-based configuration storage for persistent settings, ensuring both performance optimization and reliable state recovery across system restarts.

```mermaid
graph TD
    subgraph RdkGponContainer ["RDK GPON Manager (C/systemd)"]
        subgraph MainManager ["Main Manager Process"]
            Controller[GPON Controller<br/>gponmgr_controller.c]
            StateMachine[Link State Machine<br/>gponmgr_link_state_machine.c]
            SSPMain[SSP Main<br/>ssp_main.c]
            MessageBus[Message Bus Interface<br/>ssp_messagebus_interface.c]
        end
        
        subgraph TR181Layer ["TR-181 Data Model Layer"]
            DMLBackend[DML Backend Manager<br/>gponmgr_dml_backendmgr.c]
            DMLData[DML Data Manager<br/>gponmgr_dml_data.c]
            DMLHAL[DML HAL Interface<br/>gponmgr_dml_hal.c]
            DMLEthInterface[DML Ethernet Interface<br/>gponmgr_dml_eth_iface.c]
            DMLObj[DML Objects<br/>gponmgr_dml_obj.c]
        end
    end

    subgraph ExternalSystems ["External Systems"]
        HALLayer[(GPON HAL<br/>JSON Schema)]
        RBusSys[RBus Message System]
        ConfigFiles[(Configuration Files<br/>JSON/XML)]
        WanMgr[WAN Manager]
    end

    Controller -->|Controls| StateMachine
    Controller -->|Subscribes to HAL events| HALLayer
    StateMachine -->|Updates interface state| DMLEthInterface
    
    SSPMain -->|Initializes| MessageBus
    MessageBus -->|TR-181 Registration| RBusSys
    
    DMLBackend -->|Manages| DMLData
    DMLData -->|HAL Operations| DMLHAL
    DMLHAL -->|JSON API Calls| HALLayer
    
    Controller -->|Publishes events| WanMgr
    DMLBackend -->|Loads config| ConfigFiles
    
    classDef controller fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef dmlLayer fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef external fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    
    class Controller,StateMachine,SSPMain,MessageBus controller;
    class DMLBackend,DMLData,DMLHAL,DMLEthInterface,DMLObj dmlLayer;
    class HALLayer,RBusSys,ConfigFiles,WanMgr external;
```

### Prerequisites and Dependencies

**Build-Time DISTRO Features and Flags:** 

| DISTRO Feature | Purpose | Impact | Recipe Usage |
|----------------|---------|---------|--------------|
| `rdk-b` | Core RDK-B platform support | Enables RDK-B middleware integration | Required for basic functionality |
| `gpon` | GPON-specific functionality | Enables GPON hardware support | Required for GPON operations |
| `wan-manager` | WAN Manager integration | Enables WAN interface coordination | Required for network management |
| `WanManagerUnificationEnable` | WAN Manager unification mode | Changes configuration files and HAL schema selection | `ISRDKB_WAN_UNIFICATION_ENABLED = true/false` |
| `rdkb_wan_manager` | Enhanced WAN Manager features | Adds `FEATURE_RDKB_WAN_MANAGER` compile flag | Optional WAN Manager integration |

**Compile-Time Macros and Build Flags:**

| Macro | Purpose | Default Value | Usage Context |
|-------|---------|---------------|---------------|
| `FEATURE_SUPPORT_RDKLOG` | RDK logging framework support | Always defined | Logging infrastructure |
| `FEATURE_RDKB_WAN_MANAGER` | WAN Manager integration features | Conditional on `rdkb_wan_manager` DISTRO feature | WAN Manager interface |
| `WAN_MANAGER_UNIFICATION_ENABLED` | Unified WAN management mode | Conditional on `WanManagerUnificationEnable` | Architecture selection |
| `ENABLE_SD_NOTIFY` | Systemd notification support | Optional via `--enable-notify` configure flag | Service management |
| `_COSA_SIM_` | Simulation mode for testing | Optional | Testing/simulation |
| `GIT_VERSION` | Git version information | Auto-generated from git describe | Version tracking |

**Autotools Configuration Options:**

| Configure Flag | Purpose | Default | Impact |
|----------------|---------|---------|---------|
| `--enable-notify` | Enable systemd notify support | Disabled | Adds `-DENABLE_SD_NOTIFY` and `-lsystemd` |
| `--with-ccsp-platform=bcm` | Set CCSP platform to Broadcom | bcm | Platform-specific build optimizations |
| `--with-ccsp-arch=arm` | Set CCSP architecture to ARM | arm | Architecture-specific build settings |

**Build Dependencies:** 
- meta-rdk-broadband layer, gpon-hal-headers, ccsp-common-library, rbus (>= 1.0), systemd development packages
- json-hal-lib, dbus, rdk-logger, utopia, hal-platform

**Runtime Configuration and Dependencies:**

**Configuration Files (Runtime Selection):**

| Configuration File | Selection Logic | Key Parameters | Purpose |
|--------------------|-----------------|----------------|---------|
| `gpon_manager_conf.json` | Used when WAN unification is disabled | `hal_schema_path`, `server_port` | Standard GPON Manager configuration |
| `gpon_manager_wan_unify_conf.json` | Used when `WanManagerUnificationEnable` DISTRO feature is enabled | `hal_schema_path`, `server_port` | WAN unification mode configuration |

**HAL Schema Files (Runtime Selection):**

| Schema File | Selection Logic | Purpose |
|-------------|-----------------|---------|
| `gpon_hal_schema.json` | Used when WAN unification is disabled | Standard GPON HAL API schema |
| `gpon_wan_unify_hal_schema.json` | Used when `WanManagerUnificationEnable` is enabled | Unified WAN GPON HAL API schema |

**RDK-B Components and Services:** 
- WAN Manager (for interface coordination), CCSP P&M (for TR-181 support), RBus daemon (for message bus), GPON HAL implementation
- **Systemd Services Order**: rbus.service, ccsp-p-and-m.service must be active before gpon-manager.service initialization

**Hardware and System Requirements:**
- **Hardware**: GPON-capable ONT chipset, SFP/BoB optical module cage, optical transceiver module
- **Message Bus**: RBus registration for real-time event publishing (gpon.* namespace)
- **TR-181 Data Model**: Device.X_RDK_ONT.* object support from CCSP P&M, parameter validation and synchronization mechanisms
- **Startup Order**: HAL initialization → GPON Manager → WAN Manager → Network interface activation sequence

**Performance & Optimization (SHOULD):** 

- **Recommended Hardware**: Multi-core ARM processor (>= 1GHz), dedicated optical signal processing unit, hardware-assisted GPON framing
- **Configuration Tuning**: HAL polling intervals (100ms default), event subscription batch sizes, JSON schema validation caching
- **Monitoring Integration**: Enhanced telemetry via RBus events, syslog integration for optical alarms, SNMP MIB support

**Dependent Components:** 

- WAN Manager depends on GPON Manager for interface status events and link state notifications
- CCSP P&M relies on GPON Manager for TR-181 Device.X_RDK_ONT.* parameter values and validation
- Network configuration scripts depend on VEIP state changes published via RBus messaging
- Failure of GPON Manager results in loss of fiber connectivity management and optical monitoring capabilities

**Threading Model** 

The GPON Manager implements a single-threaded event-driven architecture optimized for deterministic response to hardware events and minimal resource consumption. The main application thread handles all core functionality including HAL event processing, state machine transitions, TR-181 parameter operations, and message bus communications through a centralized event loop mechanism.

- **Threading Architecture**: Single-threaded with event-driven processing loop for optimal performance and simplified synchronization
- **Main Thread**: Handles HAL event subscription/processing, state machine management, TR-181 operations, RBus messaging, and configuration persistence
- **Synchronization**: Mutex-protected data structures for shared GPON data objects, atomic operations for state transitions, event queue serialization
- **Event Processing**: Asynchronous event handling with priority queuing for critical HAL events, deferred processing for non-critical operations

### Component State Flow

**Initialization to Active State**

The GPON Manager follows a structured initialization sequence that ensures all dependencies are properly established before entering active operation. The component progresses through distinct initialization phases including system service startup, message bus registration, HAL connection establishment, configuration loading, and TR-181 parameter registration. Each phase includes comprehensive error handling and rollback mechanisms to ensure system stability.

```mermaid
sequenceDiagram
    autonumber
    participant System
    participant ConfigLoader
    participant TR181
    participant DependencyManager

    System->>System: Start [*] → Initializing
    Note right of System: Initialize logging system<br>Setup signal handlers<br>Load component configuration<br>Setup IPC connections

    System->>ConfigLoader: Component Start → LoadingConfig
    Note right of ConfigLoader: Load syscfg parameters<br>Parse JSON configuration<br>Initialize default values<br>Validate configuration

    ConfigLoader->>TR181: Configuration Loaded → RegisteringTR181
    Note right of TR181: Register TR-181 Objects<br>Create Data Model<br>Setup parameter bindings

    TR181->>DependencyManager: Data Models Registered → ConnectingDeps
    Note right of DependencyManager: Connect to HAL<br>Establish RBus/IPC<br>Initialize state machine<br>Setup event processing

    DependencyManager->>System: All Systems Ready → Active
    Note right of System: Process HAL events<br>Manage state transitions<br>Handle TR-181 requests<br>Monitor health status

    System->>System: Event Trigger → RuntimeStateChange
    System->>System: State Updated → Active

    System->>System: Component Stop → Shutdown → [*]
```

```mermaid
stateDiagram-v2
    [*] --> Initializing
    Initializing --> LoadingConfig: Load Configuration
    LoadingConfig --> RegisteringTR181: Register Data Models
    RegisteringTR181 --> ConnectingDeps: Connect Dependencies
    ConnectingDeps --> Active: All Systems Ready
    Active --> RuntimeStateChange: Event Trigger
    RuntimeStateChange --> Active: State Updated
    Active --> Shutdown: Stop Request
    Shutdown --> [*]

    note right of Initializing
        - Initialize logging system
        - Setup signal handlers
        - Load component configuration
        - Setup IPC connections
    end note

    note right of Active
        - Process HAL events
        - Manage state transitions
        - Handle TR-181 requests
        - Monitor health status
    end note
```

**Runtime State Changes and Context Switching**

During normal operation, the GPON Manager responds to various hardware and software events that trigger state changes in the link state machine and interface management subsystems. These state changes are driven by optical signal quality variations, administrative commands, configuration updates, and hardware fault conditions.

**State Change Triggers:**

- Physical media status changes (optical power loss, signal degradation, module insertion/removal)
- Administrative state modifications via TR-181 parameter updates or management interface commands
- VEIP operational state transitions based on ethernet bridging status and lower layer availability
- PLOAM registration state changes affecting ONT authentication and service provisioning

**Context Switching Scenarios:**

- Link state transitions between Up/Down/Dormant states based on optical signal quality and registration status
- VEIP administrative state changes triggering interface enable/disable operations and WAN Manager notifications
- Configuration reload operations requiring temporary suspension of event processing and state machine reset
- Error recovery scenarios involving HAL reconnection, state machine reinitialization, and service restoration

### Call Flow

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant Init as Initialization Process
    participant Comp as GPON Manager
    participant DM as Data Model
    participant Deps as Dependencies

    Init->>Comp: Start Component
    Comp->>Comp: Load Configuration
    Comp->>DM: Register TR-181 Parameters
    DM-->>Comp: Registration Complete
    Comp->>Deps: Connect to Dependencies
    Deps-->>Comp: Connection Established
    Comp->>Init: Initialization Complete (Active State)
```

**Request Processing Call Flow:**

```mermaid
sequenceDiagram
    participant SSP as SSP Main
    participant MB as Message Bus
    participant Controller as GPON Controller
    participant HAL as GPON HAL
    participant SM as State Machine
    participant WM as WAN Manager

    SSP->>MB: Initialize RBus Connection
    MB-->>SSP: Connection Established
    SSP->>Controller: Initialize GPON Controller
    Controller->>HAL: Subscribe to HAL Events (PM, VEIP, PLOAM)
    HAL-->>Controller: Event Subscription Confirmed
    Controller->>SM: Initialize Link State Machine
    SM-->>Controller: State Machine Ready
    SSP->>MB: Register TR-181 Parameters
    MB-->>SSP: Registration Complete (Active State)
    
    Note over SSP,WM: Runtime Event Processing
    
    HAL->>Controller: Physical Media Status Event
    Controller->>SM: Process Status Change
    SM->>SM: Update Link State
    SM->>Controller: State Change Complete
    Controller->>WM: Publish Interface Status Event
    Controller->>MB: Update TR-181 Parameters
```

## TR‑181 Data Models

### Supported TR-181 Parameters

The GPON Manager implements comprehensive TR-181 parameter support following BBF TR-181 Issue 2 specification guidelines with custom RDK extensions for GPON-specific functionality. The implementation provides full CRUD operations for configuration parameters and read-only access to operational status and telemetry data.

### Object Hierarchy

```
Device.
└── X_RDK_ONT.
    ├── PhysicalMedia.{i}.
    │   ├── Cage (string, R)
    │   ├── ModuleVendor (string, R)
    │   ├── ModuleName (string, R)
    │   ├── ModuleVersion (string, R)
    │   ├── ModuleFirmwareVersion (string, R)
    │   ├── PonMode (string, R)
    │   ├── Connector (string, R)
    │   ├── NominalBitRateDownstream (uint32, R)
    │   ├── NominalBitRateUpstream (uint32, R)
    │   ├── Enable (boolean, R/W)
    │   ├── Status (string, R)
    │   ├── RedundancyState (string, R)
    │   ├── Alias (string, R/W)
    │   ├── LastChange (uint32, R)
    │   ├── LowerLayers (string, R/W)
    │   ├── Upstream (boolean, R)
    │   ├── RxPower.
    │   │   ├── SignalLevel (int, R)
    │   │   ├── SignalLevelLowerThreshold (int, R/W)
    │   │   └── SignalLevelUpperThreshold (int, R/W)
    │   ├── TxPower.
    │   │   ├── SignalLevel (int, R)
    │   │   ├── SignalLevelLowerThreshold (int, R/W)
    │   │   └── SignalLevelUpperThreshold (int, R/W)
    │   ├── Voltage.
    │   │   └── VoltageLevel (int, R)
    │   └── Bias.
    │       └── BiasLevel (uint32, R)
    └── VEIP.{i}.
        ├── Enable (boolean, R/W)
        ├── Status (string, R)
        ├── Alias (string, R/W)
        └── EthernetInterface (string, R/W)
```

### Parameter Definitions

**Core Parameters:**

| Parameter Path | Data Type | Access | Default Value | Description | BBF Compliance |
|----------------|-----------|--------|---------------|-------------|----------------|
| `Device.X_RDK_ONT.PhysicalMedia.{i}.Enable` | boolean | R/W | `true` | Enables or disables the physical media interface. When false, the interface is administratively disabled and will not establish optical link. | Custom Extension |
| `Device.X_RDK_ONT.PhysicalMedia.{i}.Status` | string | R | `"Down"` | Current operational status of the physical media. Enumerated values: Up, Down, Unknown, Dormant, NotPresent, LowerLayerDown, Error | TR-181 Issue 2 |
| `Device.X_RDK_ONT.PhysicalMedia.{i}.Cage` | string | R | `"SFP"` | Type of optical module cage. Enumerated values: BoB(0), SFP(1) indicating Board-on-Board or Small Form-factor Pluggable configuration | Custom Extension |
| `Device.X_RDK_ONT.PhysicalMedia.{i}.PonMode` | string | R | `"GPON"` | PON technology mode. Enumerated values: GPON(0), XG-PON(1), NG-PON2(2), XGS-PON2(3) | Custom Extension |
| `Device.X_RDK_ONT.PhysicalMedia.{i}.RxPower.SignalLevel` | int | R | `0` | Received optical power level in dBm multiplied by 10000 for precision. Negative values indicate power below 0 dBm | Custom Extension |
| `Device.X_RDK_ONT.PhysicalMedia.{i}.TxPower.SignalLevel` | int | R | `0` | Transmitted optical power level in dBm multiplied by 10000 for precision | Custom Extension |
| `Device.X_RDK_ONT.VEIP.{i}.Enable` | boolean | R/W | `false` | Administrative state of the Virtual Ethernet Interface Point. Controls ethernet bridging functionality | Custom Extension |
| `Device.X_RDK_ONT.VEIP.{i}.Status` | string | R | `"Down"` | Operational status of VEIP interface. Values: Up, Down, Error, Unknown | Custom Extension |

**Custom Extensions:**

- **Device.X_RDK_ONT Object Tree**: Complete RDK-specific GPON ONT management object hierarchy not defined in standard BBF TR-181 specifications
- **Optical Power Monitoring**: Comprehensive RX/TX power measurement and threshold management for proactive optical network maintenance
- **VEIP Management**: Virtual Ethernet Interface Point configuration enabling ethernet service delivery over GPON infrastructure
- **PON Mode Detection**: Multi-generation PON technology support including GPON, XG-PON, and next-generation variants

### Parameter Registration and Access

- **Implemented Parameters**: All Device.X_RDK_ONT.* parameters including PhysicalMedia table entries, VEIP configurations, optical power telemetry, and administrative controls
- **Parameter Registration**: Parameters are registered via RBus message bus for real-time event publication and structured TR-181 access by management interfaces
- **Access Mechanism**: External components access parameters through standard CCSP P&M interfaces using IPC method calls with automatic parameter validation and type conversion
- **Validation Rules**: Administrative parameters undergo range checking, enumeration validation, and dependency verification before application to hardware

## Internal Modules

The GPON Manager is structured around modules that handle distinct aspects of GPON functionality, from hardware abstraction to data model management. Each module is designed with clear responsibilities and well-defined interfaces to ensure maintainability and extensibility.

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| GPON Controller | Central orchestration module responsible for HAL event subscription, state machine coordination, and inter-component communication. Manages the primary event processing loop and coordinates responses to hardware state changes. | `gponmgr_controller.c`, `gponmgr_controller.h` |
| Link State Machine | Implements the core state machine logic for GPON link management, handling transitions between Up, Down, Dormant, and Error states based on hardware conditions and administrative commands. | `gponmgr_link_state_machine.c`, `gponmgr_link_state_machine.h` |
| SSP Main | Service Startup Process main module providing component initialization, signal handling, and integration with RDK-B service management infrastructure. | `ssp_main.c`, `ssp_global.h`, `ssp_internal.h` |
| Message Bus Interface | Abstraction layer for RBus communications, providing unified interfaces for event publication, parameter registration, and inter-process messaging. | `ssp_messagebus_interface.c`, `ssp_messagebus_interface.h` |
| DML Backend Manager | TR-181 Data Model Layer backend management providing the foundation for parameter operations, data validation, and persistence mechanisms. | `gponmgr_dml_backendmgr.c`, `gponmgr_dml_backendmgr.h` |
| DML Data Manager | Central data structure management for all GPON operational and configuration data, including thread-safe access patterns and memory management. | `gponmgr_dml_data.c`, `gponmgr_dml_data.h` |
| DML HAL Interface | Hardware Abstraction Layer communication module providing JSON-based API calls, schema validation, and error handling for hardware interactions. | `gponmgr_dml_hal.c`, `gponmgr_dml_hal.h` |
| DML Ethernet Interface | VEIP (Virtual Ethernet Interface Point) management module handling ethernet interface configuration, state tracking, and WAN Manager integration. | `gponmgr_dml_eth_iface.c`, `gponmgr_dml_eth_iface.h` |

```mermaid
flowchart TD
    subgraph GponManagerComponent ["GPON Manager Component"]
        Controller[GPON Controller<br/>Event Subscription & Management]
        StateMachine[Link State Machine<br/>VEIP Interface State Management]
        SSPMain[SSP Main<br/>Component Initialization]
        MessageBus[Message Bus Interface<br/>RBus Communication]
        
        DMLBackend[DML Backend Manager<br/>TR-181 Backend Operations]
        DMLData[DML Data Manager<br/>Data Structure Management]
        DMLHAL[DML HAL Interface<br/>HAL Communication Layer]
        DMLEthIface[DML Ethernet Interface<br/>VEIP Interface Management]
        DMLObj[DML Objects<br/>TR-181 Object Management]
    end

    Controller --> StateMachine
    Controller --> DMLHAL
    StateMachine --> DMLEthIface
    SSPMain --> MessageBus
    MessageBus --> DMLBackend
    DMLBackend --> DMLData
    DMLData --> DMLHAL
    DMLData --> DMLObj
    DMLObj --> DMLEthIface
    
    classDef core fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef dml fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    
    class Controller,StateMachine,SSPMain,MessageBus core;
    class DMLBackend,DMLData,DMLHAL,DMLEthIface,DMLObj dml;
```

## Component Interactions

The GPON Manager maintains extensive interactions with both RDK-B middleware components and external systems through well-defined communication patterns. These interactions enable comprehensive fiber-optic network management while maintaining loose coupling with dependent systems.

```mermaid
flowchart TD
    subgraph "External Services"
        CloudMgmt[Cloud Management<br/>TR-069/CWMP]
        OLT[OLT/ONU Management<br/>GPON Protocol]
        NetAdmin[Network Administrator<br/>WebUI/CLI]
    end
    
    subgraph "RDK-B Middleware"
        WanManager[WAN Manager<br/>Interface Management]
        CcspPandM[CCSP P&M<br/>Parameter Management]
        RBusDaemon[RBus Daemon<br/>Message Bus]
        Telemetry[Telemetry<br/>Data Collection]
    end
    
    subgraph "System Layer"
        HALLayer[GPON HAL<br/>Hardware Abstraction]
        ConfigStore[Configuration Storage<br/>File System]
        SystemD[SystemD<br/>Service Management]
    end
    
    GponManager -->|Interface Events| WanManager
    GponManager -->|TR-181 Parameters| CcspPandM
    GponManager -->|Event Publishing| RBusDaemon
    GponManager -->|Metrics Publishing| Telemetry
    
    GponManager -->|JSON API Calls| HALLayer
    GponManager -->|Config Persistence| ConfigStore
    GponManager -->|Service Status| SystemD
    
    CloudMgmt -->|Remote Management| GponManager
    NetAdmin -->|Configuration| GponManager
    OLT -->|Optical Signals| HALLayer
```

### Interaction Matrix

| Target Component/Layer | Interaction Purpose | IPC Mechanism | Message Format | Communication Pattern | Key APIs/Endpoints |
|------------------------|-------------------|---------------|----------------|---------------------|------------------|
| **RDK-B Middleware Components** |
| WAN Manager | Interface status synchronization and link state notifications | RBus Events | JSON Event Payload | Publisher-Subscriber | `Device.X_RDK_Ethernet.Interface.Status`, `gpon.interface.status` |
| CCSP P&M | TR-181 parameter management and data model operations | IPC Method Calls| CCSP DML Protocol | Request-Response | `GetParameterValues()`, `SetParameterValues()`, `GetParameterNames()` |
| RBus Daemon | Real-time event publication and component discovery | RBus Messaging | JSON Event Schema | Event-Driven | `rbus_open()`, `rbusEvent_Publish()`, `rbusMethod_InvokeAsync()` |
| **System & HAL Layers** |
| GPON HAL | Hardware control and status monitoring | JSON API Calls | JSON HAL Schema | Synchronous Function Calls | `gpon_getParameters()`, `gpon_setParameters()`, `gpon_subscribeEvent()` |
| Configuration Storage | Persistent configuration and state management | File I/O Operations | JSON Configuration Files | File-based Operations | `/etc/rdk/gpon_manager_conf.json`, `/etc/rdk/schemas/` |
| **External Systems** |
| Cloud Management | Remote device management and provisioning | TR-069/CWMP | TR-181 Protocol | Request-Response | TR-069 ACS communication via CCSP TR-069 PA |

**Events Published by GPON Manager:**

| Event Name | Event Topic/Path | Trigger Condition | Payload Format | Subscriber Components |
|------------|-----------------|-------------------|----------------|---------------------|
| PhysicalMediaStatusChange | `gpon.physicalmedia.status` | Physical media link state transitions (Up/Down/Error) | JSON: `{instance, status, timestamp, details}` | WAN Manager, Telemetry |
| OpticalPowerAlarm | `gpon.opticalalarm` | RX/TX power threshold violations | JSON: `{type, level, threshold, severity, timestamp}` | Network Management, Telemetry |
| VEIPStateChange | `gpon.veip.state` | VEIP administrative or operational state changes | JSON: `{veip_id, admin_state, oper_state, ethernet_interface}` | WAN Manager, Interface Manager |
| PloamRegistrationState | `gpon.ploam.registration` | ONT registration state with OLT changes | JSON: `{registration_state, olt_id, timestamp}` | Network Management, Telemetry |

**Events Consumed by GPON Manager:**

| Event Source | Event Topic/Path | Purpose | Expected Payload | Handler Function |
|-------------|-----------------|---------|------------------|------------------|
| GPON HAL | `gpon.hal.physicalmedia.status` | React to hardware-level physical media state changes | JSON: `{instance, new_status, old_status}` | `eventcb_PhysicalMediaStatus()` |
| GPON HAL | `gpon.hal.veip.adminstate` | Handle VEIP administrative state changes from hardware | JSON: `{veip_id, admin_state}` | `eventcb_VeipAdministrativeState()` |
| System Configuration | `system.config.reload` | Reload component configuration from persistent storage | JSON: `{config_path, component}` | `config_reload_handler()` |

### IPC Flow Patterns

**Primary IPC Flow - Parameter Access:**

```mermaid
sequenceDiagram
    participant Client as Management Client
    participant CCSP as CCSP P&M
    participant GponMgr as GPON Manager
    participant HAL as GPON HAL

    Client->>CCSP: GetParameterValues("Device.X_RDK_ONT.PhysicalMedia.1.Status")
    CCSP->>GponMgr: IPC Method Call
    GponMgr->>HAL: JSON API Call (getParameters)
    HAL-->>GponMgr: JSON Response (status data)
    GponMgr-->>CCSP: Parameter Value
    CCSP-->>Client: Response (success/error)
```

**Event Notification Flow:**

```mermaid
sequenceDiagram
    participant HAL as GPON HAL
    participant GponMgr as GPON Manager
    participant RBus as RBus Daemon
    participant WanMgr as WAN Manager
    participant Telemetry as Telemetry

    HAL->>GponMgr: Event Notification (Physical Media Status Change)
    GponMgr->>GponMgr: Process Event & Update State Machine
    GponMgr->>RBus: Publish Event (gpon.physicalmedia.status)
    RBus->>WanMgr: Event Delivery (Interface Status)
    RBus->>Telemetry: Event Delivery (Metrics Collection)
    WanMgr-->>GponMgr: Ack (if required)
    Telemetry-->>GponMgr: Ack (if required)
```

## Implementation Details

### Major HAL APIs Integration

The GPON Manager integrates with the hardware abstraction layer through a comprehensive JSON-based API that provides type-safe communication and schema validation. The HAL interface follows a standardized pattern for parameter operations, event subscriptions, and hardware control.

**Core HAL APIs:**

| HAL API | Purpose | Parameters | Return Values | Implementation File |
|---------|---------|------------|---------------|-------------------|
| `gpon_getParameters` | Retrieve hardware parameter values including optical power, module information, and status data | `{moduleName, action, parameters[]}` | `{status, result, parameters[]}` | `gponmgr_dml_hal.c` |
| `gpon_setParameters` | Configure hardware parameters such as power thresholds and administrative states | `{moduleName, action, parameters[]}` | `{status, result}` | `gponmgr_dml_hal.c` |
| `gpon_subscribeEvent` | Subscribe to hardware event notifications for real-time status monitoring | `{moduleName, action, eventName, subscriptionType}` | `{status, subscriptionId}` | `gponmgr_controller.c` |
| `gpon_getSchema` | Retrieve HAL schema definitions for parameter validation and API discovery | `{schemaVersion, moduleName}` | `{status, schema}` | `gponmgr_dml_hal.c` |
| `gpon_publishEvent` | Receive asynchronous event notifications from hardware layer | `{eventName, eventData, timestamp}` | Event callback processing | `gponmgr_controller.c` |

### Key Implementation Logic

- **State Machine Engine**: The core state machine implementation resides in `gponmgr_link_state_machine.c` and provides deterministic state transitions for GPON link management. The engine processes hardware events, administrative commands, and timeout conditions to maintain accurate interface state representation. State transition logic includes comprehensive error handling, recovery mechanisms, and event logging for operational visibility.

- **Event Processing**: Hardware events are processed through a centralized event handling mechanism in `gponmgr_controller.c` that subscribes to HAL notifications for physical media status, VEIP state changes, and PLOAM registration events. The event processing includes priority-based queuing, event correlation, and automatic retry mechanisms for failed operations.

- **Error Handling Strategy**: Error detection and recovery mechanisms are implemented throughout the component with graduated response levels including automatic retry for transient failures, state machine reset for persistent errors, and component restart for critical failures. Error conditions are logged with appropriate severity levels and propagated to dependent components through status parameter updates.

- **Logging & Debugging**: The component implements comprehensive logging using RDK-B standard logging facilities with configurable verbosity levels for different subsystems. Debug capabilities include HAL communication tracing, state machine transition logging, and event flow monitoring with specialized debug hooks for troubleshooting optical connectivity issues.

### Key Configuration Files

| Configuration File | Purpose | Key Parameters | Default Values | Override Mechanisms |
|--------------------|---------|---------------|----------------|--------------------|
| `gpon_manager_conf.json` | Main component configuration | `hal_schema_path`, `server_port` | `/etc/rdk/schemas/gpon_hal_schema.json`, `40100` | Environment variables, command line |
| `gpon_hal_schema.json` | HAL API schema validation | Schema version, parameter definitions, action types | Version 0.0.1 schema | HAL vendor updates |
| `RdkGponManager.xml` | TR-181 data model definitions | Object hierarchy, parameter mappings, function bindings | TR-181 compliant defaults | Compile-time configuration |
| `gpon_manager_wan_unify_conf.json` | WAN unification configuration | Interface mappings, event subscriptions | WAN Manager integration settings | Build flags, runtime detection |
