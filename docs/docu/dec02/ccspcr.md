# Component Registry (CR) Documentation

The Component Registry (CR) serves as the central service discovery and component management system in the RDK-B middleware architecture. It maintains a comprehensive registry of all CCSP (Common Component Software Platform) components, their capabilities, supported namespaces, and provides dynamic service discovery mechanisms to enable inter-component communication and coordination across the RDK-B ecosystem.

The CR acts as the foundational infrastructure service that enables the distributed component architecture of RDK-B, allowing components to register their capabilities, discover other components, and establish communication paths. It manages component lifecycle events, maintains namespace ownership, and provides the essential coordination layer that allows the modular RDK-B middleware to function as a cohesive system while supporting both traditional D-Bus and modern RBus communication protocols.

The Component Registry is positioned as a core infrastructure component that interfaces directly with all other RDK-B middleware components, external management systems, and the underlying platform services. It operates as the authoritative source for component topology and capabilities within the RDK-B stack.

```mermaid
graph TD
    subgraph "External Management Systems"
        WebUI[Web UI Management]
        TR069[TR-069 ACS Server]
        SNMP[SNMP Management]
    end
    
    subgraph "RDK-B Middleware Layer"
        CR[Component Registry<br/>CcspCrSsp]
        PSM[Parameter Storage<br/>Manager]
        PAM[Protocol & Application<br/>Manager]
        CM[Cable Modem<br/>Agent]
        WiFi[WiFi Agent]
        MTA[MTA Agent]
        TDM[Test & Diagnostics<br/>Manager]
    end
    
    subgraph "Communication Layer"
        RBus[(RBus Message Bus)]
        DBus[(D-Bus)]
    end
    
    subgraph "Platform & HAL Layer"
        HAL[(Hardware Abstraction Layer)]
        Linux[(Linux OS & Services)]
    end

    WebUI -->|Component Discovery| CR
    TR069 -->|Component Status| CR
    SNMP -->|SNMP Queries| CR
    
    PSM <-->|Register/Discover| CR
    PAM <-->|Register/Discover| CR
    CM <-->|Register/Discover| CR
    WiFi <-->|Register/Discover| CR
    MTA <-->|Register/Discover| CR
    TDM <-->|Register/Discover| CR
    
    CR <-->|Message Bus| RBus
    CR <-->|Legacy IPC| DBus
    
    CR -->|Configuration| Linux
    CR -->|System Events| HAL

    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef component fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef communication fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef platform fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    
    class WebUI,TR069,SNMP external;
    class CR,PSM,PAM,CM,WiFi,MTA,TDM component;
    class RBus,DBus communication;
    class HAL,Linux platform;
```


