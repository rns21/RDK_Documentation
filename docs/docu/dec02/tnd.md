# Test And Diagnostic (TandD) Component Documentation

The Test and Diagnostic component is a comprehensive RDK-B middleware module that provides essential network connectivity testing, self-healing capabilities, system health monitoring, and diagnostic services for broadband gateway devices. This component serves as the central hub for proactive device health management, ensuring optimal network performance and automatic issue resolution.

The component operates as three distinct service layers: First, it provides network diagnostic capabilities including ping, traceroute, DNS lookup, upload/download testing, and WAN connectivity monitoring to validate network paths and performance. Second, it implements intelligent self-healing mechanisms that automatically detect and remediate common connectivity issues, memory leaks, and service failures without user intervention. Third, it offers comprehensive system health monitoring including CPU/memory usage tracking, thermal management, latency measurements, and device prioritization services.

At the module level, the component integrates deeply with the RDK-B ecosystem through RBus messaging for real-time event publishing, TR-181 data model compliance for standardized parameter access, HAL layer integration for hardware-specific operations, and persistent configuration management. It coordinates with other RDK-B components like CcspCr (Component Registry), CcspPandM (Provisioning and Management), and CcspWifiAgent for holistic device management while maintaining loose coupling through well-defined interfaces.

**Horizontal Layout Architecture Diagram**:

```mermaid
flowchart TB
    subgraph External ["External Systems"]
        WEB[Web UI/ACS Server]
        FW[Firmware Upgrade Server] 
        DNS[DNS Servers]
        SPEED[Speed Test Servers]
    end
    
    subgraph TandDSystem ["Test & Diagnostic System"]
        TANDD[Test & Diagnostic<br/>Component]
    end
    
    subgraph Middleware ["RDK-B Middleware Components"]
        CR[CcspCr]
        PANDM[CcspPandM]
        WIFI[CcspWifiAgent]
        PSM[CcspPsm]
    end
    
    subgraph HALLayer ["HAL/Platform Layer"]
        HAL[Platform HAL]
        THERMAL[Thermal HAL]
        NET[Network HAL]
        SYS[System Services]
    end
    
    subgraph Hardware ["Physical Layer"]
        HW[Hardware Platform]
        SENSORS[System Sensors]
    end
    
    %% External interactions
    WEB -->|TR-069/HTTP| TANDD
    TANDD -->|Speed Tests| SPEED
    TANDD -->|DNS Queries| DNS
    FW -->|Health Checks| TANDD
    
    %% RDK-B middleware interactions
    TANDD <-->|RBus Events| CR
    TANDD <-->|Config/Status| PANDM
    TANDD <-->|WiFi Diagnostics| WIFI
    TANDD <-->|Persistent Data| PSM
    
    %% HAL interactions
    TANDD -->|System Calls| HAL
    TANDD -->|Temperature Monitoring| THERMAL
    TANDD -->|Network Interface Stats| NET
    TANDD -->|System Health APIs| SYS
    
    %% Hardware layer
    HAL --> HW
    THERMAL --> SENSORS
    NET --> HW
    
    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef tanddsystem fill:#e3f2fd,stroke:#1976d2,stroke-width:2px;
    classDef middleware fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef hal fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef hardware fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    
    class WEB,FW,DNS,SPEED external;
    class TANDD tanddsystem;
    class CR,PANDM,WIFI,PSM middleware;
    class HAL,THERMAL,NET,SYS hal;
    class HW,SENSORS hardware;
```

**Key Features & Responsibilities**:

