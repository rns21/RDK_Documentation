# OneWifi Documentation

OneWifi is RDK-B's unified Wi-Fi management component that provides a modern, service-oriented architecture for wireless connectivity management. It serves as the central orchestrator for all Wi-Fi operations including access point management, station operations, mesh networking, EasyMesh protocol support, and advanced wireless features. OneWifi consolidates previously fragmented Wi-Fi functionality into a cohesive system that abstracts hardware complexity while providing robust 802.11 protocol implementation and integration with RDK-B middleware components.

OneWifi implements IEEE 802.11 protocols (802.11a/b/g/n/ac/ax/be) through direct WiFi HAL integration, manages hostapd for access point operations, provides EasyMesh controller/agent functionality with IEEE 1905 protocol support, and maintains a comprehensive WiFi database for persistent configuration and state management.

```mermaid
graph TD
    subgraph "External Users & Systems"
        HomeUsers[Home Users<br/>🏠 WiFi Clients]
        AdminUsers[Admin Users<br/>👨‍💼 Network Management]
        CloudServices[Cloud Services<br/>☁️ Remote Management]
        MeshNodes[EasyMesh Nodes<br/>🔗 Remote Agents]
    end

    subgraph "RDK-B Device Boundary"
        subgraph "Management Layer"
            WebUI[Web UI<br/>🌐 Local Management]
            TR069[TR-069 Agent<br/>📡 ACS Communication]
            SNMP[SNMP Agent<br/>📊 Network Monitoring]
        end

        OneWifi[OneWifi Component<br/>📶 WiFi Management System<br/>C++ Application]

        subgraph "RDK-B Middleware"
            PSM[PSM Database<br/>💾 Parameter Storage]
            Telemetry[Telemetry 2.0<br/>📈 Data Collection]
            WebConfig[WebConfig Framework<br/>⚙️ Bulk Configuration]
        end

        subgraph "Hardware & Protocol Layer"
            WiFiHAL[WiFi HAL<br/>📡 Hardware Abstraction]
            NetworkHAL[Network HAL<br/>🔌 Interface Management]
            Hostapd[hostapd<br/>🏢 Access Point Daemon]
        end

        subgraph "External Mesh System"
            UnifiedMesh[Unified-Mesh Controller<br/>🕸️ IEEE 1905 Protocol]
        end
    end

    %% User Interactions
    HomeUsers -->|WiFi Connection<br/>802.11 Protocols| OneWifi
    AdminUsers -->|Configuration<br/>Web Interface| WebUI
    AdminUsers -->|Remote Management<br/>TR-181/SNMP| TR069
    AdminUsers -->|Network Monitoring<br/>SNMP v2c/v3| SNMP

    %% External System Interactions  
    CloudServices -->|Remote Configuration<br/>TR-069/WebPA| TR069
    CloudServices -->|Bulk Updates<br/>JSON/MessagePack| WebConfig
    MeshNodes <-->|EasyMesh Protocol<br/>IEEE 1905.1| UnifiedMesh

    %% Internal RDK-B Interactions
    WebUI -->|Parameter Access<br/>RBus/DBus| OneWifi
    TR069 -->|TR-181 Parameters<br/>RBus Messages| OneWifi
    SNMP -->|MIB Access<br/>SNMP Protocol| OneWifi

    OneWifi <-->|Configuration Persistence<br/>Key-Value Store| PSM
    OneWifi -->|Statistics & Events<br/>Telemetry API| Telemetry
    OneWifi <-->|Bulk Configuration<br/>JSON Validation| WebConfig
    OneWifi <-->|EasyMesh Coordination<br/>Unix Sockets| UnifiedMesh

    %% Hardware Interactions
    OneWifi -->|Hardware Control<br/>C API Calls| WiFiHAL
    OneWifi -->|Interface Management<br/>Network APIs| NetworkHAL
    OneWifi <-->|AP Configuration<br/>Control Interface| Hostapd

    WiFiHAL -->|Driver Interface<br/>nl80211| OneWifi
    NetworkHAL -->|Interface Control<br/>netlink/ioctl| OneWifi
    Hostapd -->|802.11 Management<br/>Event Callbacks| OneWifi

    classDef user fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef component fill:#e1f5fe,stroke:#0277bd,stroke-width:3px;
    classDef middleware fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef hardware fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px;

    class HomeUsers,AdminUsers user;
    class OneWifi component;
    class WebUI,TR069,SNMP,PSM,Telemetry,WebConfig middleware;
    class WiFiHAL,NetworkHAL,Hostapd hardware;
    class CloudServices,MeshNodes,UnifiedMesh external;
```

**Key Features & Responsibilities**: 

- **Unified Wi-Fi Management**: Central orchestration of all wireless operations including radio management, VAP (Virtual Access Point) lifecycle, and client association handling across multiple frequency bands (2.4GHz, 5GHz, 6GHz)
- **Service-Oriented Architecture**: Modular design with independent service components for different Wi-Fi functionalities including private networks, public hotspots, mesh operations, and analytics
- **802.11 Protocol Implementation**: Direct implementation of IEEE 802.11 standards (a/b/g/n/ac/ax/be) through WiFi HAL abstraction with support for advanced features like MU-MIMO, OFDMA, and beamforming
- **Hostapd Integration**: Native hostapd daemon management for access point configuration, client authentication, and 802.11 frame processing with dynamic configuration updates
- **EasyMesh Support**: Complete IEEE 1905 Multi-AP protocol implementation with controller and agent capabilities, unified-mesh system integration, and automatic mesh topology management
- **WiFi Database Management**: Persistent storage system for configuration data, client information, statistics, and operational state with atomic transaction support
- **Advanced Analytics**: Real-time monitoring and analytics including client behavior analysis, performance metrics, security event detection, and network optimization
- **WebConfig Integration**: Dynamic configuration management through WebPA/WebConfig protocol with support for bulk configuration updates and rollback capabilities

## Design

OneWifi employs a layered service-oriented architecture that separates concerns while maintaining tight integration for optimal performance. The design prioritizes modularity through independent service components, each responsible for specific Wi-Fi functionality domains, while a central manager coordinates cross-service interactions and maintains global state consistency. The architecture directly interfaces with WiFi HAL for hardware abstraction and hostapd for 802.11 protocol compliance.

The northbound interfaces support RBus/DBus messaging for TR-181 parameter access, WebConfig for bulk configuration management, and EasyMesh APIs for mesh networking coordination. Southbound integration includes WiFi HAL for hardware control, hostapd for access point operations, and platform-specific networking services. The WiFi database provides persistent storage with ACID properties, enabling reliable state management across system reboots and configuration changes.

IPC mechanisms center around RBus for high-performance message passing between RDK-B components, with fallback DBus support for legacy compatibility. Event-driven architecture ensures responsive handling of hardware events, client state changes, and configuration updates. Data persistence utilizes a custom WiFi database implementation that maintains configuration integrity and supports atomic operations for complex multi-parameter updates.

