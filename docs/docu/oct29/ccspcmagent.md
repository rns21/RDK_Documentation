# CcspCMAgent Documentation

The CcspCMAgent (CCSP Cable Modem Agent) is the RDK-B middleware component that provides comprehensive cable modem management and TR-181 data model implementation for DOCSIS-based gateway devices. This component serves as the primary interface between the RDK-B middleware stack and the underlying cable modem hardware, enabling remote management, monitoring, and configuration of cable modem functionality through standardized TR-181 parameters.

The component operates as a bridge between higher-level RDK-B management services and the cable modem Hardware Abstraction Layer (HAL), providing real-time status monitoring, configuration management, and event notification capabilities. It integrates seamlessly with the WAN Manager for connectivity coordination and supports both traditional message bus communication and modern RBus event-driven architecture for optimal performance and scalability.

CcspCMAgent implements multiple TR-181 data model objects including Device.DeviceInfo parameters, custom X_CISCO_COM_CableModem extensions, and X_RDKCENTRAL-COM_CableModem objects, ensuring comprehensive compliance with broadband forum specifications while supporting vendor-specific enhancements for advanced cable modem functionality.

```mermaid
graph TD
    subgraph "External Systems"
        CMTS[DOCSIS CMTS]
        FWServer[Firmware Server]
        HeadEnd[MSO HeadEnd]
        WebUI[Web Management UI]
    end

    subgraph "RDK-B Middleware"
        CcspCMAgent[CcspCMAgent<br>Cable Modem Agent]
        WANMgr[WAN Manager]
        PSM[PSM<br>Persistent Storage Manager]
        TR069PA[TR-069 PA]
        LogAgent[Log Agent]
        TelemetryAgent[Telemetry Agent]
        WebConfig[WebConfig Agent]
    end

    subgraph "System Infrastructure"
        CCMsgBus[CCSP Message Bus]
        RBusInfra[RBus Infrastructure]
        SysConfig[SysConfig/NVRAM]
    end

    subgraph "Hardware Abstraction Layer"
        CMHAL[Cable Modem HAL]
        DHCPHAL[DHCP Client HAL]
        EthSwitchHAL[Ethernet Switch HAL]
        PlatformHAL[Platform HAL]
        MOCAHAL[MoCA HAL]
    end

    subgraph "Hardware/OS Layer"
        DocsisHW[DOCSIS Hardware<br>Cable Modem Chipset]
        EthHW[Ethernet Interfaces<br>cm0, erouter0]
        NVRAM[NVRAM Storage]
        LinuxKernel[Linux Kernel<br>Network Stack]
    end

    %% External Communications
    CMTS <-->|DOCSIS Protocol<br>RF Signals| DocsisHW
    FWServer -->|HTTPS<br>Firmware Downloads| CcspCMAgent
    HeadEnd <-->|TR-069/CWMP<br>Management Protocol| TR069PA
    WebUI -->|HTTP/HTTPS<br>Configuration| CcspCMAgent

    %% RDK-B Component Interactions
    CcspCMAgent <-->|RBus Events<br>Status/Config| WANMgr
    CcspCMAgent <-->|CCSP DML<br>Parameter Access| TR069PA
    CcspCMAgent <-->|PSM API<br>Config Storage| PSM
    CcspCMAgent -->|Event Publishing<br>Telemetry Data| LogAgent
    CcspCMAgent -->|Event Publishing<br>Performance Metrics| TelemetryAgent
    CcspCMAgent <-->|WebConfig API<br>Remote Config| WebConfig

    %% Infrastructure Communications
    CcspCMAgent <-->|Message Bus<br>Component Registration| CCMsgBus
    CcspCMAgent <-->|Event Publishing<br>Real-time Events| RBusInfra
    CcspCMAgent <-->|Configuration API<br>Persistent Settings| SysConfig

    %% HAL Layer Interactions
    CcspCMAgent -->|HAL API Calls<br>CM Control/Status| CMHAL
    CcspCMAgent -->|HAL API Calls<br>DHCP Management| DHCPHAL
    CcspCMAgent -->|HAL API Calls<br>Interface Control| EthSwitchHAL
    CcspCMAgent -->|HAL API Calls<br>Device Info| PlatformHAL
    CcspCMAgent -->|HAL API Calls<br>MoCA Status| MOCAHAL

    %% Hardware/OS Interactions  
    CMHAL <-->|Driver Interface<br>DOCSIS Control| DocsisHW
    EthSwitchHAL <-->|Network Interface<br>Ethernet Control| EthHW
    PSM <-->|File I/O<br>Data Persistence| NVRAM
    SysConfig <-->|File I/O<br>Config Storage| NVRAM
    DHCPHAL <-->|Network Sockets<br>DHCP Client| LinuxKernel

    %% Styling
    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef middleware fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef infrastructure fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef hal fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef hardware fill:#fce4ec,stroke:#c2185b,stroke-width:2px;
    classDef primary fill:#e3f2fd,stroke:#1565c0,stroke-width:3px;

    class CMTS,FWServer,HeadEnd,WebUI external;
    class WANMgr,PSM,TR069PA,LogAgent,TelemetryAgent,WebConfig middleware;
    class CCMsgBus,RBusInfra,SysConfig infrastructure;
    class CMHAL,DHCPHAL,EthSwitchHAL,PlatformHAL,MOCAHAL hal;
    class DocsisHW,EthHW,NVRAM,LinuxKernel hardware;
    class CcspCMAgent primary;
```

**Key Features & Responsibilities**: 

- **DOCSIS Cable Modem Management**: Provides complete lifecycle management of cable modem operations including registration, authentication, and network access control through BPI (Baseline Privacy Interface) state management
- **TR-181 Data Model Implementation**: Implements comprehensive TR-181 parameter support for Device.DeviceInfo, X_CISCO_COM_CableModem, and X_RDKCENTRAL-COM_CableModem objects with full BBF compliance
- **Real-time Status Monitoring**: Continuously monitors cable modem RF signal status, DOCSIS link state, and network connectivity with event-driven notifications via RBus
- **WAN Integration Services**: Coordinates with WAN Manager for interface provisioning, providing cable modem interface abstraction and boot-time WAN configuration
- **Hardware Abstraction**: Interfaces with multiple HAL layers including CM, DHCP, Ethernet switch, MoCA, and platform-specific HALs for comprehensive hardware control
- **Remote Management Support**: Enables remote configuration management, firmware download orchestration, and telemetry data collection for service provider operations
- **Event-Driven Architecture**: Publishes real-time cable modem events including RF signal changes, link status updates, and registration state transitions via RBus messaging