- **Network Connectivity Diagnostics**: Provides comprehensive network testing tools including ICMP ping, UDP echo, traceroute, DNS lookup, and bandwidth testing to validate end-to-end connectivity and diagnose network issues
- **Self-Healing & Recovery Mechanisms**: Implements intelligent automatic recovery systems that detect and remediate connectivity failures, memory leaks, process crashes, and configuration corruption without manual intervention
- **System Health Monitoring**: Continuously monitors critical system metrics including CPU utilization, memory usage, thermal conditions, and device performance to ensure optimal operation and prevent system degradation
- **WAN Connectivity Validation**: Performs periodic WAN connectivity checks with configurable test intervals, failure thresholds, and automatic failover mechanisms to maintain reliable internet access
- **Latency Measurement & Analysis**: Measures network latency across different paths and protocols to optimize routing decisions and detect performance degradation
- **Device Prioritization Services**: Manages bandwidth allocation and QoS policies based on device priorities and traffic classification for optimal network resource utilization
- **Thermal Control & Management**: Monitors device temperature and implements thermal protection mechanisms including fan control and performance throttling to prevent hardware damage
- **Image Health Verification**: Validates firmware integrity and performs health checks on system images to detect corruption and ensure system stability
- **Resource Monitoring & Alerting**: Tracks system resources, generates health reports, and publishes critical events to enable proactive maintenance and troubleshooting

## Design

The Test and Diagnostic component follows a modular, event-driven architecture designed for high reliability and scalability in broadband gateway environments. The design emphasizes separation of concerns with distinct modules handling diagnostics, self-healing, monitoring, and control functions while maintaining unified coordination through a central service manager. The architecture ensures minimal performance impact on the primary networking functions while providing comprehensive health monitoring and automatic remediation capabilities.

The component's design integrates seamlessly with the RDK-B middleware ecosystem through standardized interfaces and messaging protocols. It leverages the RBus messaging framework for real-time event propagation, enabling other components to subscribe to health and diagnostic events. The TR-181 data model compliance ensures consistent parameter access patterns and remote management capabilities through standard CWMP protocols. The modular design allows individual diagnostic and monitoring functions to operate independently, providing fault isolation and enabling selective feature activation based on device capabilities and configuration requirements.

The IPC mechanisms are strategically designed to minimize system overhead while ensuring reliable communication. The component uses RBus for high-frequency event publishing and parameter synchronization, POSIX message queues for inter-module communication within the component, and direct HAL API calls for hardware interactions. Data persistence is achieved through integration with CcspPsm for configuration parameters and local file-based storage for diagnostic logs and temporary data, ensuring data integrity across system reboots and component restarts.

```mermaid
flowchart TD
    subgraph TestAndDiagnostic ["Test & Diagnostic Component"]
        SSP([TandDSsp<br/>Service Manager])
        
        subgraph DiagnosticModules ["Diagnostic Modules"]
            DIAG([Diagnostic Engine])
            PING([IP Ping])
            TRACE([Traceroute]) 
            DNS([DNS Lookup])
            SPEED([Speed Test])
        end
        
        subgraph HealthModules ["Health & Monitoring"]
            HEALTH([Health Monitor])
            THERMAL([Thermal Control])
            LATENCY([Latency Measurement])
            IMAGE([Image Health Checker])
        end
        
        subgraph RecoveryModules ["Recovery & Self-Heal"]
            SELFHEAL([Self-Heal Engine])
            WAN([WAN Connectivity Checker])
            RESOURCE([Resource Monitor])
            PRIORITY([Device Prioritization])
        end
        
        subgraph DataLayer ["Data Model Layer"]
            DML([TR-181 DML/TAD])
            RBUS([RBus Interface])
        end
    end

    %% Primary control flow
    SSP --> DIAG
    SSP --> HEALTH
    SSP --> SELFHEAL
    SSP --> DML

    %% Diagnostic module relationships
    DIAG --> PING
    DIAG --> TRACE
    DIAG --> DNS
    DIAG --> SPEED

    %% Health monitoring relationships
    HEALTH --> THERMAL
    HEALTH --> LATENCY
    HEALTH --> IMAGE
    HEALTH --> RESOURCE

    %% Self-heal coordination
    SELFHEAL --> WAN
    SELFHEAL --> PRIORITY
    RESOURCE --> SELFHEAL

    %% Data model integration
    DML --> RBUS
    RBUS --> SSP

    %% Cross-module communication
    WAN -.->|Connectivity Events| DIAG
    THERMAL -.->|Temperature Alerts| SELFHEAL
    LATENCY -.->|Performance Data| PRIORITY

    classDef manager fill:#e3f2fd,stroke:#1976d2,stroke-width:3px;
    classDef diagnostic fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef health fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef recovery fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef data fill:#fce4ec,stroke:#c2185b,stroke-width:2px;

    class SSP manager;
    class DIAG,PING,TRACE,DNS,SPEED diagnostic;
    class HEALTH,THERMAL,LATENCY,IMAGE health;
    class SELFHEAL,WAN,RESOURCE,PRIORITY recovery;
    class DML,RBUS data;
```