```mermaid
graph LR
    subgraph "External Systems"
        RemoteMgmt["Remote Management"]
        LocalUI["Local Web UI"]
    end

    subgraph "RDK-B Platform"
        subgraph "Remote Management Agents"
            ProtocolAgents["TR-069/TR-369/SNMP<br/>Protocol Agents"]
            WebPA["WebPA Agent"]
            LocalMgmt["Local Management<br/>Interface"]
        end
        
        subgraph "Component Registry Layer"
            CR["Component Registry<br/>CcspCrSsp"]
        end
        
        subgraph "RDK-B Middleware Components"
            PSM["Parameter Storage<br/>Manager"]
            PAM["Protocol & Application<br/>Manager"]
            CMAgent["Cable Modem<br/>Agent"]
            WiFiAgent["WiFi Agent"]
            MTAAgent["MTA Agent"]
            TDAgent["Test & Diagnostics<br/>Agent"]
        end
    end

    subgraph "System & Platform Layer"
        MessageBus["RBus/D-Bus<br/>Message Bus"]
        SysConfig["System Configuration<br/>Framework"]
        Linux["Linux OS & Services"]
    end

    %% External connections
    RemoteMgmt -->|TR-069/TR-369/SNMP| ProtocolAgents
    LocalUI -->|HTTP/HTTPS| LocalMgmt

    %% Upper layer to Component Registry
    ProtocolAgents -->|Component Discovery| CR
    WebPA -->|Component Status| CR
    LocalMgmt -->|Administrative Commands| CR

    %% Component Registry to Other RDK-B Components
    CR <-->|Register/Discover| PSM
    CR <-->|Register/Discover| PAM
    CR <-->|Register/Discover| CMAgent
    CR <-->|Register/Discover| WiFiAgent
    CR <-->|Register/Discover| MTAAgent
    CR <-->|Register/Discover| TDAgent

    %% Component Registry to Platform Layer
    CR <-->|IPC| MessageBus
    CR <-->|Configuration| SysConfig

    %% System integration
    MessageBus <-->|Platform Services| Linux
    SysConfig <-->|System Configuration| Linux
    PSM <-->|Persistence| SysConfig

    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef crLayer fill:#e3f2fd,stroke:#1976d2,stroke-width:3px;
    classDef rdkbComponent fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef system fill:#fce4ec,stroke:#c2185b,stroke-width:2px;

    class RemoteMgmt,LocalUI external;
    class CR crLayer;
    class ProtocolAgents,WebPA,LocalMgmt,PSM,PAM,CMAgent,WiFiAgent,MTAAgent,TDAgent rdkbComponent;
    class MessageBus,SysConfig,Linux system;
```

**Key Features & Responsibilities**: 

- **Component Registration & Discovery**: Maintains a centralized registry of all CCSP components, their capabilities, supported namespaces, and enables dynamic service discovery across the RDK-B middleware stack
- **Namespace Management**: Provides authoritative namespace ownership and resolution services, ensuring proper data model hierarchy and preventing namespace conflicts between components 
- **Inter-Component Communication Facilitation**: Acts as the broker for component-to-component communication by providing discovery services and maintaining communication pathways for both D-Bus and RBus protocols
- **Device Profile Management**: Loads and manages device-specific component profiles that define which components should be available on different hardware platforms and configurations
- **Component Lifecycle Tracking**: Monitors component health, availability, and lifecycle events including registration, deregistration, and failure recovery scenarios
- **Data Model Export**: Supports export of complete data model information in industry-standard formats for integration with external management systems and compliance validation


## Design

The Component Registry is architected as a centralized service discovery and component coordination system that follows the CCSP architectural principles. The design emphasizes modularity, protocol flexibility, and robust component lifecycle management to support the distributed nature of RDK-B middleware.

The core design principle centers around maintaining a single source of truth for component capabilities and namespace ownership while supporting multiple communication protocols (D-Bus and RBus). The CR operates as a stateful service that persists component registration information and provides both synchronous discovery services and asynchronous event notification capabilities.

The design integrates multiple IPC mechanisms to support both legacy D-Bus-based components and modern RBus-enabled components, ensuring backward compatibility while enabling migration to newer communication technologies. The component registry maintains persistent storage integration for configuration and state management through system configuration services and supports dynamic reconfiguration without service disruption.

The architecture includes comprehensive error handling and recovery mechanisms, with built-in health monitoring and component failure detection. The design supports horizontal scaling through multiple CR instances in complex deployments while maintaining consistency through coordinated namespace management.

Data persistence is achieved through integration with the Linux system configuration framework (syscfg) and XML-based device profile storage. The CR maintains transient runtime state in memory for performance while persisting critical configuration and registration data through the platform's configuration management services.