## Design

The CcspCMAgent follows a layered architecture design that separates concerns between TR-181 data model management, cable modem hardware abstraction, and inter-component communication. The component is built around a service-oriented architecture where the main SSP (Service Support Platform) layer handles component lifecycle and message bus registration, while specialized middle-layer modules manage TR-181 parameter operations and hardware interaction.

The design emphasizes real-time responsiveness through event-driven programming patterns, utilizing both traditional CCSP message bus communication for backward compatibility and modern RBus event publishing for high-performance status monitoring. This dual-communication approach ensures seamless integration with legacy RDK-B components while providing enhanced capabilities for newer services requiring real-time cable modem status updates.

The component's modular design supports extensive customization through compile-time configuration options and runtime parameter tuning, enabling adaptation to various cable modem hardware platforms and service provider requirements. Integration with the WAN Manager is achieved through well-defined IPC mechanisms that coordinate cable modem interface provisioning during boot sequences and handle dynamic configuration changes during runtime operations.

Data persistence is managed through the PSM (Persistent Storage Manager) integration for configuration parameters and syscfg for operational settings, ensuring configuration state survives across system reboots. The component also implements comprehensive error handling and recovery mechanisms, including automatic retry logic for hardware communication failures and graceful degradation when dependent services are unavailable.

```mermaid
graph TD
    subgraph "External Systems"
        MNGMT[Remote Management Server<br>TR-069/USP]
        CMTS[Cable Modem Termination System<br>DOCSIS Network]
    end

    subgraph "RDK-B Middleware Layer"
        WANMGR[WAN Manager<br>Interface Coordination]
        PSM[Persistent Storage Manager<br>Configuration Storage]
        LOGAGENT[Log Agent<br>Telemetry Collection]
    end

    subgraph "CcspCMAgent Container"
        subgraph "SSP Layer"
            MAIN[ssp_main.c<br>Component Lifecycle]
            MSGBUS[Message Bus Interface<br>CCSP Registration]
        end
        
        subgraph "Middle Layer Components"
            DEVINFO[Device Info DML<br>Device.DeviceInfo.*]
            CMCISCO[Cisco CM DML<br>X_CISCO_COM_CableModem.*]
            CMRDK[RDK Central CM DML<br>X_RDKCENTRAL-COM_CableModem.*]
            RBUS[RBus Handler<br>Event Publishing]
            WEBCONFIG[WebConfig API<br>Remote Configuration]
        end
        
        subgraph "Integration Layer"
            CMAPI[CM Integration APIs<br>Hardware Abstraction]
            HELPERAPI[Helper Functions<br>Utility Operations]
        end
    end

    subgraph "HAL Layer"
        CMHAL[Cable Modem HAL<br>DOCSIS Operations]
        DHCPHAL[DHCP Client HAL<br>IP Configuration]
        ETHHAL[Ethernet Switch HAL<br>LAN Interface Control]
        MOCAHAL[MoCA HAL<br>Coax Network]
        PLATFORMHAL[Platform HAL<br>System Integration]
    end

    subgraph "Hardware/Kernel Layer"
        DOCSISFW[DOCSIS Firmware<br>cm0 Interface]
        NETIF[Network Interfaces<br>erouter0, lan0]
    end

    %% External connections
    MNGMT -->|TR-069/USP Requests| MAIN
    CMTS <-->|DOCSIS Protocol| DOCSISFW

    %% RDK-B Integration
    WANMGR <-->|Interface Status/Config| MSGBUS
    PSM <-->|Parameter Storage| DEVINFO
    LOGAGENT <-->|Telemetry Events| RBUS

    %% Internal component flow
    MAIN --> MSGBUS
    MSGBUS --> DEVINFO
    MSGBUS --> CMCISCO
    MSGBUS --> CMRDK
    
    DEVINFO --> CMAPI
    CMCISCO --> CMAPI
    CMRDK --> CMAPI
    RBUS --> CMAPI
    WEBCONFIG --> CMAPI
    
    CMAPI --> HELPERAPI
    HELPERAPI --> CMHAL
    HELPERAPI --> DHCPHAL
    HELPERAPI --> ETHHAL
    HELPERAPI --> MOCAHAL
    HELPERAPI --> PLATFORMHAL

    %% HAL to hardware
    CMHAL --> DOCSISFW
    DHCPHAL --> NETIF
    ETHHAL --> NETIF
    MOCAHAL --> NETIF
    PLATFORMHAL --> NETIF

    %% Event flow
    CMHAL -.->|RF Signal Events| RBUS
    DOCSISFW -.->|Link Status Events| CMHAL

    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef middleware fill:#e3f2fd,stroke:#1976d2,stroke-width:2px;
    classDef component fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef hal fill:#fce4ec,stroke:#c2185b,stroke-width:2px;
    classDef hardware fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    class MNGMT,CMTS external;
    class WANMGR,PSM,LOGAGENT middleware;
    class MAIN,MSGBUS,DEVINFO,CMCISCO,CMRDK,RBUS,WEBCONFIG,CMAPI,HELPERAPI component;
    class CMHAL,DHCPHAL,ETHHAL,MOCAHAL,PLATFORMHAL hal;
    class DOCSISFW,NETIF hardware;
```

### Prerequisites and Dependencies

**Build-Time Flags and Configuration:**