### Prerequisites and Dependencies

**Build-Time Flags and Configuration:**

| Configure Option | DISTRO Feature | Build Flag | Purpose | Default |
|------------------|----------------|------------|---------|----------|
| `--enable-mta` | N/A | `ENABLE_MTA` | Enable Media Terminal Adapter (MTA) support for cable modem diagnostics | Enabled |
| `--enable-core_net_lib_feature_support` | `core-net-lib` | `CORE_NET_LIB_FEATURE_SUPPORT` | Enable advanced networking library support for enhanced diagnostics | Disabled |
| `--enable-rdk_scheduler` | `enable_rdkscheduler` | `RDK_SCHEDULER_ENABLED` | Enable RDK Scheduler integration for task management | Disabled |
| `--enable-device_prioritization` | `enable_device_prioritization` | `DEVICE_PRIORITIZATION_ENABLED` | Enable device prioritization and QoS management features | Disabled |
| `--enable-resourceoptimization` | N/A | `RESOURCE_OPTIMIZATION_ENABLED` | Enable resource optimization algorithms and memory management | Disabled |
| `--enable-warehousediagnostics` | N/A | `WAREHOUSE_DIAGNOSTICS_ENABLED` | Enable warehouse-specific diagnostic tests and validation procedures | Disabled |
| `--enable-unitTestDockerSupport` | N/A | `UNIT_TEST_DOCKER_SUPPORT` | Enable Docker-based unit testing framework integration | Disabled |

**RDK-B Platform and Integration Requirements (MUST):**

- **RDK-B Components**: CcspCommonLibrary (message bus), CcspCr (component registry), CcspPsm (persistent storage), CcspPandM (provisioning)
- **HAL Dependencies**: Platform HAL v2.0+, Network HAL, Thermal HAL (if thermal monitoring enabled)
- **Systemd Services**: ccsp-msg-bus.service, ccsp-cr.service, ccsp-psm.service must be active before test-and-diagnostic.service
- **Message Bus**: RBus registration for "Device.SelfHeal.", "Device.IP.Diagnostics.", "Device.DeviceInfo.X_RDKCENTRAL-COM_xOpsDeviceMgmt." namespaces
- **Configuration Files**: `/etc/ccsp_msg.cfg`, `/nvram/syscfg.db`, TR-181 data model XML configuration in `config/TestAndDiagnostic_arm.XML`
- **Startup Order**: Initialize after message bus and component registry, before user-facing services like WiFi and WAN components

**Threading Model**

The Test and Diagnostic component implements a multi-threaded architecture using POSIX pthreads for concurrent diagnostic operations, latency measurements, and system monitoring. The component creates multiple background threads to handle different aspects of network diagnostics and system health monitoring.