```mermaid
graph TD
    subgraph "RDK-B Middleware"
        TR181[TR-181 Data Model]
        WebConfig[WebConfig Framework]
        Telemetry[Telemetry Service]
        CCSP[CCSP Components]
    end

    subgraph "OneWifi Container (C/C++)"
        subgraph "Core Manager"
            WifiMgr[WiFi Manager]
            WifiCtrl[WiFi Controller]
            EventMgr[Event Manager]
            QueueMgr[Queue Manager]
        end

        subgraph "Service Layer"
            PrivateSvc[Private VAP Service<br/>Home Networks]
            PublicSvc[Public VAP Service<br/>Hotspots/XHS]
            MeshSvc[Mesh Service<br/>Backhaul/STA]
        end

        subgraph "Application Layer"
            Analytics[Analytics App]
            Harvester[Harvester App]
            Blaster[Blaster App]
            CAC[CAC App]
            CSI[CSI App]
            EasyMesh[EasyMesh App]
            StaMgr[STA Manager App]
        end

        subgraph "Data & Protocol Layer"
            WiFiDB[(WiFi Database)]
            WebConfigMgr[WebConfig Manager]
            PlatformBus[Platform Bus Layer<br/>RBus/DBus]
        end
    end

    subgraph "802.11 Protocol & Hardware"
        Hostapd[hostapd Daemon<br/>AP Management]
        WpaSupplicant[wpa_supplicant<br/>STA Operations]
        WiFiHAL[WiFi HAL<br/>802.11 Implementation]
        NetworkHAL[Network HAL<br/>Interface Management]
    end

    subgraph "EasyMesh Ecosystem"
        UnifiedMesh[Unified-Mesh System<br/>IEEE 1905 Controller]
        MeshAgent[EasyMesh Agent<br/>IEEE 1905 Protocol]
    end

    subgraph "External Systems"
        CloudServices[Cloud/HeadEnd Services]
        WebUI[Web Management Interface]
        SNMP[SNMP Management]
    end

    %% Data Flow Connections
    TR181 -->|RBus/TR-181 Parameters| PlatformBus
    WebConfig -->|JSON Configuration| WebConfigMgr
    Telemetry -->|Statistics/Events| PlatformBus
    CCSP -->|Component Communication| PlatformBus

    PlatformBus -->|IPC Messages| WifiCtrl
    WebConfigMgr -->|Config Updates| WifiCtrl
    WifiCtrl -->|Service Commands| PrivateSvc
    WifiCtrl -->|Service Commands| PublicSvc
    WifiCtrl -->|Service Commands| MeshSvc

    Analytics -->|HAL Events| EventMgr
    Harvester -->|Data Collection| WiFiDB
    EasyMesh -->|Mesh Protocol| MeshAgent
    StaMgr -->|Station Control| WpaSupplicant

    WifiMgr -->|Hardware Control| WiFiHAL
    WifiMgr -->|AP Configuration| Hostapd
    WiFiDB -->|Persistent Storage| WifiMgr

    EasyMesh -->|IEEE 1905 Protocol| UnifiedMesh
    UnifiedMesh -->|Mesh Coordination| MeshAgent

    CloudServices -->|WebPA/TR-069| WebConfig
    WebUI -->|Management APIs| TR181
    SNMP -->|SNMP v2c/v3| TR181

    classDef core fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef service fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef app fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef protocol fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px;
    classDef data fill:#f1f8e9,stroke:#689f38,stroke-width:2px;

    class WifiMgr,WifiCtrl,EventMgr,QueueMgr core;
    class PrivateSvc,PublicSvc,MeshSvc service;
    class Analytics,Harvester,Blaster,CAC,CSI,EasyMesh,StaMgr app;
    class Hostapd,WpaSupplicant,WiFiHAL,NetworkHAL,UnifiedMesh,MeshAgent protocol;
    class CloudServices,WebUI,SNMP external;
    class WiFiDB,WebConfigMgr,PlatformBus data;
```

### Prerequisites and Dependencies

**RDK-B Platform Requirements (MUST):**

- **DISTRO Features**: `DISTRO_FEATURES += "wifi", "rdk-onewifi"` for core OneWifi support; `DISTRO_FEATURES += "rdk-easymesh"` for mesh functionality 
- **Build Dependencies**: `meta-rdk-broadband`, `meta-openembedded`, WiFi HAL interface libraries, hostapd/wpa_supplicant packages 
- **RDK-B Components**: CcspCommonLibrary (bus framework), hal-wifi interface, rbus/dbus message infrastructure, webconfig-framework 
- **HAL Dependencies**: WiFi HAL v3.0+ with 802.11ax support, Network HAL for interface management, minimum driver support for nl80211 
- **Systemd Services**: `rbus.service`, `CcspWifiSsp.service` (if legacy integration), networking services must be active before OneWifi initialization 
- **Hardware Requirements**: Multi-radio WiFi chipsets with 802.11ac minimum, 802.11ax preferred for optimal performance 

**RDK-B Integration Requirements (MUST):**

- **Message Bus**: RBus namespace reservation for `Device.WiFi.*` parameters, DBus fallback support for legacy components 
- **TR-181 Data Model**: Complete WiFi data model implementation per TR-181 Issue 2 Amendment 15, custom RDK extensions for mesh and analytics 
- **Configuration Files**: `/nvram/wifi_defaults.json`, `/opt/onewifi/config/`, EasyMesh configuration in `/nvram/EasymeshCfg.json` 
- **Startup Order**: Network interfaces → HAL initialization → RBus/DBus → OneWifi → dependent applications 
- **Resource Constraints**: 64MB RAM minimum, 256MB for full analytics suite, 16MB persistent storage for WiFi database 

**Performance & Optimization (SHOULD):**

- **Enhanced Features**: `DISTRO_FEATURES += "rdk-analytics"` for advanced monitoring, `rdk-mesh-optimization` for performance tuning 
- **Recommended Hardware**: WiFi 6E/7 support for 6GHz operation, hardware-accelerated cryptography for WPA3, dedicated mesh backhaul radios 
- **Configuration Tuning**: Channel optimization algorithms, load balancing parameters, mesh topology configuration for optimal performance 
- **Monitoring Integration**: Telemetry 2.0 framework integration, SNMP v3 support, cloud analytics integration for network optimization 

**RDK-B Design Limitations & Considerations:**

- **Known Limitations**: Maximum 16 VAPs per radio, mesh network supports up to 32 nodes, hostapd restart required for some security changes 
- **Scalability Boundaries**: 128 concurrent clients per VAP, 512 clients total per device, EasyMesh supports maximum 4-hop topology 
- **Platform Compatibility**: Supports RDK-B 2023Q1+, requires Linux 4.19+ for WiFi 6E features, ARM/x86_64 architectures 
- **Resource Usage**: Base memory footprint 32MB, up to 128MB with all applications enabled, 2-4MB persistent storage typical usage 

**Dependent Components:**

- **CcspTr069Pa**: Depends on OneWifi TR-181 parameters for remote management capabilities, requires parameter synchronization 
- **Utopia**: Network configuration service dependency for bridge management and VLAN configuration in mesh scenarios 
- **RdkWanManager**: Coordination required for mesh backhaul interface management and WAN failover scenarios 
- **Telemetry Services**: Relies on OneWifi statistics and event data for network health monitoring and reporting 

**Threading Model**

OneWifi implements a hybrid threading architecture combining event-driven processing with dedicated worker threads for performance-critical operations:

- **Threading Architecture**: Multi-threaded with event-driven core and specialized worker pools 
- **Main Thread**: Event loop management, component lifecycle, IPC message handling, configuration processing 
- **Worker Threads**:
  - **HAL Event Thread**: Processes hardware interrupts, 802.11 frame events, radio state changes 
  - **Service Threads**: Individual threads per service (Private, Public, Mesh) for isolated VAP management 
  - **Application Threads**: Background processing for Analytics, Harvester, and other applications with configurable priorities 
  - **Database Thread**: Asynchronous database operations, transaction processing, periodic persistence 
  - **WebConfig Thread**: Configuration validation, bulk updates, rollback operations 
- **Synchronization**: pthread mutexes for shared data structures, RWlocks for read-heavy database access, condition variables for event signaling 

## Component State Flow

### Initialization to Active State

OneWifi follows a carefully orchestrated startup sequence ensuring proper dependency resolution and service activation. The initialization process validates hardware capabilities, establishes IPC connections, and progressively activates service components based on configuration requirements.

```mermaid
stateDiagram-v2
    [*] --> Initializing
    Initializing --> LoadingHAL: Load WiFi HAL Interface
    LoadingHAL --> InitializingDB: Initialize WiFi Database
    InitializingDB --> LoadingConfig: Load Configuration Files
    LoadingConfig --> RegisteringTR181: Register TR-181 Data Model
    RegisteringTR181 --> ConnectingBus: Connect RBus/DBus IPC
    ConnectingBus --> InitializingServices: Initialize Service Layer
    InitializingServices --> StartingHostapd: Configure hostapd
    StartingHostapd --> LoadingApplications: Load Application Modules
    LoadingApplications --> ConfiguringMesh: Configure EasyMesh (if enabled)
    ConfiguringMesh --> Active: All Systems Ready
    Active --> RuntimeUpdate: Configuration Change
    RuntimeUpdate --> Active: Update Applied
    Active --> ServiceRestart: Service Failure
    ServiceRestart --> Active: Service Recovered
    Active --> Shutdown: Stop Request
    Shutdown --> [*]

    note right of Initializing
        - Initialize logging subsystem
        - Validate hardware capabilities
        - Setup memory pools
        - Initialize threading infrastructure
    end note

    note right of LoadingHAL
        - Load WiFi HAL library
        - Enumerate radio capabilities
        - Initialize 802.11 protocol stack
        - Configure hardware abstraction
    end note

    note right of InitializingDB
        - Open WiFi database
        - Validate schema version
        - Run migration scripts
        - Initialize transaction manager
    end note

    note right of Active
        - Process client requests
        - Handle hardware events
        - Monitor service health
        - Execute scheduled tasks
    end note
```

### Runtime State Changes and Context Switching

OneWifi manages multiple operational contexts that can trigger state transitions during normal operation. These context switches are designed to maintain service availability while adapting to network conditions and configuration changes.

**State Change Triggers:**
- **Hardware Events**: Radio failure detection, channel radar detection (DFS), thermal throttling events requiring adaptive responses
- **Network Topology Changes**: Mesh node addition/removal, backhaul link quality degradation, client roaming events between VAPs
- **Configuration Updates**: WebConfig bulk updates, TR-181 parameter changes, security policy modifications requiring service restarts
- **Service Health Events**: Application crashes with automatic recovery, database corruption with repair procedures, memory pressure adaptation

**Context Switching Scenarios:**

**Mesh Network Context Switch:**
```mermaid
stateDiagram-v2
    state "Mesh Controller Mode" as ControllerMode
    state "Mesh Agent Mode" as AgentMode
    state "Standalone Mode" as StandaloneMode
    
    [*] --> StandaloneMode
    StandaloneMode --> ControllerMode: Mesh Enable + Controller Config
    StandaloneMode --> AgentMode: Mesh Enable + Agent Discovery
    ControllerMode --> AgentMode: Controller Failure/Handover
    AgentMode --> ControllerMode: Promotion Event
    ControllerMode --> StandaloneMode: Mesh Disable
    AgentMode --> StandaloneMode: Mesh Disable
```

**Radio Operating Mode Context Switch:**
```mermaid
stateDiagram-v2
    state "Normal Operation" as NormalOp
    state "DFS Channel Scan" as DFSScan  
    state "Emergency Channel" as EmergencyChannel
    state "Thermal Throttle" as ThermalMode
    
    [*] --> NormalOp
    NormalOp --> DFSScan: Radar Detection
    NormalOp --> ThermalMode: Temperature Threshold
    NormalOp --> EmergencyChannel: All DFS Channels Blocked
    DFSScan --> NormalOp: Clear Channel Found
    DFSScan --> EmergencyChannel: No Clear Channels
    ThermalMode --> NormalOp: Temperature Normal
    EmergencyChannel --> NormalOp: DFS Timer Expired
```

## Call Flow

### Primary Call Flows

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant System as System Init
    participant OneWifi as OneWifi Core
    participant HAL as WiFi HAL
    participant DB as WiFi Database
    participant Hostapd as hostapd Daemon
    participant RBus as RBus/DBus

    System->>OneWifi: Start OneWifi Service
    OneWifi->>HAL: wifi_hal_init()
    HAL-->>OneWifi: Capabilities & Radio Info
    OneWifi->>DB: Initialize Database Schema
    DB-->>OneWifi: Database Ready
    OneWifi->>OneWifi: Load Configuration Files
    OneWifi->>RBus: Register TR-181 Parameters
    RBus-->>OneWifi: Registration Complete
    OneWifi->>Hostapd: Configure AP Settings
    Hostapd-->>OneWifi: hostapd Ready
    OneWifi->>OneWifi: Start Service Layer
    OneWifi->>System: Initialization Complete (Active State)
```

**VAP Creation and Management Call Flow:**

```mermaid
sequenceDiagram
    participant WebConfig as WebConfig/TR-181
    participant OneWifi as OneWifi Controller
    participant Service as VAP Service
    participant HAL as WiFi HAL
    participant Hostapd as hostapd
    participant DB as WiFi Database

    WebConfig->>OneWifi: Create VAP Request (JSON/TR-181)
    OneWifi->>OneWifi: Validate Configuration
    OneWifi->>Service: Initialize VAP Service
    Service->>HAL: wifi_createVAP()
    HAL-->>Service: VAP Created (Interface Name)
    Service->>Hostapd: Configure AP Parameters
    Hostapd-->>Service: Configuration Applied
    Service->>DB: Store VAP Configuration
    DB-->>Service: Persistence Complete
    Service-->>OneWifi: VAP Ready
    OneWifi-->>WebConfig: Success Response
```

**EasyMesh Controller/Agent Interaction Flow:**

```mermaid
sequenceDiagram
    participant Controller as EasyMesh Controller
    participant OneWifi as OneWifi Agent
    participant IEEE1905 as IEEE 1905 Protocol
    participant UnifiedMesh as Unified-Mesh System
    participant MeshHAL as WiFi HAL (Mesh)

    Controller->>IEEE1905: Multi-AP Configuration
    IEEE1905->>UnifiedMesh: IEEE 1905 Message
    UnifiedMesh->>OneWifi: EasyMesh Config Update
    OneWifi->>OneWifi: Validate Mesh Configuration
    OneWifi->>MeshHAL: Configure Mesh VAPs
    MeshHAL-->>OneWifi: Mesh Interface Ready
    OneWifi->>UnifiedMesh: Configuration Applied
    UnifiedMesh->>IEEE1905: ACK Response
    IEEE1905-->>Controller: Configuration Success
    
    Note over Controller,MeshHAL: Ongoing mesh topology monitoring and optimization
    
    OneWifi->>UnifiedMesh: Mesh Metrics/Statistics
    UnifiedMesh->>IEEE1905: Periodic Reports
    IEEE1905->>Controller: Network Status Updates