| Configure Option | DISTRO Feature | Build Flag | Purpose | Default |
|------------------|----------------|------------|---------|---------|
| `--enable-notify` | `systemd` | `ENABLE_SD_NOTIFY` | Enable systemd service notification for lifecycle management | Disabled |
| `--enable-wanmgr` | N/A | `ENABLE_RDK_WANMANAGER` | Enable WAN Manager integration and coordination features | Disabled |
| `--enable-wanfailover` | N/A | `FEATURE_WAN_FAIL_OVER` | Enable WAN failover detection and handling capabilities | Disabled |
| `--enable-core_net_lib_feature_support` | N/A | `CORE_NET_LIB_FEATURE_SUPPORT` | Enable advanced networking library support | Disabled |
| `--enable-unitTestDockerSupport` | N/A | `UNIT_TEST_DOCKER_SUPPORT` | Enable Docker-based unit testing framework | Disabled |

**Compile-Time Macros and Features:**

| Macro/Flag | DISTRO Feature | Purpose | Default | Impact |
|------------|----------------|---------|---------|--------|
| `SAFEC_DUMMY_API` | `safec` (inverted) | Safe C library stub when safec not available | Enabled | Memory safety functions |
| `ENABLE_SD_NOTIFY` | `systemd` | SystemD service notification support | Disabled | Service lifecycle management |
| `ENABLE_RDK_WANMANAGER` | N/A | WAN Manager integration and interface coordination | Disabled | Enhanced WAN management |
| `_CM_HIGHSPLIT_SUPPORTED_` | N/A | DOCSIS High Split configuration support | Disabled | Advanced DOCSIS features |

**Runtime Configuration Parameters:**

| Parameter | Configuration Source | Purpose | Default Value | Override Method |
|-----------|---------------------|---------|---------------|-----------------|
| `bridge_mode` | syscfg | Cable modem bridge mode operation | `0` (Router mode) | TR-181, syscfg CLI |
| `last_wan_mode` | syscfg | Last operational WAN interface mode | Auto | syscfg CLI |
| `wan_physical_ifname` | syscfg | WAN physical interface name | `erouter0` | syscfg CLI |
| `xconf_url` | syscfg | XCONF firmware server URL | Empty | TR-181 parameters |
| `X_RDKCENTRAL-COM_LastRebootReason` | syscfg | Last system reboot reason tracking | Empty | TR-181, system events |

**RDK-B Platform and Integration Requirements (MUST):**


- **RDK-B Components**: PSM (Persistent Storage Manager), CR (Component Registrar), WAN Manager for interface coordination, CCSP Message Bus for inter-component communication
- **HAL Dependencies**: Cable Modem HAL v2.0+, DHCP Client HAL v1.0+, Ethernet Switch HAL v1.0+, Platform HAL v1.0+
- **Systemd Services**: ccsp-cm-agent.service must start after network-online.target and before wanmanager.service
- **Hardware Requirements**: DOCSIS-compliant cable modem chipset, Ethernet switching capability, support for cm0 and erouter0 network interfaces
- **Message Bus**: CCSP Message Bus registration with component name "eRT.com.cisco.spvtg.ccsp.cm"
- **TR-181 Data Model**: Device.DeviceInfo.* parameter support from Platform Agent, X_CISCO_COM_CableModem.* namespace reservation
- **Configuration Files**: CcspCM.cfg, CcspCMDM.cfg, TR181-CM.XML for parameter definitions, /nvram/syscfg.db for persistent configuration
- **Startup Order**: Must initialize after PSM and Message Bus but before WAN Manager and dependent networking components
- **Resource Constraints**: Minimum 8MB RAM allocation, persistent storage access for configuration and logs


**Dependent Components:**

- WAN Manager depends on CcspCMAgent for cable modem interface status and configuration
- Log Agent depends on CcspCMAgent for cable modem telemetry and diagnostic events
- RBus services depend on CcspCMAgent for cable modem status events and notifications
- Startup sequence failure impacts WAN connectivity establishment and remote management capabilities

<br>

**Threading Model:**

CcspCMAgent implements a hybrid threading model that combines single-threaded CCSP message bus operations with multi-threaded RBus event handling for optimal performance and resource utilization.

- **Threading Architecture**: Multi-threaded with dedicated worker threads for specific operations
- **Main Thread**: Handles CCSP message bus operations, TR-181 parameter get/set operations, component lifecycle management, and synchronous HAL interactions
- **Worker Threads**:
    - **RBus Event Thread**: Manages RBus connection, publishes cable modem status events, handles subscriber notifications with 1-second polling interval
    - **HAL Monitor Thread**: Continuously monitors cable modem RF signal status and DOCSIS link state with configurable polling intervals
    - **WebConfig Thread**: Processes remote configuration updates asynchronously to prevent blocking main operations
- **Synchronization**: Uses pthread mutexes for shared data structures, RBus internal synchronization for event publishing, and CCSP-provided synchronization primitives for message bus operations

### Component State Flow

**Initialization to Active State**

The CcspCMAgent component follows a structured initialization sequence that ensures proper dependency resolution and hardware readiness before transitioning to active operational state. The component implements comprehensive error handling during initialization with retry mechanisms for hardware communication failures.

```mermaid
stateDiagram-v2
    [*] --> Initializing
    Initializing --> LoadingConfig: Load TR-181 XML Configuration
    LoadingConfig --> RegisteringTR181: Parse Parameter Definitions
    RegisteringTR181 --> ConnectingMessageBus: Register with CCSP Message Bus
    ConnectingMessageBus --> InitializingHAL: Connect to Cable Modem HAL
    InitializingHAL --> CheckingDependencies: Verify WAN Manager Health
    CheckingDependencies --> InitializingRBus: Setup RBus Event Publishing
    InitializingRBus --> Active: Component Ready
    Active --> MonitoringCM: Monitor Cable Modem Status
    MonitoringCM --> Active: Status Updated
    Active --> ProcessingRequests: Handle TR-181 Requests
    ProcessingRequests --> Active: Request Completed
    Active --> Shutdown: Stop Request
    Shutdown --> [*]

    note right of Initializing
        - Initialize logging subsystem
        - Load component configuration
        - Setup memory management
        - Initialize CCSP framework
    end note

    note right of Active
        - Process TR-181 get/set requests
        - Publish cable modem events
        - Monitor DOCSIS link status
        - Handle configuration updates
    end note
```