| Thread & Function | Purpose | Cycle/Timeout | Synchronization |
|-------------------|---------|----------------|------------------|
| **Main Thread**<br>`main()` / `ssp_main()` | Component initialization, RBus message processing, TR-181 parameter handling | Event-driven message loop, RBus callbacks, SSP lifecycle management | RBus async callbacks, pthread mutexes |
| **Time Update Thread**<br>`updateTimeThread()` | Continuous time synchronization for ethwan mode, build epoch validation | Periodic time updates with sleep intervals | pthread_detach(), time state validation |
| **Ping Test Thread**<br>`COSAIP_pingtest_ProcessThread()` | Network connectivity testing through ping operations | On-demand execution via TR-181 ping test requests | pthread_create(), result synchronization |
| **Monitor Service Thread**<br>`LatencyMeasurement_MonitorService()` | Primary latency measurement service monitoring and coordination | Continuous monitoring loop with configurable intervals | pthread_mutex_t, pthread_cond_t synchronization |
| **RBus Initialization Thread**<br>`tadRbusInit()` | RBus interface initialization and event handling setup | Component startup RBus registration and callback setup | RBus async callbacks and event subscription |
| **Latency Report Thread**<br>`LatencyReportThread()` | Latency measurement data collection and reporting | Continuous data collection with configurable report intervals | pthread_mutex_t for report data protection |
| **Latency Per-Session Thread**<br>`LatencyReportThreadPerSession()` | Session-based latency measurement for individual connections | Per-session monitoring with dynamic thread creation | pthread creation per active session |
| **Device Prioritization Thread**<br>`DevicePrioInit()` | Device priority and QoS management initialization | Conditional initialization based on DEVICE_PRIORITIZATION_ENABLED flag | pthread coordination with traffic monitoring |
| **WAN Connectivity Monitor Threads**<br>`wancnctvty_chk_start_threads()` | WAN connectivity monitoring coordination | Manages PASSIVE_MONITOR_THREAD, ACTIVE_MONITOR_THREAD, and PASSIVE_ACTIVE_MONITOR_THREADS | pthread coordination between passive and active monitoring |
| **Warehouse Diagnostics Thread**<br>`warehousediag_thread()` | Warehouse diagnostic data collection and processing | On-demand execution for diagnostic data gathering | pthread_create() for diagnostic operations |
| **Monitor Thread (RDK Test)**<br>`monitor_thread()` | RDK test monitoring and result collection | Continuous monitoring during active RDK test operations | pthread synchronization with test execution |
| **Diagnostic Task Thread**<br>`diag_task()` | Generic diagnostic task execution with timeout management | Per-diagnostic operation with configurable timeouts | pthread_mutex_t, pthread_timedjoin_np() for timeout handling |

### Component State Flow

**Initialization to Active State**

The Test and Diagnostic component follows a structured initialization sequence ensuring all dependencies are available and properly configured before entering active monitoring and diagnostic operations. The component validates its environment, establishes communication channels, and performs initial health checks before becoming fully operational.

```mermaid
sequenceDiagram
    participant System as System Startup
    participant TandD as Test & Diagnostic
    participant RBus as Message Bus
    participant Config as Configuration
    participant HAL as Platform HAL
    participant Modules as Internal Modules

    System->>TandD: Start Service (systemd)
    Note over TandD: State: Initializing<br/>Parse command line args, setup logging

    TandD->>Config: Load Configuration Files
    Config-->>TandD: Configuration Loaded (/etc/test_and_diagnostic.conf)
    Note over TandD: State: LoadingConfig → RegisteringBus

    TandD->>RBus: Initialize RBus Connection (tadRbusInit)
    RBus-->>TandD: Connection Established
    TandD->>RBus: Register TR-181 Data Models
    RBus-->>TandD: Registration Complete
    Note over TandD: State: RegisteringBus → InitializingModules

    TandD->>Modules: Initialize Latency Measurement (LatencyMeasurementInit)
    Modules-->>TandD: Latency Measurement Ready
    TandD->>Modules: Initialize Device Prioritization (DevicePrioInit, conditional)
    Modules-->>TandD: Device Prioritization Ready
    TandD->>Modules: Create Time Update Thread (updateTimeThread_create, conditional)
    Modules-->>TandD: Time Update Thread Created
    Note over TandD: State: InitializingModules → Active

    TandD->>System: Initialization Complete
    Note over TandD: State: Active<br/>Start periodic monitoring & diagnostics

    loop Runtime Operations
        TandD->>TandD: Process RBus Events
        TandD->>TandD: Execute Scheduled Diagnostics
        TandD->>TandD: Monitor System Health
        TandD->>TandD: Perform Self-Healing Actions
    end

    System->>TandD: Stop Request (SIGTERM)
    Note over TandD: State: Active → Shutdown
    TandD->>Modules: Shutdown All Modules
    TandD->>RBus: Unregister & Disconnect
    TandD->>System: Shutdown Complete
```

**Runtime State Changes and Context Switching**