```mermaid
graph TD
    subgraph "Component Registry Container (Linux Process)"
        subgraph "CrSsp Layer (Service Provider)"
            MainLoop[Main Service Loop<br/>ssp_main.c]
            DBusIf[D-Bus Interface<br/>ssp_dbus.c]
            RBusIf[RBus Interface<br/>ssp_rbus.c]
            CmdProc[Command Processor<br/>ssp_cmd.c]
        end

        subgraph "CCSP_CR Core Engine"
            CRMgr[CR Manager<br/>ccsp_cr_base.c]
            RegOps[Registration Operations<br/>ccsp_cr_operation.c]
            Profile[Profile Manager<br/>ccsp_cr_profile.c]
            Session[Session Manager<br/>ccsp_cr_session.c]
            Utility[Utility Functions<br/>ccsp_cr_utility.c]
            DataExport[Data Model Export<br/>ccsp_cr_exportDM.c]
        end
    end

    subgraph "External Dependencies"
        DeviceProfiles[(Device Profile XML<br/>cr-deviceprofile*.xml)]
        SysConfig[(System Configuration<br/>syscfg)]
        MessageBus[(Message Bus<br/>RBus/D-Bus)]
    end

    MainLoop -->|Initialize| CRMgr
    MainLoop -->|Setup IPC| DBusIf
    MainLoop -->|Setup IPC| RBusIf
    
    DBusIf -->|D-Bus Calls| RegOps
    RBusIf -->|RBus Methods| RegOps
    CmdProc -->|CLI Commands| RegOps
    
    CRMgr -->|Load Profiles| Profile
    CRMgr -->|Manage Sessions| Session
    RegOps -->|Component Registry| CRMgr
    RegOps -->|Export Data| DataExport
    RegOps -->|Utility Functions| Utility
    
    Profile -->|Read Profiles| DeviceProfiles
    CRMgr -->|Persist Config| SysConfig
    DBusIf <-->|IPC| MessageBus
    RBusIf <-->|IPC| MessageBus

    classDef service fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef core fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef external fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    
    class MainLoop,DBusIf,RBusIf,CmdProc service;
    class CRMgr,RegOps,Profile,Session,Utility,DataExport core;
    class DeviceProfiles,SysConfig,MessageBus external;
```

```mermaid
flowchart TD
    subgraph "Component Registry Architecture"
        subgraph "Service Provider Layer"
            Main([Main Service<br/>ssp_main.c])
            DBus([D-Bus Interface<br/>ssp_dbus.c])
            RBus([RBus Interface<br/>ssp_rbus.c])
            Cmd([Command Processor<br/>ssp_cmd.c])
        end
        
        subgraph "Core Engine Layer"
            Manager([CR Manager<br/>ccsp_cr_base.c])
            Operations([Registration Ops<br/>ccsp_cr_operation.c])
            Profile([Profile Manager<br/>ccsp_cr_profile.c])
            Session([Session Manager<br/>ccsp_cr_session.c])
            Utility([Utility Functions<br/>ccsp_cr_utility.c])
            Export([Data Export<br/>ccsp_cr_exportDM.c])
        end
    end
    
    Main --> Manager
    DBus --> Operations
    RBus --> Operations
    Cmd --> Operations
    
    Manager --> Profile
    Manager --> Session
    Operations --> Manager
    Operations --> Utility
    Operations --> Export
```

### Prerequisites and Dependencies

**Build-Time Flags and Configuration:**

| Configure Option | DISTRO Feature | Build Flag | Purpose | Default |
|------------------|----------------|------------|---------|---------|
| `--enable-notify` | `systemd` | `ENABLE_SD_NOTIFY` | Enable systemd service notification support for process lifecycle management | Disabled |
| `--enable-gtestapp` | N/A | `GTEST_ENABLE` | Enable Google Test framework support for unit testing and validation | Disabled |
| `--with-rbus-build=integrated` | N/A | `RBUS_BUILD_INTEGRATED` | Enable integrated RBus and D-Bus communication support | Integrated |
| `--with-rbus-build=only` | N/A | `RBUS_BUILD_ONLY` | Enable RBus-only communication without D-Bus legacy support | Disabled |
| `--with-rbus-build=none` | N/A | `RBUS_BUILD_NONE` | Disable RBus communication, D-Bus only mode | Disabled |

**RDK-B Platform and Integration Requirements (MUST):**