```mermaid
sequenceDiagram
    participant Sys as System
    participant CM as CcspCMAgent

    Note over Sys,CM: Exact Same Flow as State Diagram Above

    Sys->>CM: Start (Initializing)
    CM->>CM: Load TR-181 XML Configuration (LoadingConfig)
    CM->>CM: Parse Parameter Definitions (RegisteringTR181)
    CM->>CM: Register with CCSP Message Bus (ConnectingMessageBus)
    CM->>CM: Connect to Cable Modem HAL (InitializingHAL)
    CM->>CM: Verify WAN Manager Health (CheckingDependencies)
    CM->>CM: Setup RBus Event Publishing (InitializingRBus)
    CM->>CM: Component Ready (Active)
    
    loop Runtime Operations (Active State)
        CM->>CM: Monitor Cable Modem Status (MonitoringCM → Active)
        CM->>CM: Handle TR-181 Requests (ProcessingRequests → Active)
    end
    
    Sys->>CM: Stop Request (Shutdown)
    CM->>CM: Cleanup and Exit
```

**Runtime State Changes and Context Switching**

During runtime operations, CcspCMAgent manages multiple operational contexts including DOCSIS registration states, RF signal monitoring, and WAN interface coordination. The component implements state-aware processing to ensure consistent behavior across different cable modem operational states.

**State Change Triggers:**

- DOCSIS link status changes trigger immediate event publication and WAN Manager notification
- RF signal level variations beyond threshold values initiate diagnostic data collection and telemetry reporting  
- Remote configuration updates trigger parameter validation and atomic configuration commits
- Cable modem registration state changes coordinate with WAN Manager for interface provisioning

**Context Switching Scenarios:**

- Boot-time provisioning mode switches to operational monitoring after successful DOCSIS registration
- Firmware download mode temporarily suspends normal operations and enables download progress monitoring
- Factory reset mode clears all persistent configuration and reinitializes with default values

### Call Flow

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant SystemD as SystemD Service Manager
    participant CMAgent as CcspCMAgent (ssp_main)
    participant CCSP as CCSP Message Bus
    participant HAL as Cable Modem HAL
    participant WanMgr as WAN Manager

    SystemD->>CMAgent: Start ccsp-cm-agent.service
    CMAgent->>CMAgent: Load Configuration Files
    CMAgent->>CCSP: Register Component (eRT.com.cisco.spvtg.ccsp.cm)
    CCSP-->>CMAgent: Registration Complete
    CMAgent->>HAL: Initialize Cable Modem HAL
    HAL-->>CMAgent: HAL Ready
    CMAgent->>WanMgr: Check WAN Manager Health
    WanMgr-->>CMAgent: Health Status OK
    CMAgent->>CMAgent: Initialize RBus Event Publishing
    CMAgent->>SystemD: Signal Service Ready (sd_notify)
```

**Cable Modem Status Monitoring Call Flow:**

```mermaid
sequenceDiagram
    participant RBusSub as RBus Subscribers
    participant CMAgent as CcspCMAgent (RBus Handler)
    participant HAL as Cable Modem HAL
    participant DOCSIS as DOCSIS Firmware

    loop Every 5 seconds
        CMAgent->>HAL: docsis_IsEnergyDetected()
        HAL->>DOCSIS: Check RF Signal Status
        DOCSIS-->>HAL: RF Signal Level
        HAL-->>CMAgent: Signal Status (true/false)
        
        alt RF Status Changed
            CMAgent->>CMAgent: Update Internal State
            CMAgent->>RBusSub: Publish CableModemRfSignalStatus Event
            RBusSub-->>CMAgent: Event Acknowledgment
        end
    end
```

## TR‑181 Data Models

### Supported TR-181 Parameters

CcspCMAgent implements comprehensive TR-181 data model support following BBF specification guidelines with both standard Device.DeviceInfo parameters and vendor-specific extensions for cable modem functionality. The component provides full compliance with TR-181 Issue 2 Amendment 15 specifications while supporting custom extensions for advanced cable modem operations.

### Object Hierarchy

```
Device.
├── DeviceInfo.
│   ├── SerialNumber (string, R)
│   ├── ModelName (string, R)  
│   ├── Description (string, R)
│   ├── ProductClass (string, R)
│   ├── ManufacturerOUI (string, R)
│   └── HardwareVersion (string, R)
└── X_CISCO_COM_CableModem.
    ├── TelephonyDHCPStatus (string, R)
    ├── TelephonyTftpStatus (string, R)
    ├── TelephonyRegistrationStatus (string, R)
    ├── DOCSISDHCPAttempts (unsignedInt, R)
    ├── DOCSISTftpAttempts (unsignedInt, R)
    ├── MaxCpeAllowed (unsignedInt, R)
    ├── DOCSISConfigFileName (string, R)
    ├── ToDStatus (string, R)
    ├── UpstreamServiceFlowParams (string, R)
    ├── DownstreamServiceFlowParams (string, R)
    ├── DOCSISDownstreamDataRate (string, R)
    ├── DOCSISUpstreamDataRate (string, R)
    ├── MACAddress (string, R)
    ├── BPIState (boolean, R)
    ├── NetworkAccess (boolean, R)
    ├── UpgradeServerIP (string, R)
    ├── Market (string, R)
    ├── MDDIPOverride (string, R)
    ├── IPAddress (string, R)
    ├── BootFileName (string, R)
    ├── SubnetMask (string, R)
    ├── Gateway (string, R)
    └── X_RDKCENTRAL-COM_CableModem.
        ├── X_RDKCENTRAL-COM_FirmwareDownloadStatus (string, R/W)
        ├── X_RDKCENTRAL-COM_FirmwareDownloadProtocol (string, R/W)
        ├── X_RDKCENTRAL-COM_FirmwareDownloadURL (string, R/W)
        ├── X_RDKCENTRAL-COM_FirmwareToDownload (string, R/W)
        ├── X_RDKCENTRAL-COM_FirmwareDownloadNow (boolean, R/W)
        ├── X_RDKCENTRAL-COM_CableRfSignalStatus (boolean, R)
        └── DsOfdmChan.{i}.
            ├── ChannelId (unsignedInt, R)
            ├── CenterFrequency (unsignedInt, R)
            ├── SubcarrierSpacing (unsignedInt, R)
            ├── CyclicPrefix (string, R)
            ├── RollOffPeriod (string, R)
            ├── PlcTotalCodewords (unsignedLong, R)
            ├── PlcUnreliableCodewords (unsignedLong, R)
            └── NcpTotalFields (unsignedLong, R)