The component maintains several operational contexts that can dynamically change based on system conditions, configuration updates, and external triggers.

**State Change Triggers:**

- **Connectivity Loss Detection**: Transitions to enhanced monitoring mode when WAN connectivity failures are detected, increasing diagnostic frequency and activating aggressive self-healing procedures
- **Resource Threshold Breach**: Switches to resource conservation mode when CPU or memory usage exceeds configured thresholds, reducing diagnostic frequency and disabling non-critical features
- **Configuration Updates**: Dynamically reconfigures operational parameters when TR-181 configuration changes are received via RBus, without requiring service restart
- **Emergency Recovery Mode**: Activates when critical system failures are detected, prioritizing essential connectivity restoration over comprehensive diagnostics

**Context Switching Scenarios:**

- **Normal to Diagnostic Mode**: When scheduled or triggered diagnostic tests are initiated, the component allocates additional resources and temporarily increases logging verbosity
- **Failover Context**: During WAN connectivity failures, switches from passive monitoring to active recovery procedures including interface resets and alternative path validation
- **Maintenance Mode**: Enters low-impact operation during firmware updates or system maintenance, suspending non-critical diagnostics while maintaining essential monitoring functions

### Call Flow

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant Init as systemd
    participant TandD as Test & Diagnostic
    participant RBus as Message Bus
    participant PSM as CcspPsm
    participant HAL as Platform HAL

    Init->>TandD: Start Service
    TandD->>TandD: Parse Args & Setup Logging
    TandD->>PSM: Load Persistent Configuration
    PSM-->>TandD: Configuration Data
    TandD->>RBus: Initialize RBus Handle
    RBus-->>TandD: Handle Created
    TandD->>RBus: Register Data Model Elements
    RBus-->>TandD: Registration Successful
    TandD->>HAL: Initialize HAL Interfaces
    HAL-->>TandD: HAL Ready
    TandD->>TandD: Start Worker Threads
    TandD->>Init: Service Ready (Active State)
```

**Network Diagnostic Request Processing Call Flow:**

```mermaid
sequenceDiagram
    participant Client as External Client/WebUI
    participant TandD as Test & Diagnostic
    participant DiagEngine as Diagnostic Engine
    participant HAL as Network HAL
    participant Network as External Network

    Client->>TandD: RBus Request (Device.IP.Diagnostics.IPPing)
    Note over TandD: Validate parameters & permissions
    TandD->>DiagEngine: Queue Diagnostic Test
    Note over DiagEngine: Create diagnostic context
    DiagEngine->>HAL: Get Network Interface Status
    HAL-->>DiagEngine: Interface Information
    DiagEngine->>Network: Execute ICMP Ping
    Network-->>DiagEngine: Ping Response/Timeout
    DiagEngine->>DiagEngine: Process Results & Generate Report
    DiagEngine-->>TandD: Diagnostic Results
    TandD->>TandD: Update TR-181 Parameters
    TandD-->>Client: RBus Response (Success/Results)
    Note over TandD: Publish diagnostic completion event
```

**Self-Healing Event Processing Call Flow:**

```mermaid
sequenceDiagram
    participant Monitor as Health Monitor
    participant TandD as Test & Diagnostic
    participant SelfHeal as Self-Heal Engine
    participant HAL as Platform HAL
    participant External as Other RDK-B Components

    Monitor->>TandD: Health Threshold Exceeded
    Note over TandD: Evaluate severity & trigger conditions
    TandD->>SelfHeal: Initiate Recovery Procedure
    SelfHeal->>HAL: Collect System Diagnostics
    HAL-->>SelfHeal: System State Information
    SelfHeal->>SelfHeal: Determine Recovery Actions
    SelfHeal->>HAL: Execute Recovery Commands
    HAL-->>SelfHeal: Command Results
    SelfHeal->>TandD: Recovery Status Update
    TandD->>External: Publish Recovery Event (RBus)
    TandD->>TandD: Log Recovery Action & Update Metrics