```

## TR‑181 Data Models

### Supported TR-181 Parameters

OneWifi provides comprehensive TR-181 data model support with full compliance to TR-181 Issue 2 Amendment 15 specifications, extended with RDK-specific enhancements for advanced wireless features, mesh networking, and analytics capabilities.

#### Object Hierarchy

```
Device.
└── WiFi.
    ├── RadioNumberOfEntries (unsignedInt, R)
    ├── SSIDNumberOfEntries (unsignedInt, R)
    ├── AccessPointNumberOfEntries (unsignedInt, R)
    ├── X_RDK_MeshAgent.
    │   ├── Enable (boolean, R/W)
    │   ├── Status (string, R)
    │   └── URL (string, R/W)
    ├── Radio.{i}.
    │   ├── Enable (boolean, R/W)
    │   ├── Status (string, R)
    │   ├── Channel (unsignedInt, R/W)
    │   ├── OperatingFrequencyBand (string, R/W)
    │   ├── OperatingStandards (string, R/W)
    │   ├── TransmitPower (int, R/W)
    │   └── X_RDK_AutoChannelEnable (boolean, R/W)
    ├── SSID.{i}.
    │   ├── Enable (boolean, R/W)
    │   ├── Status (string, R)
    │   ├── Name (string, R/W)
    │   └── SSID (string, R/W)
    ├── AccessPoint.{i}.
    │   ├── Enable (boolean, R/W)
    │   ├── Status (string, R)
    │   ├── SSIDReference (string, R/W)
    │   ├── Security.
    │   │   ├── ModeEnabled (string, R/W)
    │   │   ├── KeyPassphrase (string, R/W)
    │   │   └── X_RDK_SAE_Enable (boolean, R/W)
    │   └── AssociatedDevice.{i}.
    │       ├── MACAddress (string, R)
    │       ├── SignalStrength (int, R)
    │       └── X_RDK_RSSI (int, R)
    └── X_RDK_EasyMesh.
        ├── Enable (boolean, R/W)
        ├── ControllerEnable (boolean, R/W)
        ├── AgentEnable (boolean, R/W)
        └── NetworkConfiguration (string, R/W)