```

### Parameter Definitions

**Core Device Information Parameters:**

| Parameter Path | Data Type | Access | Default Value | Description | BBF Compliance |
|----------------|-----------|--------|---------------|-------------|----------------|
| `Device.DeviceInfo.SerialNumber` | string | R | `""` | Unique serial number assigned by the manufacturer for device identification and service provisioning | TR-181 Issue 2 |
| `Device.DeviceInfo.ModelName` | string | R | `""` | Model name of the device as assigned by the manufacturer, used for device capability identification | TR-181 Issue 2 |
| `Device.DeviceInfo.Description` | string | R | `""` | Textual description of the device including manufacturer, model, and basic capability information | TR-181 Issue 2 |
| `Device.DeviceInfo.ProductClass` | string | R | `""` | Product class identifier that categorizes the device type and expected feature set for management purposes | TR-181 Issue 2 |
| `Device.DeviceInfo.ManufacturerOUI` | string | R | `""` | Organizationally Unique Identifier (OUI) of the device manufacturer as assigned by IEEE registration authority | TR-181 Issue 2 |
| `Device.DeviceInfo.HardwareVersion` | string | R | `""` | Hardware version string assigned by manufacturer, typically indicating PCB revision and component specifications | TR-181 Issue 2 |

**Cable Modem Core Parameters:**

| Parameter Path | Data Type | Access | Default Value | Description | BBF Compliance |
|----------------|-----------|--------|---------------|-------------|----------------|
| `Device.X_CISCO_COM_CableModem.TelephonyDHCPStatus` | string | R | `""` | Current DHCP status for telephony services including states: NotStarted, InProgress, Complete, Failed, Renewing | Custom Extension |
| `Device.X_CISCO_COM_CableModem.TelephonyTftpStatus` | string | R | `""` | TFTP provisioning status for telephony configuration with enumerated values: NotStarted, InProgress, Complete, Failed | Custom Extension |
| `Device.X_CISCO_COM_CableModem.DOCSISDHCPAttempts` | unsignedInt | R | `0` | Total number of DHCP attempts made by cable modem during current boot cycle for IP address acquisition | Custom Extension |
| `Device.X_CISCO_COM_CableModem.DOCSISTftpAttempts` | unsignedInt | R | `0` | Number of TFTP configuration file download attempts during cable modem registration process | Custom Extension |
| `Device.X_CISCO_COM_CableModem.BPIState` | boolean | R | `false` | Baseline Privacy Interface (BPI) encryption state indicating whether data encryption is active on cable modem interface | Custom Extension |
| `Device.X_CISCO_COM_CableModem.NetworkAccess` | boolean | R | `false` | Network access permission status controlled by CMTS authorization policies and service flow configurations | Custom Extension |
| `Device.X_CISCO_COM_CableModem.MACAddress` | string | R | `""` | Hardware MAC address of cable modem interface used for DOCSIS registration and network identification | Custom Extension |

**RDK Central Extensions:**

| Parameter Path | Data Type | Access | Default Value | Description | BBF Compliance |
|----------------|-----------|--------|---------------|-------------|----------------|
| `Device.X_CISCO_COM_CableModem.X_RDKCENTRAL-COM_FirmwareDownloadStatus` | string | R/W | `"Not Started"` | Current firmware download status with values: Not Started, In Progress, Complete, Failed, Cancelled | Custom Extension |
| `Device.X_CISCO_COM_CableModem.X_RDKCENTRAL-COM_FirmwareDownloadURL` | string | R/W | `""` | URL for firmware image download supporting HTTP, HTTPS, and TFTP protocols with authentication support | Custom Extension |
| `Device.X_CISCO_COM_CableModem.X_RDKCENTRAL-COM_FirmwareDownloadNow` | boolean | R/W | `false` | Trigger parameter to initiate immediate firmware download when set to true, automatically resets to false | Custom Extension |
| `Device.X_CISCO_COM_CableModem.X_RDKCENTRAL-COM_CableRfSignalStatus` | boolean | R | `false` | Real-time RF signal detection status indicating presence of cable modem RF carrier signal for diagnostics | Custom Extension |

**Custom Extensions:**

- **DOCSIS Service Flow Parameters**: Custom parameters for upstream and downstream service flow monitoring including QoS metrics, bandwidth utilization, and traffic classification statistics
- **Advanced RF Diagnostics**: Extended RF signal quality parameters including signal-to-noise ratio, power levels, and modulation error rate measurements
- **Enhanced Firmware Management**: Comprehensive firmware download management with progress tracking, retry mechanisms, and rollback capabilities

### Parameter Registration and Access

- **Implemented Parameters**: CcspCMAgent implements 45+ TR‑181 parameters across Device.DeviceInfo, X_CISCO_COM_CableModem, and X_RDKCENTRAL-COM_CableModem namespaces with complete validation and constraint enforcement
- **Parameter Registration**: Parameters are registered through CCSP Message Bus using component name "eRT.com.cisco.spvtg.ccsp.cm" with automatic namespace collision detection and resolution
- **Access Mechanism**: External components access parameters via CCSP Message Bus GetParameterValues/SetParameterValues operations with full transaction support and atomic commit capabilities
- **Validation Rules**: String parameters enforce maximum length constraints, numeric parameters validate range boundaries, and boolean parameters ensure proper true/false value conversion

## Internal Modules

CcspCMAgent is organized into specialized modules that handle distinct aspects of cable modem management and TR-181 data model implementation. Each module encapsulates specific functionality while maintaining clean interfaces for inter-module communication and external component integration.

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| **SSP Main** | Primary service support platform module handling component lifecycle, CCSP message bus registration, systemd service management, and dependency health monitoring | `ssp_main.c`, `ssp_global.h`, `ssp_internal.h` |
| **Message Bus Interface** | CCSP message bus communication handler managing parameter get/set operations, component registration, and inter-component messaging protocols | `ssp_messagebus_interface.c`, `ssp_messagebus_interface.h` |
| **Device Info DML** | Device.DeviceInfo TR-181 parameter implementation providing read-only device identification parameters including serial number, model, and manufacturer information | `cosa_device_info_dml.c`, `cosa_device_info_dml.h`, `cosa_device_info_internal.c` |
| **Cisco CableModem DML** | X_CISCO_COM_CableModem TR-181 object implementation handling DOCSIS-specific parameters, telephony status, and service flow management | `cosa_x_cisco_com_cablemodem_dml.c`, `cosa_x_cisco_com_cablemodem_dml.h`, `cosa_x_cisco_com_cablemodem_internal.c` |
| **RDK Central CableModem DML** | X_RDKCENTRAL-COM_CableModem TR-181 extensions for firmware management, RF signal monitoring, and advanced diagnostic capabilities | `cosa_x_rdkcentral_com_cablemodem_dml.c`, `cosa_x_rdkcentral_com_cablemodem_dml.h`, `cosa_x_rdkcentral_com_cablemodem_internal.c` |
| **RBus Handler** | Modern event-driven messaging system for real-time cable modem status publishing, subscriber management, and high-performance event distribution | `cosa_rbus_handler_apis.c`, `cosa_rbus_handler_apis.h` |
| **Integration APIs** | Hardware abstraction layer interface providing unified access to cable modem HAL, DHCP client HAL, and other hardware-specific operations | `cosa_x_cisco_com_cablemodem_apis.c`, `cosa_x_rdkcentral_com_cablemodem_apis.c` |
| **Helper Functions** | Utility module providing common operations including string manipulation, parameter validation, memory management, and logging facilities | `cmagent_helpers.c`, `cmagent_helpers.h` |
| **Gateway Provisioning** | Cable modem provisioning state machine managing boot-time registration, WAN interface coordination, and service provider configuration workflows | `gw_prov_sm.c`, `gw_prov_sm.h`, `gw_prov_abstraction.h` |

```mermaid
flowchart TD
    subgraph CcspCMAgent["CcspCMAgent Component"]
        SSP([SSP Main<br>Component Lifecycle])
        MSGBUS([Message Bus Interface<br>CCSP Communication])
        
        subgraph "TR-181 DML Modules"
            DEVINFO([Device Info DML<br>Device.DeviceInfo.*])
            CMCISCO([Cisco CM DML<br>X_CISCO_COM_CableModem.*])
            CMRDK([RDK Central CM DML<br>X_RDKCENTRAL-COM_CableModem.*])
        end
        
        subgraph "Event & Communication"
            RBUS([RBus Handler<br>Event Publishing])
            WEBCONFIG([WebConfig API<br>Remote Configuration])
        end
        
        subgraph "Hardware Integration"
            INTEGAPI([Integration APIs<br>HAL Abstraction])
            GWPROV([Gateway Provisioning<br>Boot State Machine])
        end
        
        HELPER([Helper Functions<br>Utilities])
    end

    SSP --> MSGBUS
    MSGBUS --> DEVINFO
    MSGBUS --> CMCISCO
    MSGBUS --> CMRDK
    
    DEVINFO --> INTEGAPI
    CMCISCO --> INTEGAPI
    CMRDK --> INTEGAPI
    
    RBUS --> INTEGAPI
    WEBCONFIG --> INTEGAPI
    GWPROV --> INTEGAPI
    
    INTEGAPI --> HELPER
    
    DEVINFO -.-> HELPER
    CMCISCO -.-> HELPER
    CMRDK -.-> HELPER
    RBUS -.-> HELPER