```

## Internal Modules

The Test and Diagnostic component is structured into specialized modules that handle distinct aspects of system health, network diagnostics, and automated recovery. Each module operates semi-independently while coordinating through the central service manager for unified operation and event correlation.

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| **TandDSsp** | Service Support Platform that manages component lifecycle, RBus registration, TR-181 data model implementation, and coordination between all internal modules | `ssp_main.c`, `ssp_messagebus_interface.c`, `ssp_action.c` |
| **Diagnostic Engine** | Core network diagnostic functionality including ping, traceroute, DNS lookup, speed testing, and upload/download validation with result processing and reporting | `bbhm_diag_lib.c`, `BbhmDiagIpPing/`, `BbhmDiagIpTraceroute/`, `BbhmDiagNSLookup/` |
| **DML/TAD Layer** | TR-181 Data Model Layer providing standardized parameter access for diagnostic results, self-heal configuration, and system health metrics with CWMP compliance | `cosa_diagnostic_apis.c`, `cosa_dns_dml.c`, `cosa_ip_dml.c` |
| **Self-Heal Engine** | Intelligent system recovery module that monitors connectivity, detects failures, and executes automated remediation procedures including interface resets and service recovery | `selfheal_bootup.sh`, `selfheal_aggressive.sh`, `self_heal_connectivity_test.sh` |
| **Health Monitor** | Comprehensive system health monitoring including CPU/memory usage, thermal conditions, resource availability, and performance metrics with threshold-based alerting | `resource_monitor.sh`, `task_health_monitor.sh`, `log_mem_cpu_info.sh` |
| **WAN Connectivity Checker** | Specialized module for WAN connectivity validation, failure detection, and automatic recovery coordination with configurable test parameters and thresholds | `cosa_wanconnectivity_apis.c`, `cosa_wanconnectivity_rbus_apis.c` |
| **Thermal Control** | Temperature monitoring and thermal management with fan control, performance throttling, and over-temperature protection for hardware preservation | `ThermalCtrl/` directory modules |
| **Latency Measurement** | Network latency analysis and measurement services for performance optimization and quality assessment with statistical analysis and reporting | `LatencyMeasurement/` directory modules |
| **Image Health Checker** | Firmware integrity validation and system image health verification to detect corruption and ensure system stability | `ImageHealthChecker/` directory modules |
| **Device Prioritization** | Bandwidth allocation and QoS management based on device priorities and traffic classification for optimal network resource utilization | `DevicePrioritization/` directory modules |


## Component Interactions

The Test and Diagnostic component maintains extensive interactions across the RDK-B ecosystem, serving as both a consumer of system health data and a provider of diagnostic services and automated recovery capabilities. These interactions span multiple layers from external management systems down to hardware abstraction layers.

### Interaction Matrix

| Target Component/Layer | Interaction Purpose | Key APIs/Endpoints |
|------------------------|-------------------|------------------|
| **RDK-B Middleware Components** |
| CcspCr (Component Registry) | Component registration, health reporting, event subscription | `registerComponent()`, `componentHealthEvent` |
| CcspPandM (Provisioning & Management) | Configuration synchronization, factory reset coordination | `Device.DeviceInfo.`, `Device.ManagementServer.` |
| CcspWifiAgent | WiFi interface diagnostics, connectivity validation | `Device.WiFi.`, `wifiHealthCheckTrigger` |
| CcspPsm | Persistent storage of diagnostic results, configuration | `PSM_Set_Record_Value()`, `PSM_Get_Record_Value()` |
| WAN Manager | WAN connectivity monitoring, interface status | `Device.X_RDK_WanManager.`, `wanConnectionStatus` |
| Ethernet Agent | Ethernet interface diagnostics, link status | `Device.Ethernet.Interface.`, `linkStatusChange` |
| **System & HAL Layers** |
| Platform HAL | System resource monitoring, hardware health | `platform_hal_GetMemoryStatus()`, `platform_hal_GetCPUTemperature()` |
| Network HAL | Network interface statistics, configuration | `nethal_getInterfaceStats()`, `nethal_configureInterface()` |
| Thermal HAL | Temperature monitoring, thermal management | `thermal_hal_getCurrentTemperature()`, `thermal_hal_setFanSpeed()` |
| System Services | Process monitoring, service control, log management | `systemctl status`, `/proc/meminfo`, `/sys/class/thermal/` |

**Events Published by Test & Diagnostic:**

| Event Name | Event Topic/Path | Trigger Condition | Subscriber Components |
|------------|-----------------|-------------------|---------------------|
| DeviceHealthEvent | `Device.DeviceInfo.X_RDKCENTRAL-COM_xOpsDeviceMgmt.Logging.xOpsDMUploadLogsNow` | Health threshold violations, critical failures | CcspPandM, Telemetry, WebUI |
| ConnectivityStatusEvent | `Device.SelfHeal.ConnectivityTest.X_RDKCENTRAL-COM_pingStatus` | WAN connectivity changes, ping test results | WAN Manager, CcspPandM |
| DiagnosticCompleteEvent | `Device.IP.Diagnostics.X_RDKCENTRAL-COM_DiagnosticsState` | Completion of diagnostic tests (ping, traceroute, etc.) | WebUI, ACS Server, NMS |
| SelfHealActionEvent | `Device.SelfHeal.ResourceMonitor.X_RDKCENTRAL-COM_UsageComputeWindow` | Self-heal actions triggered and completed | CcspPandM, Logging Services |
| ThermalAlertEvent | `Device.DeviceInfo.X_RDKCENTRAL-COM_ThermalProtection.Enable` | Temperature threshold breaches | All middleware components |

### IPC Flow Patterns

**Primary IPC Flow - Diagnostic Test Execution:**

```mermaid
sequenceDiagram
    participant WebUI as Web UI/ACS
    participant TandD as Test & Diagnostic
    participant DiagModule as Diagnostic Module
    participant NetHAL as Network HAL
    participant PSM as CcspPsm

    WebUI->>TandD: RBus Method Call (Device.IP.Diagnostics.IPPing.DiagnosticsState=Requested)
    Note over TandD: Validate request parameters & permissions
    TandD->>DiagModule: Queue Ping Test (target, count, timeout)
    DiagModule->>NetHAL: Get Interface Status & Configuration
    NetHAL-->>DiagModule: Interface Details & IP Configuration
    DiagModule->>DiagModule: Execute ICMP Ping Test
    DiagModule-->>TandD: Test Results (packets sent/received, RTT, loss%)
    TandD->>PSM: Store Results (Device.IP.Diagnostics.IPPing.SuccessCount, etc.)
    PSM-->>TandD: Storage Confirmation
    TandD-->>WebUI: RBus Response (DiagnosticsState=Complete)
    Note over TandD: Publish diagnostic completion event