```

#### Parameter Definitions

**Core Radio Management Parameters:**

| Parameter Path | Data Type | Access | Default Value | Description | BBF Compliance |
|----------------|-----------|--------|---------------|-------------|----------------|
| `Device.WiFi.Radio.{i}.Enable` | boolean | R/W | `true` | Enables or disables the radio. When false, all associated SSIDs are disabled and no wireless activity occurs on this radio interface. | TR-181 Issue 2 |
| `Device.WiFi.Radio.{i}.Status` | string | R | `"Up"` | Current operational status of the radio. Enumeration: Up, Down, Unknown, Dormant, NotPresent, LowerLayerDown, Error | TR-181 Issue 2 |
| `Device.WiFi.Radio.{i}.Channel` | unsignedInt | R/W | `6` (2.4GHz), `36` (5GHz) | Current operating channel number. Automatic channel selection when AutoChannelEnable is true. Range 1-14 for 2.4GHz, 36-165 for 5GHz, 1-233 for 6GHz | TR-181 Issue 2 |
| `Device.WiFi.Radio.{i}.OperatingFrequencyBand` | string | R/W | `"2.4GHz"` | Operating frequency band for the radio. Enumeration: 2.4GHz, 5GHz, 6GHz. Changes require radio restart for proper hardware configuration | TR-181 Issue 2 |
| `Device.WiFi.Radio.{i}.OperatingStandards` | string | R/W | `"n,ac,ax"` | Comma-separated list of 802.11 standards supported. Valid: a,b,g,n,ac,ax,be. Determines modulation schemes and feature availability | TR-181 Issue 2 |
| `Device.WiFi.Radio.{i}.TransmitPower` | int | R/W | `100` | Current transmit power as percentage of maximum capability. Range 1-100. Actual power limited by regulatory domain and thermal constraints | TR-181 Issue 2 |

**VAP and Security Parameters:**

| Parameter Path | Data Type | Access | Default Value | Description | BBF Compliance |
|----------------|-----------|--------|---------------|-------------|----------------|
| `Device.WiFi.SSID.{i}.Enable` | boolean | R/W | `false` | Enables or disables the SSID. When enabled, the virtual access point becomes operational and begins broadcasting | TR-181 Issue 2 |
| `Device.WiFi.SSID.{i}.Status` | string | R | `"Disabled"` | Current SSID operational status. Enumeration: Enabled, Disabled, Error, ErrorAuthenticationFailure, ErrorAssociationFailure | TR-181 Issue 2 |
| `Device.WiFi.SSID.{i}.Name` | string | R/W | `""` | Human-readable SSID identifier for management purposes. Does not affect over-the-air SSID broadcast name | TR-181 Issue 2 |
| `Device.WiFi.SSID.{i}.SSID` | string | R/W | `""` | Service Set Identifier broadcast over the air. Maximum 32 octets. UTF-8 encoding with proper validation for wireless compatibility | TR-181 Issue 2 |
| `Device.WiFi.AccessPoint.{i}.Security.ModeEnabled` | string | R/W | `"None"` | Security mode for the access point. Enumeration: None, WEP-64, WEP-128, WPA-Personal, WPA2-Personal, WPA-WPA2-Personal, WPA2-Enterprise, WPA3-Personal, WPA3-Enterprise, WPA2-WPA3-Personal | TR-181 Issue 2 |
| `Device.WiFi.AccessPoint.{i}.Security.KeyPassphrase` | string | R/W | `""` | WPA/WPA2/WPA3 pre-shared key passphrase. Length 8-63 ASCII characters or 64-character hexadecimal key. Stored encrypted in persistent database | TR-181 Issue 2 |

**Custom RDK Extensions:**

**EasyMesh Multi-AP Parameters:**

| Parameter Path | Data Type | Access | Default Value | Description | BBF Compliance |
|----------------|-----------|--------|---------------|-------------|----------------|
| `Device.WiFi.X_RDK_EasyMesh.Enable` | boolean | R/W | `false` | Master enable for EasyMesh Multi-AP functionality. Controls IEEE 1905 protocol stack and mesh networking capabilities | RDK Custom |
| `Device.WiFi.X_RDK_EasyMesh.ControllerEnable` | boolean | R/W | `false` | Enable EasyMesh controller functionality for mesh network management, topology optimization, and multi-AP coordination | RDK Custom |
| `Device.WiFi.X_RDK_EasyMesh.AgentEnable` | boolean | R/W | `false` | Enable EasyMesh agent functionality to participate in mesh network under controller management with automatic configuration | RDK Custom |
| `Device.WiFi.X_RDK_EasyMesh.NetworkConfiguration` | string | R/W | `""` | JSON-encoded EasyMesh network configuration including AL-MAC address, backhaul credentials, and mesh topology parameters | RDK Custom |

**Mesh and Analytics Extensions:**

- **Device.WiFi.X_RDK_MeshAgent.Enable**: Controls mesh agent daemon for unified-mesh system integration
- **Device.WiFi.Radio.{i}.X_RDK_AutoChannelEnable**: Enhanced automatic channel selection with DFS and interference avoidance  
- **Device.WiFi.AccessPoint.{i}.AssociatedDevice.{i}.X_RDK_RSSI**: Extended RSSI reporting with historical statistics
- **Device.WiFi.AccessPoint.{i}.Security.X_RDK_SAE_Enable**: WPA3 Simultaneous Authentication of Equals support

### Parameter Registration and Access

OneWifi registers TR-181 parameters through RBus message infrastructure with efficient parameter access patterns optimized for high-frequency operations. The registration process establishes parameter namespaces, access controls, and validation rules during component initialization.

## Internal Modules

OneWifi's modular architecture provides clear separation of concerns while enabling efficient inter-module communication and shared resource management.

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| **WiFi Manager** | Core orchestration engine managing component lifecycle, hardware abstraction, and global state coordination | `wifi_mgr.c`, `wifi_mgr.h` |
| **WiFi Controller** | Central event processing hub handling IPC messages, configuration updates, and service coordination | `wifi_ctrl.c`, `wifi_ctrl_rbus_handlers.c`, `wifi_ctrl_webconfig.c` |
| **Service Layer** | Modular service architecture with specialized handlers for different VAP types and network functions | `vap_svc_private.c`, `vap_svc_public.c`, `vap_svc_mesh_gw.c` |
| **WiFi Database** | ACID-compliant persistent storage system for configuration data, client information, and operational statistics | `wifi_db.c`, `wifi_db_apis.c` |
| **Application Framework** | Plugin-based application system for analytics, harvesting, monitoring, and advanced wireless features | `wifi_apps_mgr.c`, `analytics/`, `harvester/`, `blaster/` |
| **EasyMesh Integration** | IEEE 1905 Multi-AP protocol implementation with controller/agent capabilities and unified-mesh system coordination | `wifi_em.c`, `wifi_easymesh_translator.c` |
| **WebConfig Manager** | Bulk configuration management supporting JSON-based updates, validation, and atomic rollback operations | `wifi_webconfig.c`, `wifi_decoder.c`, `wifi_encoder.c` |
| **Protocol Handlers** | 802.11 frame processing, security protocol implementation, and advanced wireless feature support | `wifi_8021x.c`, `wifi_hal.h` integration |

```mermaid
flowchart TD
    subgraph OneWifi_Core ["OneWifi Core Architecture"]
        subgraph Management_Layer ["Management Layer"]
            WifiMgr([WiFi Manager<br/>Core Orchestration])
            WifiCtrl([WiFi Controller<br/>Event Processing])
            EventMgr([Event Manager<br/>IPC Handling])
        end

        subgraph Service_Layer ["Service Layer"]
            PrivateSvc([Private VAP Service<br/>Home Networks])
            PublicSvc([Public VAP Service<br/>Hotspots])
            MeshSvc([Mesh Service<br/>Backhaul/STA])
        end

        subgraph Application_Layer ["Application Layer"]
            Analytics([Analytics Engine<br/>Client Behavior])
            Harvester([Data Harvester<br/>Metrics Collection])
            EasyMesh([EasyMesh App<br/>IEEE 1905 Protocol])
            Blaster([Traffic Blaster<br/>Performance Testing])
        end

        subgraph Data_Layer ["Data & Persistence Layer"]
            WiFiDB[(WiFi Database<br/>ACID Storage)]
            ConfigMgr([WebConfig Manager<br/>Bulk Updates])
            BusLayer([RBus/DBus Layer<br/>IPC Infrastructure])
        end
    end

    %% Inter-module connections
    WifiMgr --> WifiCtrl
    WifiCtrl --> PrivateSvc
    WifiCtrl --> PublicSvc
    WifiCtrl --> MeshSvc
    
    Analytics --> EventMgr
    Harvester --> WiFiDB
    EasyMesh --> MeshSvc
    Blaster --> PrivateSvc

    ConfigMgr --> WifiCtrl
    BusLayer --> EventMgr
    WiFiDB --> WifiMgr

    classDef mgmt fill:#e3f2fd,stroke:#1976d2,stroke-width:2px;
    classDef service fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef app fill:#fff8e1,stroke:#f57c00,stroke-width:2px;
    classDef data fill:#e8f5e8,stroke:#388e3c,stroke-width:2px;

    class WifiMgr,WifiCtrl,EventMgr mgmt;
    class PrivateSvc,PublicSvc,MeshSvc service;
    class Analytics,Harvester,EasyMesh,Blaster app;
    class WiFiDB,ConfigMgr,BusLayer data;
```

## Component Interactions & IPC Mechanisms

### System Architecture Overview

OneWifi integrates with RDK-B middleware through standardized IPC mechanisms while maintaining direct hardware control through WiFi HAL and hostapd integration. The component serves as the authoritative source for all wireless configuration and operational data within the RDK-B ecosystem.

```mermaid
flowchart TD
    subgraph "RDK-B Middleware Ecosystem"
        subgraph "Management Layer"
            TR069[TR-069 Agent<br/>Remote Management]
            WebPA[WebPA Agent<br/>Cloud Interface] 
            SNMP[SNMP Agent<br/>Network Management]
        end
        
        subgraph "Configuration Layer"
            WebConfig[WebConfig Framework<br/>Bulk Updates]
            PSM[PSM Database<br/>Parameter Storage]
            Telemetry[Telemetry 2.0<br/>Data Collection]
        end
    end

    subgraph "OneWifi Component"
        subgraph "Core Services"
            Core[OneWifi Core<br/>C++ Application]
            DB[(WiFi Database<br/>SQLite-based)]
            Apps[Application Suite<br/>Analytics/Mesh/etc.]
        end
    end

    subgraph "Protocol & Hardware Layer"
        subgraph "802.11 Implementation"
            Hostapd[hostapd v2.10+<br/>AP Management]
            WpaSupplicant[wpa_supplicant<br/>STA Operations]
        end
        
        subgraph "Hardware Abstraction"
            WiFiHAL[WiFi HAL v3.0<br/>802.11ax/be Support]
            NetworkHAL[Network HAL<br/>Interface Control]
        end
        
        subgraph "Kernel & Drivers"
            nl80211[nl80211 Interface<br/>cfg80211 Framework]
            WifiDriver[WiFi Driver<br/>Vendor-specific]
        end
    end

    subgraph "EasyMesh Ecosystem"
        UnifiedMesh[Unified-Mesh Controller<br/>IEEE 1905.1 Protocol]
        MeshAgents[EasyMesh Agents<br/>Remote Nodes]
    end

    %% Communication Flows
    TR069 -.->|TR-181 Parameters<br/>RBus Protocol| Core
    WebPA -.->|JSON Configuration<br/>WebConfig API| Core
    SNMP -.->|SNMP v2c/v3<br/>MIB Access| Core
    
    WebConfig -->|Bulk Configuration<br/>JSON/MessagePack| Core
    PSM <-->|Parameter Persistence<br/>DBus Messages| Core
    Telemetry <-->|Statistics & Events<br/>RBus Telemetry API| Core
    
    Core <-->|Hardware Control<br/>Direct API Calls| WiFiHAL
    Core <-->|Network Interface<br/>Management APIs| NetworkHAL
    Core <-->|AP Configuration<br/>hostapd_cli/DBus| Hostapd
    Core <-->|STA Control<br/>wpa_cli/DBus| WpaSupplicant
    Core <-->|ACID Transactions<br/>SQL Operations| DB
    
    WiFiHAL <-->|nl80211 Commands<br/>Netlink Sockets| nl80211
    NetworkHAL <-->|Interface Control<br/>ioctl/netlink| nl80211
    Hostapd <-->|Driver Interface<br/>nl80211 Commands| nl80211
    WpaSupplicant <-->|Driver Interface<br/>nl80211 Commands| nl80211
    
    nl80211 <-->|Hardware Commands<br/>Vendor Extensions| WifiDriver
    
    Apps <-->|IEEE 1905 Messages<br/>Unix Domain Sockets| UnifiedMesh
    UnifiedMesh <-->|Multi-AP Protocol<br/>IEEE 1905.1/TCP| MeshAgents

    classDef middleware fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef onewifi fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px;
    classDef protocol fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef hardware fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef mesh fill:#fce4ec,stroke:#c2185b,stroke-width:2px;

    class TR069,WebPA,SNMP,WebConfig,PSM,Telemetry middleware;
    class Core,DB,Apps onewifi;
    class Hostapd,WpaSupplicant,WiFiHAL,NetworkHAL protocol;
    class nl80211,WifiDriver hardware;
    class UnifiedMesh,MeshAgents mesh;