```

## Component Interactions

CcspCMAgent maintains extensive interactions with RDK-B middleware components, HAL layers, and external systems to provide comprehensive cable modem management functionality. The component serves as a critical integration point between higher-level management services and underlying hardware capabilities.

```mermaid
flowchart TD
    subgraph "Remote Management"
        TR069[TR-069 Auto Configuration Server<br>Remote Parameter Management]
        USP[USP Controller<br>Device Management Protocol]
        CLOUD[Cloud Management Platform<br>Bulk Configuration Services]
    end

    subgraph "RDK-B Middleware"
        WANMGR[WAN Manager<br>Interface Coordination]
        PSM[Persistent Storage Manager<br>Configuration Persistence]
        LOGAGENT[Log Agent<br>Telemetry Collection]
        TR069PA[TR-069 Protocol Agent<br>Device Parameter Access]
    end

    subgraph "CcspCMAgent"
        CORE[CM Agent Core<br>Main Component Logic]
    end

    subgraph "HAL Interfaces"
        CMHAL[Cable Modem HAL<br>DOCSIS Operations]
        DHCPHAL[DHCP Client HAL<br>IP Configuration]
        ETHHAL[Ethernet Switch HAL<br>LAN Switching]
        PLATFORMHAL[Platform HAL<br>Hardware Control]
    end

    subgraph "System Layer"
        DOCSISFW[DOCSIS Firmware/Driver<br>cm0 Interface]
        NETSTACK[Network Stack<br>TCP/IP Processing]
        SYSCFG[System Configuration<br>Persistent Settings]
    end

    %% Remote management connections
    TR069 -->|GetParameterValues/SetParameterValues| CORE
    USP -->|USP Messages| CORE
    CLOUD -->|WebConfig Notifications| CORE

    %% RDK-B component interactions
    WANMGR <-->|Interface Status/Configuration| CORE
    PSM <-->|Parameter Storage/Retrieval| CORE
    LOGAGENT <-->|Telemetry Events| CORE
    TR069PA <-->|Device.DeviceInfo Parameters| CORE

    %% HAL interactions
    CORE -->|Cable Modem Control| CMHAL
    CORE -->|DHCP Operations| DHCPHAL
    CORE -->|Ethernet Configuration| ETHHAL
    CORE -->|Platform Services| PLATFORMHAL

    %% System layer interactions
    CMHAL -->|Hardware Control| DOCSISFW
    DHCPHAL -->|Network Configuration| NETSTACK
    CORE -->|Configuration Storage| SYSCFG

    %% Event flows
    DOCSISFW -.->|Link Status Events| CMHAL
    CMHAL -.->|RF Signal Events| CORE
    CORE -.->|Status Publications| WANMGR
    CORE -.->|Telemetry Data| LOGAGENT

    classDef remote fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef middleware fill:#e3f2fd,stroke:#1976d2,stroke-width:2px;
    classDef component fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef hal fill:#fce4ec,stroke:#c2185b,stroke-width:2px;
    classDef system fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    class TR069,USP,CLOUD remote;
    class WANMGR,PSM,LOGAGENT,TR069PA middleware;
    class CORE component;
    class CMHAL,DHCPHAL,ETHHAL,PLATFORMHAL hal;
    class DOCSISFW,NETSTACK,SYSCFG system;