```

**Self-Healing Event Flow:**

```mermaid
sequenceDiagram
    participant Monitor as Resource Monitor
    participant TandD as Test & Diagnostic
    participant SelfHeal as Self-Heal Engine
    participant WanMgr as WAN Manager
    participant HAL as Platform HAL

    Monitor->>TandD: Health Alert (High CPU/Memory usage detected)
    Note over TandD: Evaluate alert severity & determine response
    TandD->>SelfHeal: Trigger Recovery Procedure (resource_optimization)
    SelfHeal->>HAL: Collect System Diagnostics (CPU/Memory details)
    HAL-->>SelfHeal: System Resource Statistics
    SelfHeal->>SelfHeal: Determine Recovery Actions (restart services, clear cache)
    SelfHeal->>HAL: Execute Recovery Commands
    HAL-->>SelfHeal: Command Execution Results
    SelfHeal->>WanMgr: Request Connectivity Validation
    WanMgr-->>SelfHeal: Connectivity Status
    SelfHeal-->>TandD: Recovery Status (Success/Failure with details)
    Note over TandD: Log recovery action & update health metrics
    TandD->>TandD: Publish Self-Heal Event (RBus)
```

**Health Monitoring Event Flow:**

```mermaid
sequenceDiagram
    participant Timer as Periodic Timer
    participant TandD as Test & Diagnostic
    participant HealthMon as Health Monitor
    participant ThermalHAL as Thermal HAL
    participant Subscribers as Event Subscribers

    Timer->>TandD: Periodic Health Check Trigger (every 30 seconds)
    TandD->>HealthMon: Collect System Health Metrics
    HealthMon->>ThermalHAL: Get Current Temperature
    ThermalHAL-->>HealthMon: Temperature Reading (°C)
    HealthMon->>HealthMon: Check Against Thermal Thresholds
    
    alt Temperature > Critical Threshold
        HealthMon->>TandD: Critical Thermal Alert
        TandD->>Subscribers: Publish Thermal Alert Event (RBus)
        Note over TandD: Trigger thermal protection measures
    else Temperature Normal
        HealthMon-->>TandD: Normal Health Status
        TandD->>TandD: Update Health Metrics
    end