- **RDK-B Components**: None (CR is foundational - other components depend on it)
- **HAL Dependencies**: None (CR operates at middleware layer)
- **Systemd Services**: Basic system services must be active before CR starts (`dbus.service` for D-Bus support)
- **Message Bus**: RBus daemon (`rbusd`) for RBus builds, D-Bus system daemon for D-Bus builds
- **Configuration Files**: Device profile XML files in `/etc/` or component config directories (`cr-deviceprofile_embedded.xml`, `cr-ethwan-deviceprofile.xml`)
- **Startup Order**: CR must start early in RDK-B boot sequence before other CCSP components

**Threading Model** 

The Component Registry implements a single-threaded event-driven architecture with synchronous request processing to ensure data consistency and avoid race conditions in component registration state management.

- **Threading Architecture**: Single-threaded with event-driven message processing
- **Main Thread**: Handles all IPC requests, component registration/discovery operations, profile loading, and session management
- **Event Processing**: Synchronous processing of D-Bus and RBus method calls with no worker thread pool
- **Synchronization**: Not applicable - single-threaded design eliminates need for synchronization primitives

### Component State Flow

**Initialization to Active State**

The Component Registry follows a structured initialization sequence that establishes the service infrastructure, loads device profiles, and prepares for component registration requests. The initialization process is critical as other RDK-B components depend on CR availability for their own startup sequence.

```mermaid
sequenceDiagram
    participant System as System Startup
    participant CR as Component Registry
    participant Profile as Profile Manager  
    participant IPC as IPC Layer (D-Bus/RBus)
    participant Config as Configuration

    System->>CR: Start CcspCrSsp Process
    Note over CR: State: Initializing<br/>Setup logging, memory management
    
    CR->>Config: Load System Configuration
    Config-->>CR: Configuration Loaded
    Note over CR: State: Initializing → LoadingProfiles
    
    CR->>Profile: Load Device Profiles
    Profile->>Profile: Parse XML Device Profiles
    Profile-->>CR: Device Profiles Loaded
    Note over CR: State: LoadingProfiles → InitializingIPC
    
    CR->>IPC: Initialize Message Bus
    IPC->>IPC: Register D-Bus/RBus Methods
    IPC-->>CR: IPC Ready
    Note over CR: State: InitializingIPC → Active
    
    CR->>System: Initialization Complete (Ready for Registrations)
    
    loop Runtime Operations
        Note over CR: State: Active<br/>Process component registrations & discoveries
        CR->>CR: Handle Registration/Discovery Requests
    end
    
    System->>CR: Shutdown Request
    Note over CR: State: Active → Shutdown
    CR->>System: Shutdown Complete
```

**Runtime State Changes and Context Switching**

The Component Registry maintains minimal runtime state changes during normal operation. The primary state transitions occur during component registration/deregistration cycles and system configuration updates.

**State Change Triggers:**

- Component registration requests trigger addition to internal component registry
- Component deregistration or failure detection triggers cleanup of component records
- Device profile updates or system reconfiguration may trigger profile reloading
- System shutdown requests trigger graceful component notification and cleanup

**Context Switching Scenarios:**

- Profile reloading during runtime configuration updates
- Failover handling when components become unavailable or unresponsive
- Migration between D-Bus and RBus communication modes based on component capabilities

### Call Flow

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant Init as System Init
    participant CR as Component Registry
    participant ProfileMgr as Profile Manager
    participant IPC as IPC Layer

    Init->>CR: Start CcspCrSsp
    CR->>CR: Initialize Base CR Manager
    CR->>ProfileMgr: Load Device Profiles
    ProfileMgr-->>CR: Profiles Loaded
    CR->>IPC: Setup D-Bus/RBus Interfaces  
    IPC-->>CR: IPC Interfaces Ready
    CR->>Init: CR Ready for Component Registrations