```

### Interaction Matrix

| Target Component/Layer | Interaction Purpose | IPC Mechanism | Message Format | Communication Pattern | Key APIs/Endpoints |
|------------------------|-------------------|---------------|----------------|---------------------|------------------|
| **RDK-B Middleware Components** |
| WAN Manager | Interface status reporting, boot-time WAN configuration coordination | CCSP Message Bus | CCSP Parameter XML | Synchronous Request-Response | `GetParameterValues`, `SetParameterValues`, `GetHealth` |
| Persistent Storage Manager | Configuration parameter persistence, factory reset coordination | CCSP Message Bus | CCSP Parameter XML | Synchronous Request-Response | `PSM_Get_Record_Value`, `PSM_Set_Record_Value` |
| Log Agent | Cable modem telemetry data, RF signal diagnostics, DOCSIS event logging | RBus | JSON Event Objects | Asynchronous Publish-Subscribe | `Device.LogAgent.X_RDKCENTRAL-COM_CM_LogLevel` |
| TR-069 Protocol Agent | Device identification parameters, cable modem status information | CCSP Message Bus | CCSP Parameter XML | Synchronous Request-Response | `Device.DeviceInfo.*`, `Device.X_CISCO_COM_CableModem.*` |
| **System & HAL Layers** |
| Cable Modem HAL | DOCSIS registration control, RF signal monitoring, MAC address retrieval | Direct Function Calls | C Structures | Synchronous Function Calls | `docsis_IsEnergyDetected()`, `docsis_GetCMStatus()`, `docsis_GetMACAddress()` |
| DHCP Client HAL | IP address configuration, DHCP lease management, gateway configuration | Direct Function Calls | C Structures | Synchronous Function Calls | `dhcpv4c_get_ert_lease()`, `dhcpv4c_get_ert_config_attempts()` |
| Ethernet Switch HAL | LAN port configuration, bridge interface management | Direct Function Calls | C Structures | Synchronous Function Calls | `GWP_GetEthWanLinkStatus()`, `GWP_SetEthWanLinkStatus()` |
| Platform HAL | System information, hardware identification, factory reset operations | Direct Function Calls | C Structures | Synchronous Function Calls | `platform_hal_GetSerialNumber()`, `platform_hal_GetModelName()` |
| **External Systems** |
| Remote Management Servers | TR-069/USP parameter operations, firmware download initiation, bulk configuration | HTTP/HTTPS | SOAP/JSON | RESTful/RPC | `GetParameterValues`, `SetParameterValues`, `Download` |
| DOCSIS Network (CMTS) | Cable modem registration, service flow provisioning, network access authorization | DOCSIS Protocol | DOCSIS MAC Messages | Bi-directional Protocol | DOCSIS MAC Management Messages |

**Events Published by CcspCMAgent:**

| Event Name | Event Topic/Path | Trigger Condition | Payload Format | Subscriber Components |
|------------|-----------------|-------------------|----------------|---------------------|
| DocsisLinkStatus | `Device.X_CISCO_COM_CableModem.DocsisLinkStatus` | DOCSIS link up/down state change | JSON: `{status: boolean, timestamp: string, interface: "cm0"}` | WAN Manager, Log Agent |
| CableModemRfSignalStatus | `Device.X_CISCO_COM_CableModem.X_RDKCENTRAL-COM_CableRfSignalStatus` | RF signal detection change | JSON: `{signal_present: boolean, signal_level: number, timestamp: string}` | WAN Manager, Diagnostic Agents |
| FirmwareDownloadStatus | `Device.X_CISCO_COM_CableModem.X_RDKCENTRAL-COM_FirmwareDownloadStatus` | Firmware download progress/completion | JSON: `{status: string, progress: number, url: string, error_code: number}` | System Manager, Log Agent |

**Events Consumed by CcspCMAgent:**

| Event Source | Event Topic/Path | Purpose | Expected Payload | Handler Function |
|-------------|-----------------|---------|------------------|------------------|
| WAN Manager | `Device.X_RDK_WanManager.CPEInterface.{i}.Wan.Status` | React to WAN interface status changes | JSON: `{interface_name: string, status: string, ip_address: string}` | `HandleWanStatusChange()` |
| System Manager | `Device.DeviceInfo.X_RDKCENTRAL-COM_xOpsDeviceMgmt.RPC.RebootDevice` | Handle system reboot requests | JSON: `{reboot_reason: string, delay: number}` | `HandleSystemReboot()` |

### IPC Flow Patterns

**Primary IPC Flow - TR-181 Parameter Access:**

```mermaid
sequenceDiagram
    participant Client as External Client (TR-069 PA)
    participant CCSP as CCSP Message Bus
    participant CMAgent as CcspCMAgent
    participant HAL as Cable Modem HAL
    participant HW as DOCSIS Hardware

    Client->>CCSP: GetParameterValues("Device.X_CISCO_COM_CableModem.MACAddress")
    CCSP->>CMAgent: RBUS GetParameterValues Request
    CMAgent->>HAL: docsis_GetMACAddress()
    HAL->>HW: Hardware Register Read
    HW-->>HAL: MAC Address Data
    HAL-->>CMAgent: MAC Address String
    CMAgent-->>CCSP: Parameter Value Response
    CCSP-->>Client: GetParameterValues Response (success/error)