```

## Implementation Details

### Major HAL APIs Integration

The Test and Diagnostic component integrates with multiple HAL layers to access hardware-specific functionality and system resources. These integrations provide the foundation for accurate system monitoring and hardware-aware diagnostic capabilities.

**Core HAL APIs:**

| HAL API | Purpose | Implementation File |
|---------|---------|-------------------|
| `platform_hal_GetMemoryStatus()` | Retrieves system memory statistics including total, free, and usage percentages | `source/dmltad/cosa_deviceinfo_util_priv.c` |
| `platform_hal_GetCPUTemperature()` | Gets current CPU temperature for thermal monitoring and protection | `source/ThermalCtrl/thermal_monitor.c` |
| `nethal_getInterfaceStats()` | Collects network interface statistics for connectivity analysis | `source/dmltad/cosa_ip_dml.c` |
| `nethal_configureInterface()` | Configures network interfaces during recovery procedures | `source/dmltad/cosa_wanconnectivity_apis.c` |
| `thermal_hal_getCurrentTemperature()` | Monitors system thermal conditions across multiple sensors | `source/ThermalCtrl/thermal_control.c` |
| `thermal_hal_setFanSpeed()` | Controls thermal management through fan speed adjustment | `source/ThermalCtrl/thermal_control.c` |
| `platform_hal_getSystemUptime()` | Gets system uptime for health calculations and boot diagnostics | `source/dmltad/cosa_diagnostic_apis.c` |

### Key Implementation Logic

- **State Machine Engine**: The core diagnostic and self-healing state machine is implemented across multiple coordinated modules with centralized state management
     - Main implementation in `source/TandDSsp/ssp_main.c` for component lifecycle and coordination
     - State transition handlers in `source/dmltad/cosa_diagnostic_apis.c` for diagnostic test state management
     - Self-healing state logic in shell scripts under `scripts/selfheal_*.sh` for recovery procedures

- **Event Processing**: Hardware events and system alerts are processed through a multi-layered event handling system
     - Hardware interrupt handling via HAL callback registration for thermal and network events
     - Event queue management using RBus subscription model for inter-component communication
     - Asynchronous event processing with dedicated worker threads for non-blocking operation

- **Error Handling Strategy**: Comprehensive error detection and recovery with multiple escalation levels
     - HAL error code mapping with retry logic for transient hardware interface failures
     - Recovery mechanisms for failed diagnostic tests including parameter validation and timeout handling
     - Timeout handling and retry logic with exponential backoff for network operations and self-healing procedures

- **Logging & Debugging**: Multi-level logging system with configurable verbosity and specialized debugging tools
     - Diagnostic test logging with detailed parameter tracking and result correlation
     - HAL API call tracing with performance metrics and error rate monitoring
     - Debug hooks for troubleshooting connectivity issues including packet capture integration and network path analysis

### Key Configuration Files

| Configuration File | Purpose | Override Mechanisms |
|--------------------|---------|--------------------|
| `/nvram/syscfg.db` | Persistent system configuration managed by CcspPsm | `syscfg set/get` commands, factory reset procedures |
| `config/TestAndDiagnostic_arm.XML` | TR-181 data model definitions and parameter mappings | Component rebuild required for structural changes |
| `/tmp/selfheal.txt` | Runtime self-healing configuration and temporary state | Script-based updates, manual editing for debugging |
| `/etc/ccsp_msg.cfg` | Message bus configuration for RBus communication | Service restart required after modifications |