```

### Detailed Interaction Matrix

| Target Component/Layer | Interaction Purpose | IPC Mechanism | Message Format | Communication Pattern | Key APIs/Endpoints |
|------------------------|-------------------|---------------|----------------|---------------------|------------------|
| **RDK-B Middleware Components** |
| TR-069 Agent | Remote parameter management, firmware upgrades, diagnostics | RBus Events/Methods | JSON Parameter Sets | Request-Response/Event Notifications | `Device.WiFi.*` namespace, `rbus_method_table` |
| WebPA Agent | Cloud-based configuration, bulk parameter updates | WebConfig Framework | JSON/MessagePack | RESTful HTTP/WebSocket | `POST /api/v1/device/config`, WebSocket events |
| PSM Database | Parameter persistence, cross-component data sharing | DBus/RBus Messages | Key-Value Pairs | Synchronous Get/Set Operations | `PSM_Set()`, `PSM_Get()`, namespace `eRT.com.cisco.spvtg.ccsp.wifi` |
| Telemetry 2.0 | Statistics reporting, event data collection, performance metrics | RBus Telemetry API | Structured Event Data | Asynchronous Publishing | `t2_event_s()`, `t2_event_d()`, marker-based reporting |
| **System & HAL Layers** |
| WiFi HAL | Hardware control, 802.11 protocol implementation, radio management | Direct Function Calls | C Structure Pointers | Synchronous API Calls | `wifi_createVAP()`, `wifi_setRadioOperatingParameters()`, `wifi_hal_connect()` |
| Network HAL | Interface management, VLAN configuration, bridge operations | Direct Function Calls | C Structures | Synchronous Function Calls | `nethal_addInterface()`, `nethal_setBridgeConfig()` |
| hostapd Daemon | Access point configuration, client authentication, 802.11 frame processing | Unix Domain Sockets/DBus | hostapd Control Protocol | Request-Response/Event Callbacks | `/var/run/hostapd/wlan0`, `hostapd_ctrl_iface` |
| wpa_supplicant | Station mode operations, network scanning, connection management | Unix Domain Sockets/DBus | wpa_supplicant Control Protocol | Request-Response/Event Callbacks | `/var/run/wpa_supplicant/wlan0`, `wpa_ctrl_request()` |
| **External Systems** |
| Unified-Mesh System | EasyMesh controller coordination, IEEE 1905 protocol handling | Unix Domain Sockets | IEEE 1905 TLV Messages | Event-Driven Protocol Exchange | `/tmp/mesh_controller.sock`, Multi-AP protocol messages |
| Cloud Services | Configuration backup, analytics upload, remote diagnostics | HTTPS/WebSocket | JSON API Payloads | RESTful/Event Streaming | Cloud-specific endpoints, OAuth 2.0 authentication |

### Event Publishing & Subscription

**Events Published by OneWifi:**

| Event Name | Event Topic/Path | Trigger Condition | Payload Format | Subscriber Components |
|------------|-----------------|-------------------|----------------|---------------------|
| `wifi_radio_status_change` | `Device.WiFi.Radio.{i}.Status` | Radio state transitions (Up/Down/Error) | JSON: `{radio_index, old_status, new_status, timestamp, reason}` | TR-069, WebPA, Telemetry, Network Manager |
| `wifi_client_connect` | `Device.WiFi.AccessPoint.{i}.AssociatedDevice` | Client association completion | JSON: `{vap_index, mac_address, signal_strength, capabilities, timestamp}` | Analytics, Harvester, Parental Controls, QoS Manager |
| `wifi_mesh_topology_change` | `Device.WiFi.X_RDK_EasyMesh.Topology` | Mesh network topology updates | JSON: `{event_type, node_mac, link_quality, hop_count, timestamp}` | Unified-Mesh, Network Optimizer, Telemetry |
| `wifi_security_event` | `Device.WiFi.Security.Event` | Authentication failures, intrusion detection | JSON: `{event_type, severity, mac_address, details, timestamp}` | Security Manager, Logging Service, SNMP Agent |
| `wifi_performance_alert` | `Device.WiFi.Performance.Alert` | Threshold violations, degraded performance | JSON: `{metric_type, threshold, current_value, vap_index, timestamp}` | Performance Monitor, Auto-Optimization, Telemetry |

**Events Consumed by OneWifi:**

| Event Source | Event Topic/Path | Purpose | Expected Payload | Handler Function |
|-------------|-----------------|---------|------------------|------------------|
| WebConfig Framework | `webconfig.wifi.update` | Bulk configuration updates, factory reset preparation | JSON: `{subdoc_type, config_data, transaction_id}` | `webconfig_event_handler()` |
| Network Manager | `network.interface.status` | Interface state changes, VLAN updates, bridge modifications | JSON: `{interface_name, status, ip_config, bridge_info}` | `network_interface_event_handler()` |
| System Health Monitor | `system.thermal.alert` | Thermal throttling requirements, emergency shutdown triggers | JSON: `{temperature, threshold, action_required, severity}` | `thermal_management_handler()` |
| Time Service | `system.time.sync` | Time synchronization events for certificate validation | JSON: `{sync_status, ntp_server, accuracy, timestamp}` | `time_sync_event_handler()` |

### IPC Flow Patterns

**Primary Configuration Flow - WebConfig Bulk Update:**

```mermaid
sequenceDiagram
    participant Cloud as Cloud Service
    participant WebPA as WebPA Agent
    participant WebConfig as WebConfig Framework
    participant OneWifi as OneWifi Core
    participant HAL as WiFi HAL
    participant Hostapd as hostapd

    Cloud->>WebPA: Configuration Update (HTTPS)
    WebPA->>WebConfig: Process Config Document
    WebConfig->>WebConfig: Validate JSON Schema
    WebConfig->>OneWifi: Apply WiFi Configuration
    OneWifi->>OneWifi: Validate Parameters
    OneWifi->>HAL: Update Radio Settings
    HAL-->>OneWifi: Configuration Applied
    OneWifi->>Hostapd: Update AP Configuration
    Hostapd-->>OneWifi: hostapd Reloaded
    OneWifi-->>WebConfig: Success Response
    WebConfig-->>WebPA: Configuration Complete
    WebPA-->>Cloud: HTTP 200 OK + Status