```

**Request Processing Call Flow:**

```mermaid
sequenceDiagram
    participant Component as CCSP Component
    participant CR as Component Registry
    participant Registry as Internal Registry
    participant Profile as Profile Manager

    Component->>CR: Register Component Capabilities
    CR->>Registry: Validate Registration Request
    Registry->>Profile: Check Against Device Profile
    Profile-->>Registry: Validation Result
    Registry-->>CR: Registration Processed
    CR-->>Component: Registration Confirmation
    
    Note over CR: Component now available for discovery
    
    Component->>CR: Discover Components by Namespace
    CR->>Registry: Query Component Registry
    Registry-->>CR: Matching Components List
    CR-->>Component: Discovery Response
```

## Internal Modules

The Component Registry is structured into two primary layers: the Service Provider layer (CrSsp) that handles external interfaces and communication protocols, and the Core Engine layer (CCSP_CR) that implements the component registry logic and operations.

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| **Service Provider Layer (CrSsp)** |
| Main Service | Primary service entry point, initialization, and lifecycle management | `ssp_main.c`, `ssp_global.h` |
| D-Bus Interface | Legacy D-Bus IPC interface for component communication | `ssp_dbus.c` |
| RBus Interface | Modern RBus IPC interface for next-generation component communication | `ssp_rbus.c` |
| Command Processor | Command-line interface and administrative operations | `ssp_cmd.c` |
| **Core Engine Layer (CCSP_CR)** |
| CR Manager | Core component registry management and coordination | `ccsp_cr_base.c` |
| Registration Operations | Component registration, discovery, and namespace management | `ccsp_cr_operation.c` |
| Profile Manager | Device profile loading, parsing, and component configuration management | `ccsp_cr_profile.c` |
| Session Manager | Component session tracking and lifecycle management | `ccsp_cr_session.c` |
| Utility Functions | Common utility functions and helper operations | `ccsp_cr_utility.c` |
| Data Model Export | Export functionality for data model information | `ccsp_cr_exportDM.c` |


## Component Interactions

The Component Registry serves as the central hub for all inter-component communication within the RDK-B middleware, providing registration and discovery services that enable the distributed component architecture to function cohesively.

### Interaction Matrix

| Target Component/Layer | Interaction Purpose | Key APIs/Endpoints |
|------------------------|-------------------|------------------|
| **RDK-B Middleware Components** |
| Parameter Storage Manager | Component registration, namespace discovery, configuration management | `registerCapabilities()`, `discoverComponentSupportingNamespace()` |
| Protocol & Application Manager | Service discovery, component health monitoring, namespace resolution | `getRegisteredComponents()`, `getNamespaceByComponent()` |
| Cable Modem Agent | Component registration, DOCSIS namespace management | `registerCapabilities()`, `checkNamespaceDataType()` |
| WiFi Agent | Wireless namespace registration, component discovery for WiFi operations | `registerCapabilities()`, `discoverComponentSupportingNamespace()` |
| TR-069 Protocol Agent | Legacy D-Bus component registration, parameter namespace discovery | `CcspCrRegisterCapabilities()`, `CcspCrDiscoverComponentSupportingNamespace()` |
| MTA Agent | VoIP component registration, telephony namespace management | `registerCapabilities()`, `unregisterComponent()` |
| **System & Platform Services** |
| System Configuration (syscfg) | Persistent configuration storage, CR settings management | Configuration file I/O, `syscfg_get()`, `syscfg_set()` |
| Device Profile XMLs | Device-specific component configuration, supported namespace definitions | XML parsing, profile validation |
| SystemD Services | Service lifecycle management, dependency coordination | Service registration, health monitoring |

**Events Published by Component Registry:**

| Event Name | Event Topic/Path | Trigger Condition | Subscriber Components |
|------------|-----------------|-------------------|---------------------|
| ComponentRegistered | `Device.ComponentRegistry.ComponentRegistered` | New component successful registration | All middleware components, management systems |
| ComponentDeregistered | `Device.ComponentRegistry.ComponentDeregistered` | Component deregistration or failure detection | All middleware components, management systems |
| NamespaceOwnershipChanged | `Device.ComponentRegistry.NamespaceChanged` | Namespace ownership transfer or modification | Components with namespace dependencies |
| ProfileReloaded | `Device.ComponentRegistry.ProfileReloaded` | Device profile update or reload completion | All registered components |

### IPC Flow Patterns

**Primary IPC Flow - Component Registration:**

```mermaid
sequenceDiagram
    participant Component as CCSP Component
    participant CR as Component Registry
    participant Registry as Internal Registry
    participant Profile as Profile Manager

    Component->>CR: RBus/D-Bus Method Call: registerCapabilities()
    Note over CR: Validate component credentials & parameters
    CR->>Profile: Validate against device profile
    Profile-->>CR: Profile validation result
    CR->>Registry: Add component to registry
    Registry-->>CR: Registration confirmed
    CR-->>Component: Registration success response
    
    Note over CR: Broadcast registration event to subscribers
    CR->>Component: Event: ComponentRegistered