```

**Event Notification Flow:**

```mermaid
sequenceDiagram
    participant HW as DOCSIS Hardware
    participant HAL as Cable Modem HAL
    participant CMAgent as CcspCMAgent (RBus Thread)
    participant RBus as RBus Message Bus
    participant Sub1 as WAN Manager
    participant Sub2 as Log Agent

    loop Every 5 seconds
        CMAgent->>HAL: docsis_IsEnergyDetected()
        HAL->>HW: Check RF Signal Status
        HW-->>HAL: Signal Present/Absent
        HAL-->>CMAgent: Boolean Status
        
        alt Status Changed
            CMAgent->>RBus: Publish CableModemRfSignalStatus Event
            RBus->>Sub1: Event Notification
            RBus->>Sub2: Event Notification
            Sub1-->>RBus: Ack (if required)
            Sub2-->>RBus: Ack (if required)
        end
    end
```

## Implementation Details

### Major HAL APIs Integration

CcspCMAgent integrates with multiple HAL interfaces to provide comprehensive cable modem hardware abstraction and control. The component implements robust error handling and retry mechanisms for all HAL interactions to ensure reliable operation under various hardware conditions.

**Core HAL APIs:**

| HAL API | Purpose | Parameters | Return Values | Implementation File |
|---------|---------|------------|---------------|-------------------|
| `docsis_IsEnergyDetected` | Monitor cable modem RF signal presence for connectivity diagnostics | `BOOL* pSignalDetected` | `ANSC_STATUS_SUCCESS/FAILURE` | `cosa_x_cisco_com_cablemodem_apis.c` |
| `docsis_GetCMStatus` | Retrieve comprehensive cable modem operational status | `PCOSA_CM_STATUS pStatus` | `ANSC_STATUS_SUCCESS/FAILURE` | `cosa_x_cisco_com_cablemodem_apis.c` |
| `docsis_GetMACAddress` | Get cable modem hardware MAC address for identification | `char* pMacAddress, ULONG bufferSize` | `ANSC_STATUS_SUCCESS/FAILURE` | `cosa_x_cisco_com_cablemodem_apis.c` |
| `dhcpv4c_get_ert_lease` | Retrieve current DHCP lease information for erouter interface | `dhcpv4c_ip_lease_t* pLease` | `ANSC_STATUS_SUCCESS/FAILURE` | `cosa_x_cisco_com_cablemodem_apis.c` |
| `platform_hal_GetSerialNumber` | Get device serial number from platform hardware | `char* pSerialNumber, ULONG bufferSize` | `ANSC_STATUS_SUCCESS/FAILURE` | `cosa_device_info_apis.c` |
| `platform_hal_GetModelName` | Retrieve device model name from platform configuration | `char* pModelName, ULONG bufferSize` | `ANSC_STATUS_SUCCESS/FAILURE` | `cosa_device_info_apis.c` |
| `GWP_GetEthWanLinkStatus` | Check Ethernet WAN link status for connectivity validation | `BOOL* pLinkUp` | `ANSC_STATUS_SUCCESS/FAILURE` | `cosa_x_cisco_com_cablemodem_apis.c` |

### Key Implementation Logic

- **Cable Modem State Machine**: Core state management logic in `gw_prov_sm.c` handles DOCSIS registration phases including initial scanning, ranging, DHCP discovery, TFTP configuration download, and operational state transitions with comprehensive error recovery mechanisms

- **RF Signal Monitoring Engine**: Real-time RF signal detection logic in `cosa_rbus_handler_apis.c` implements continuous monitoring with configurable polling intervals, threshold-based event triggering, and automatic subscriber notification for signal presence changes. Configurable polling interval (default 5 seconds) with adaptive frequency based on signal stability. Event debouncing to prevent spurious notifications during signal fluctuations. Integration with diagnostic data collection for signal quality analysis.

- **Event Processing Architecture**: Asynchronous event handling system supporting both CCSP message bus and RBus protocols for maximum compatibility and performance. Multi-threaded event processing with dedicated RBus worker thread. Event queue management with priority-based processing and overflow protection. Subscriber lifecycle management with automatic cleanup and reconnection handling.

- **Error Handling Strategy**: Comprehensive error detection and recovery mechanisms throughout all hardware interaction layers. HAL operation retry logic with exponential backoff for transient failures. Component health monitoring with automatic restart coordination via systemd. Graceful degradation modes when dependent services are unavailable.

- **Logging & Debugging**: Multi-level logging system with component-specific categories and runtime verbosity control. CCSP trace integration for standardized RDK-B logging infrastructure. RBus event logging for real-time debugging of cable modem state changes. Performance metrics collection for HAL operation timing and success rates.

### Key Configuration Files

| Configuration File | Purpose | Override Mechanisms |
|--------------------|---------|---------------------|
| `/etc/ccsp/cm.cfg` | Main component configuration | Environment variables, compile-time defines |
| `/etc/ccsp/TR181-CM.XML` | TR‑181 parameter definitions | Not user-configurable |
| `/nvram/syscfg.db` | Persistent configuration storage | syscfg CLI, WebConfig API |
| `/tmp/ccsp_msg.cfg` | CCSP message bus configuration | Component restart required |
| `/opt/secure/RFC` | Feature control configuration | RFC server updates |

**Configuration Parameter Categories:**

- **Runtime Behavior**: Polling intervals, timeout values, retry counts, thread pool sizes 
- **Hardware Integration**: HAL interface selection, device-specific parameters, calibration values 
- **Event Publishing**: RBus topic configuration, subscriber limits, event filtering rules 
- **Diagnostic Features**: Debug logging levels, performance monitoring, health check intervals 
- **Security Settings**: Authentication parameters, encryption keys, certificate paths 