```

**EasyMesh Coordination Flow:**

```mermaid
sequenceDiagram
    participant Controller as EasyMesh Controller
    participant UnifiedMesh as Unified-Mesh System
    participant OneWifi as OneWifi Agent
    participant MeshHAL as WiFi HAL (Mesh)
    participant MeshVAP as Mesh VAP Interface

    Controller->>UnifiedMesh: Multi-AP Policy Config
    UnifiedMesh->>OneWifi: IEEE 1905 Configuration TLV
    OneWifi->>OneWifi: Validate Mesh Parameters
    OneWifi->>MeshHAL: Configure Mesh Backhaul
    MeshHAL-->>OneWifi: Backhaul Interface Ready
    OneWifi->>MeshVAP: Activate Mesh VAP
    MeshVAP-->>OneWifi: VAP Operational
    OneWifi->>UnifiedMesh: Configuration ACK + Status
    UnifiedMesh->>Controller: Policy Applied Successfully
    
    Note over Controller,MeshVAP: Continuous mesh monitoring and optimization
    
    OneWifi->>UnifiedMesh: Periodic Metrics (RSSI, Throughput, Topology)
    UnifiedMesh->>Controller: Network Optimization Reports
    Controller->>UnifiedMesh: Dynamic Policy Updates
    UnifiedMesh->>OneWifi: Runtime Configuration Changes
```

## Implementation Details

### Major HAL APIs Integration

OneWifi integrates comprehensively with WiFi HAL v3.0+ to provide complete 802.11 protocol implementation and hardware abstraction. The HAL integration supports advanced features including 802.11ax/be, MU-MIMO, OFDMA, and vendor-specific optimizations.

**Core WiFi HAL APIs:**

| HAL API | Purpose | Parameters | Return Values | Implementation File |
|---------|---------|------------|---------------|-------------------|
| `wifi_createVAP()` | Create virtual access point with specified configuration | `radio_index`, `vap_config_map`, `vap_info_map` | `WIFI_HAL_SUCCESS`/`WIFI_HAL_ERROR` | `wifi_ctrl_wifiapi_handlers.c` |
| `wifi_setRadioOperatingParameters()` | Configure radio operational parameters including channel, power, standards | `radio_index`, `operationParam`, `channelParam` | `WIFI_HAL_SUCCESS`/`WIFI_HAL_ERROR` | `wifi_mgr.c` |
| `wifi_hal_connect()` | Initiate station connection to external network with credentials | `ap_index`, `ssid`, `passphrase`, `key_mgmt`, `eap_config` | `WIFI_HAL_SUCCESS`/Connection Status | `wifi_ctrl_wifiapi_handlers.c` |
| `wifi_getRadioVapInfoMap()` | Retrieve current VAP configuration and operational status | `radio_index`, `vap_info_map` | Populated VAP structure/Error | `wifi_mgr.c` |
| `wifi_startNeighborScan()` | Initiate neighbor network scanning for mesh and roaming optimization | `vap_index`, `scan_mode`, `dwell_time`, `channel_list` | `WIFI_HAL_SUCCESS`/Scan ID | `wifi_apps/analytics/wifi_analytics.c` |
| `wifi_setApSecurity()` | Configure access point security parameters including WPA3 and enterprise settings | `ap_index`, `security_config` | `WIFI_HAL_SUCCESS`/`WIFI_HAL_ERROR` | `wifi_mgr.c` |
| `wifi_getApAssociatedDeviceDiagnosticResult3()` | Retrieve detailed client statistics and diagnostic information | `ap_index`, `associated_device_array`, `output_array_size` | Client count/Device statistics array | `wifi_stats.c` |

### hostapd Integration and Control

OneWifi manages hostapd through multiple control mechanisms ensuring robust access point operations with dynamic configuration updates and event handling:

**hostapd Control Architecture:**

- **Configuration Management**: Dynamic generation of hostapd.conf files with template-based parameter injection and atomic configuration updates 
- **Runtime Control**: hostapd_cli interface for real-time parameter changes, client management, and security policy updates without full daemon restart 
- **Event Monitoring**: Hostapd event callback registration for client association/disassociation, authentication events, and 802.11 management frame processing 
- **Security Integration**: WPA3 SAE configuration, Enterprise authentication with RADIUS integration, and advanced security features like Management Frame Protection (MFP) 

**Key hostapd Integration Points:**

| Operation | Control Method | Configuration Files | Event Callbacks |
|-----------|---------------|-------------------|-----------------|
| AP Initialization | `hostapd_ctrl_iface_init()` | `/tmp/hostapd-wlan0.conf` | `hostapd_event_new_sta()` |
| Security Updates | `hostapd_ctrl_command("SET")` | Dynamic parameter injection | `hostapd_event_eapol_rx()` |
| Client Management | `hostapd_ctrl_command("DISASSOCIATE")` | Runtime MAC filter updates | `hostapd_event_auth()` |
| 802.11k/v Features | Neighbor report configuration | BSS transition configuration | `hostapd_event_rrm_beacon_rep_received()` |

### EasyMesh Architecture and IEEE 1905 Integration

OneWifi provides comprehensive EasyMesh Multi-AP protocol support through integrated IEEE 1905 implementation and unified-mesh system coordination:

**EasyMesh Component Architecture:**

```mermaid
flowchart TD
    subgraph "OneWifi EasyMesh Integration"
        subgraph "EasyMesh Application Layer"
            EMApp[EasyMesh App<br/>Multi-AP Logic]
            Translator[EasyMesh Translator<br/>Protocol Conversion]
            PolicyEngine[Policy Engine<br/>Network Optimization]
        end
        
        subgraph "IEEE 1905 Protocol Stack" 
            ProtocolHandler[1905 Message Handler<br/>TLV Processing]
            TopologyDB[Topology Database<br/>Network Map]
            MessageRouter[Message Router<br/>Multi-hop Forwarding]
        end
        
        subgraph "Mesh Services"
            BackhaulSvc[Backhaul Service<br/>Inter-AP Links]
            FronthaulSvc[Fronthaul Service<br/>Client Access]
            SteeringSvc[Steering Service<br/>Client Optimization]
        end
    end
    
    subgraph "External Mesh Ecosystem"
        Controller[EasyMesh Controller<br/>Network Management]
        UnifiedMesh[Unified-Mesh System<br/>IEEE 1905 Transport]
        RemoteAgents[Remote EasyMesh Agents<br/>Mesh Nodes]
    end
    
    EMApp <--> Translator
    Translator <--> ProtocolHandler
    PolicyEngine <--> TopologyDB
    ProtocolHandler <--> MessageRouter
    
    BackhaulSvc <--> EMApp
    FronthaulSvc <--> EMApp
    SteeringSvc <--> PolicyEngine
    
    MessageRouter <-->|Unix Domain Sockets<br/>IEEE 1905 TLVs| UnifiedMesh
    UnifiedMesh <-->|Multi-AP Protocol<br/>TCP/IP| Controller
    UnifiedMesh <-->|Mesh Coordination<br/>IEEE 1905.1| RemoteAgents
    
    classDef easymesh fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px;
    classDef protocol fill:#e0f2f1,stroke:#00796b,stroke-width:2px;
    classDef service fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px;
    
    class EMApp,Translator,PolicyEngine easymesh;
    class ProtocolHandler,TopologyDB,MessageRouter protocol;
    class BackhaulSvc,FronthaulSvc,SteeringSvc service;
    class Controller,UnifiedMesh,RemoteAgents external;