```

**Event Notification Flow:**

```mermaid
sequenceDiagram
    participant System as System Monitor
    participant CR as Component Registry
    participant Sub1 as Subscriber Component 1
    participant Sub2 as Subscriber Component 2

    System->>CR: Component Failure Detected
    Note over CR: Process failure & update registry
    CR->>CR: Remove component from registry
    CR->>Sub1: RBus Event: ComponentDeregistered
    CR->>Sub2: RBus Event: ComponentDeregistered
    Sub1-->>CR: Event Acknowledgment
    Sub2-->>CR: Event Acknowledgment
```

## Implementation Details

### Major HAL APIs Integration

The Component Registry operates primarily at the middleware layer and does not directly integrate with HAL APIs. Instead, it relies on system-level APIs for configuration management and IPC communication.

**Core System APIs:**

| System API | Purpose | Implementation File |
|---------|---------|-------------------|
| `syscfg_get/set` | System configuration persistence and retrieval | `ssp_main.c` |
| `libxml2 APIs` | Device profile XML parsing and validation | `ccsp_cr_profile.c` |
| `D-Bus APIs` | Legacy inter-process communication interface | `ssp_dbus.c` |
| `RBus APIs` | Modern message bus communication interface | `ssp_rbus.c` |

### Key Implementation Logic

- **Component Registry Engine**: The core registry management is implemented in `ccsp_cr_base.c` with the main data structures and registry operations in `ccsp_cr_operation.c`. The registry maintains an in-memory component table with namespace mappings and component capability information.
     - Main registry implementation in `ccsp_cr_base.c` (CcspCreateCR, CcspFreeCR functions)
     - Component registration and discovery logic in `ccsp_cr_operation.c` (CcspCrRegisterCapabilities, CcspCrDiscoverComponentSupportingNamespace)
  
- **IPC Protocol Handling**: Dual IPC support is implemented through separate interface modules that provide the same registry operations through different communication mechanisms.
     - D-Bus interface implementation for legacy component support
     - RBus interface implementation for modern message bus communication
     - Protocol selection based on build configuration and runtime detection

- **Error Handling Strategy**: Comprehensive error handling with logging, component failure detection, and graceful degradation when components become unavailable.
     - Component health monitoring and timeout handling
     - Registry cleanup on component failures  
     - Retry mechanisms for transient communication errors

- **Logging & Debugging**: Extensive logging support with configurable verbosity levels and component-specific debugging capabilities.
     - Component registration and discovery event logging
     - IPC communication tracing for troubleshooting
     - Debug hooks for runtime registry inspection

### Key Configuration Files

| Configuration File | Purpose | Override Mechanisms |
|--------------------|---------|--------------------|
| `cr-deviceprofile_embedded.xml` | Embedded device component configuration | Environment-specific profile selection |
| `cr-deviceprofile_pc.xml` | PC/desktop development configuration | Build-time profile selection |
| `cr-deviceprofile.xml` | Default device profile configuration | Runtime profile path configuration |
| `cr-ethwan-deviceprofile.xml` | Ethernet WAN specific device configuration | Platform-specific profile loading |
| `/etc/debug.ini` | Debug and logging configuration | Runtime debug level modification |