```

**EasyMesh API Endpoints and Communication:**

| Communication Type | Endpoint/API | Message Format | Purpose |
|-------------------|--------------|----------------|---------|
| **Controller ↔ OneWifi** | `/tmp/mesh_controller.sock` | IEEE 1905 TLV Messages | Multi-AP policy distribution, topology discovery, performance optimization |
| **Agent ↔ Unified-Mesh** | `webconfig_easymesh_decode()` / `webconfig_easymesh_encode()` | JSON Configuration Objects | Mesh configuration translation, status reporting |
| **IEEE 1905 Transport** | TCP Socket (Port 1905) | IEEE 1905.1 Protocol Frames | Inter-agent communication, topology maintenance, multi-hop message forwarding |
| **Policy Engine API** | `em_policy_req_type_t` structures | Binary Policy Objects | Network optimization policies, client steering decisions, load balancing |

**EasyMesh Configuration Flow:**

```mermaid
sequenceDiagram
    participant Controller as EasyMesh Controller
    participant UnifiedMesh as Unified-Mesh System
    participant OneWifi as OneWifi Agent
    participant MeshApp as EasyMesh App
    participant WiFiHAL as WiFi HAL

    Controller->>UnifiedMesh: Multi-AP Configuration Policy
    UnifiedMesh->>OneWifi: webconfig_easymesh_decode()
    OneWifi->>MeshApp: EasyMesh Configuration Event
    MeshApp->>MeshApp: Validate Mesh Parameters
    MeshApp->>WiFiHAL: Configure Mesh VAPs
    WiFiHAL-->>MeshApp: Mesh Interfaces Created
    MeshApp->>OneWifi: Configuration Applied Successfully
    OneWifi->>UnifiedMesh: webconfig_easymesh_encode() + Status
    UnifiedMesh->>Controller: IEEE 1905 ACK Response
```

### WiFi Database Implementation

OneWifi implements a comprehensive database system providing ACID-compliant storage for configuration data, operational statistics, and network state information:

**Database Architecture:**
- **Storage Backend**: SQLite-based implementation with WAL (Write-Ahead Logging) for concurrent access and crash recovery
- **Schema Management**: Versioned schema with automatic migration support for backward compatibility across firmware upgrades  
- **Transaction Support**: Full ACID transactions with rollback capability for configuration updates and batch operations
- **Performance Optimization**: Prepared statements, connection pooling, and optimized indexing for high-frequency operations

**Key Database Tables and Data Models:**

| Table Name | Purpose | Key Fields | Access Pattern |
|------------|---------|------------|----------------|
| `radio_config` | Radio operational parameters and capabilities | `radio_index`, `band`, `channel`, `power`, `standards` | Read-heavy with periodic updates |
| `vap_config` | VAP configuration and security settings | `vap_index`, `ssid`, `security_mode`, `enabled`, `bridge_name` | Mixed read/write with atomic updates |
| `client_info` | Associated client information and statistics | `mac_address`, `vap_index`, `rssi`, `connect_time`, `data_rates` | High-frequency inserts/updates |
| `mesh_topology` | EasyMesh network topology and link metrics | `node_mac`, `parent_mac`, `link_quality`, `hop_count`, `last_seen` | Event-driven updates |
| `analytics_data` | Performance metrics and behavioral analytics | `timestamp`, `metric_type`, `vap_index`, `value`, `client_mac` | Time-series data with retention policies |
| `security_events` | Security-related events and intrusion detection | `timestamp`, `event_type`, `severity`, `source_mac`, `details` | Append-only with log rotation |

### Key Implementation Logic

- **Service Coordination Engine**: Central orchestration system in `wifi_mgr.c` that manages service lifecycle, coordinates resource allocation, and ensures proper sequencing of operations across multiple VAP services
  
- **Event Processing Pipeline**: Multi-threaded event handling system in `wifi_events.c` that processes hardware interrupts, protocol events, and configuration changes with priority-based queuing and deadlock prevention
  
- **Configuration Management**: Atomic configuration update system in `wifi_webconfig.c` supporting bulk updates, parameter validation, dependency resolution, and automatic rollback on failure with persistent transaction logging

- **Hardware Abstraction Layer**: Comprehensive WiFi HAL integration in `wifi_ctrl_wifiapi_handlers.c` providing unified interface to vendor-specific hardware capabilities while abstracting 802.11 protocol complexities

- **Database Transaction Manager**: ACID-compliant transaction processing in `wifi_db.c` with connection pooling, prepared statement optimization, and automatic schema migration for reliable data persistence

- **Security Framework**: Integrated security management combining WPA3/Enterprise authentication, certificate validation, intrusion detection, and policy enforcement with audit logging

## Key Configuration Files

OneWifi utilizes multiple configuration files and data sources to maintain operational parameters, default values, and runtime customization capabilities.

| Configuration File | Purpose | Key Parameters | Default Values | Override Mechanisms |
|--------------------|---------|---------------|----------------|--------------------|
| `/nvram/wifi_defaults.json` | System-wide WiFi defaults and hardware-specific parameters | `radio_capabilities`, `default_channels`, `power_limits`, `country_code` | Hardware-dependent | Environment variables, build-time flags |
| `/opt/onewifi/config/webconfig_schemas.json` | WebConfig schema validation and parameter constraints | `parameter_types`, `validation_rules`, `dependency_maps` | Per TR-181 specification | Runtime schema updates |
| `/nvram/EasymeshCfg.json` | EasyMesh network configuration and credentials | `AL_MAC_ADDR`, `Colocated_mode`, `Backhaul_SSID`, `Backhaul_KeyPassphrase` | Generated during mesh setup | Controller provisioning, DPP onboarding |
| `/tmp/hostapd-wlanX.conf` | Runtime hostapd configuration per VAP | `interface`, `ssid`, `wpa_passphrase`, `channel`, `ieee80211n` | Template-generated | OneWifi dynamic updates |
| `/opt/onewifi/tr181_defaults.xml` | TR-181 parameter default values and metadata | `parameter_paths`, `default_values`, `access_permissions`, `notifications` | TR-181 standard + RDK extensions | PSM database overrides |
| `/var/lib/onewifi/wifi.db` | Persistent WiFi database (SQLite) | Configuration state, client data, statistics, mesh topology | Schema-defined defaults | Database transactions, backup/restore |
| `/etc/onewifi/analytics.conf` | Analytics engine configuration and thresholds | `collection_intervals`, `alert_thresholds`, `data_retention`, `privacy_settings` | Conservative defaults | Runtime parameter updates |
