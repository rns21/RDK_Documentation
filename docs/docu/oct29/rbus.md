# RBus Documentation

RBus is the foundational Inter-Process Communication (IPC) framework that enables all RDK-B middleware components to communicate efficiently and reliably. As the central message bus system, RBus provides a lightweight, fast messaging infrastructure that supports remote procedure calls (RPC), event publishing/subscribing, and hierarchical data model management across the entire RDK-B ecosystem, from high-level applications down to Hardware Abstraction Layer (HAL) interfaces. It implements a provider-consumer model where components can both publish services and consume services from other components, creating a flexible and scalable middleware architecture. 

At the architectural level, RBus eliminates the need for direct component-to-component communication by providing a centralized message routing daemon (rtrouted) that handles all inter-process messaging. This design ensures loose coupling between components, improves system reliability through fault isolation, and provides a consistent API for all IPC operations regardless of the underlying transport mechanism.

```mermaid
graph TD
    subgraph ExternalSystems ["External Management Systems"]
        ACS[ACS/TR-069 Server]
        WebUI[Web Management UI]
        CloudMgmt[Cloud Management Platform]
    end
    
    subgraph RDKBMiddleware ["RDK-B Middleware Layer"]
        TR069PA[CcspTr069Pa]
        PAM[CcspPandM]
        OneWifi[OneWifi]
        CMAgent[CcspCMAgent]
        PSM[CcspPsm]
        DMCli[CcspDmCli]
        WANManager[WAN Manager]
        RBus[RBus Framework]
    end
    
    subgraph SystemLayer ["System & HAL Layer"]
        HAL[Hardware Abstraction Layer]
        Platform[Platform Services]
        Kernel[Linux Kernel]
    end

    ACS -->|TR-069/CWMP| TR069PA
    WebUI -->|HTTP/REST| PAM
    CloudMgmt -->|MQTT/CoAP| PAM
    
    TR069PA <-->|RBus IPC| RBus
    PAM <-->|RBus IPC| RBus
    OneWifi <-->|RBus IPC| RBus
    CMAgent <-->|RBus IPC| RBus
    PSM <-->|RBus IPC| RBus
    DMCli <-->|RBus IPC| RBus
    WANManager <-->|RBus IPC| RBus
    
    RBus <-->|Direct API Calls| HAL
    RBus <-->|System Calls| Platform
    HAL <-->|Driver Interface| Kernel

    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef rbus fill:#e3f2fd,stroke:#1976d2,stroke-width:3px;
    classDef middleware fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef system fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    
    class ACS,WebUI,CloudMgmt external;
    class RBus rbus;
    class TR069PA,PAM,OneWifi,CMAgent,PSM,DMCli,WANManager middleware;
    class HAL,Platform,Kernel system;
```

**Key Features & Responsibilities**: 

- **Inter-Process Communication**: Provides reliable, fast message routing between all RDK-B middleware components using Unix domain sockets and shared memory for optimal performance
- **Event System**: Enables publish-subscribe messaging patterns for real-time notifications, value change events, and system status updates across all components
- **Remote Method Invocation**: Supports synchronous and asynchronous remote procedure calls with parameter marshalling, error handling, and timeout management
- **Message Routing**: Central rtrouted daemon provides intelligent message routing, load balancing, and fault tolerance for all IPC operations
- **Security & Authentication**: Implements access control mechanisms, message encryption capabilities, and component authentication for secure inter-process communication

## Design

RBus is architected as a multi-layered IPC framework that provides both high-level abstract APIs and low-level messaging primitives. The design follows a hub-and-spoke model where the rtrouted daemon serves as the central message broker, eliminating direct peer-to-peer connections between components and providing centralized routing intelligence. This architecture ensures scalability, fault isolation, and consistent performance characteristics across the entire RDK-B middleware stack.

The framework's design prioritizes performance through efficient message serialization using MessagePack, zero-copy memory operations where possible, and optimized Unix domain socket transport. The system supports both request-response patterns for synchronous operations and publish-subscribe patterns for asynchronous event handling, providing flexibility for different communication requirements across RDK-B components.

The northbound interface provides a comprehensive C API that abstracts the underlying transport complexity, offering simple function calls for property access, method invocation, and event subscription. The southbound interface integrates directly with the rtMessage transport layer and can optionally interface with HAL components for hardware-specific operations. The design includes sophisticated error handling, automatic retry mechanisms, and graceful degradation capabilities to ensure system reliability.

RBus integrates RBus-native messaging for high-performance internal communication while maintaining compatibility with legacy D-Bus interfaces where required. The data persistence layer leverages the PSM (Persistent Storage Manager) component for configuration storage and retrieval, ensuring data consistency across system reboots and component restarts.

```mermaid
graph TD
    subgraph ClientApplications ["Client Applications"]
        App1[TR-069 PA]
        App2[OneWifi]
        App3[P&M Component]
        App4[CM Agent]
    end
    
    subgraph RBusFramework ["RBus Framework"]
        subgraph RBusAPI ["RBus API Layer"]
            API[RBus Public API]
            APINote["Purpose:<br>High-level C API for<br>properties, events, methods"]
        end
        
        subgraph RBusCore ["RBus Core Engine"]
            Core[RBus Core]
            CoreNote["Purpose:<br>Message routing,<br>data model management,<br>serialization"]
        end
        
        subgraph RTMessage ["RT Message Layer"]
            RTMsg[RT Message Transport]
            RTMsgNote["Purpose:<br>Low-level transport,<br>connection management,<br>security"]
        end
        
        subgraph SessionManager ["Session Manager"]
            SessMgr[Session Manager]
            SessMgrNote["Purpose:<br>Client lifecycle,<br>authentication,<br>resource management"]
        end
    end
    
    subgraph MessageBroker ["Message Broker Infrastructure"]
        RTRouted[rtrouted Daemon]
        RTRoutedNote["Purpose:<br>Central message router,<br>service discovery,<br>load balancing"]
    end
    
    subgraph SystemIntegration ["System Integration Layer"]
        HAL[Hardware Abstraction Layer]
        PSM[Persistent Storage Manager]
        SystemServices[Platform Services]
    end

    App1 -->|rbus_open/<br>rbus_get/<br>rbus_set| API
    App2 -->|rbus_subscribe/<br>rbus_publish| API
    App3 -->|rbus_invoke<br>RemoteMethod| API
    App4 -->|rbus_registerObj/<br>rbus_unregister| API
    
    API -->|Message Serialization| Core
    Core -->|Socket Communication| RTMsg
    RTMsg -->|Unix Domain Sockets| RTRouted
    SessMgr -->|Session Control| RTMsg
    
    RTRouted -->|Service Discovery| RTMsg
    Core -->|Data Persistence| PSM
    Core -->|Hardware Operations| HAL
    RTMsg -->|System Resources| SystemServices

    classDef client fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef rbus fill:#e3f2fd,stroke:#1976d2,stroke-width:2px;
    classDef broker fill:#ffebee,stroke:#d32f2f,stroke-width:2px;
    classDef system fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    
    class App1,App2,App3,App4 client;
    class API,Core,RTMsg,SessMgr rbus;
    class RTRouted broker;
    class HAL,PSM,SystemServices system;
```

### Prerequisites and Dependencies

**Build-Time Flags and Configuration:**

| Configure Option | DISTRO Feature | Build Flag | Purpose | Default |
|------------------|----------------|------------|---------|---------|
| `ENABLE_RDKLOGGER=ON` | `rdklogger` | `ENABLE_RDKLOGGER` | Enable RDK centralized logging framework integration | Enabled |
| `MSG_ROUNDTRIP_TIME=ON` | N/A | `MSG_ROUNDTRIP_TIME=1` | Enable message round-trip time measurement and performance monitoring | Enabled |
| `BUILD_RBUS_SAMPLE_APPS=ON/OFF` | `RBUS_ENABLE_TESTAPPS` | `BUILD_RBUS_SAMPLE_APPS` | Build RBus sample applications and examples | Conditional |
| `BUILD_RBUS_TEST_APPS=ON/OFF` | `RBUS_ENABLE_TESTAPPS` | `BUILD_RBUS_TEST_APPS` | Build RBus test applications and validation tools | Conditional |
| `BUILD_RBUS_BENCHMARK_TEST=ON` | `gtestapp` | `BUILD_RBUS_BENCHMARK_TEST` | Enable benchmark testing applications | Conditional |
| `WITH_SPAKE2=ON` | N/A | `WITH_SPAKE2=1` | Enable SPAKE2 secure authentication protocol | Disabled |
| `ENABLE_CODE_COVERAGE=ON` | N/A | `ENABLE_CODE_COVERAGE` | Enable code coverage analysis with GCOV/LCOV | Disabled |
| `ENABLE_ADDRESS_SANITIZER=ON` | N/A | `ENABLE_ADDRESS_SANITIZER` | Enable AddressSanitizer memory error detection | Disabled |

**Compile-Time Macros and Features:**

| Macro/Flag | DISTRO Feature | Purpose | Default | Impact |
|------------|----------------|---------|---------|--------|
| `RBUS_ALWAYS_ON` | N/A | Force RBus to be always enabled and operational | Enabled | Core functionality flag |
| `_TIME_BITS=64` | N/A | Enable 64-bit time support for Y2038 compliance | Enabled | Future time compatibility |
| `_FILE_OFFSET_BITS=64` | N/A | Enable large file support (>2GB files) | Enabled | Large file handling |
| `BUILD_ONLY_RTMESSAGE` | N/A | Build only RT Message transport layer | Disabled | Minimal build option |
| `DEBUG_ELEMENTS=1` | N/A | Enable detailed element tree debugging | Disabled | Internal debugging |
| `RBUS_MAX_NAME_LENGTH=256` | N/A | Maximum parameter name length limit | 256 chars | Memory allocation control |
| `RBUS_MAX_NAME_DEPTH=16` | N/A | Maximum parameter hierarchy depth | 16 levels | Tree traversal limits |

**Runtime Configuration Parameters:**

| Parameter | Configuration Source | Purpose | Default Value | Override Method |
|-----------|---------------------|---------|---------------|-----------------|
| `RTROUTER_OPTIONAL_ARGS` | Environment/Service | Additional arguments for rtrouted daemon | None | systemd service override |
| `MaxConnections` | `/etc/rbus/rbus.conf` | Maximum concurrent client connections | 200 | Configuration file |
| `MessageTimeout` | `/etc/rbus/rbus.conf` | Default message timeout in milliseconds | 30000ms | Configuration file |
| `LogLevel` | `/etc/rbus/rbus.conf` | RBus logging verbosity level | INFO | Configuration file, environment |
| `SocketPath` | Runtime | Unix domain socket path for IPC | `/tmp/rtroute` | Runtime configuration |
| `MaxMessageSize` | Runtime | Maximum message payload size | 10MB | Runtime configuration |
| `ClientTimeout` | Runtime | Client connection timeout | 60s | Runtime configuration |

**DISTRO Features and Integration:**

| DISTRO Feature | Purpose | Impact on Build | Required Components | Optional Enhancements |
|----------------|---------|----------------|-------------------|---------------------|
| `RBUS_ENABLE_TESTAPPS` | Enable RBus test applications | Builds sample apps and test tools | Standard build dependencies | Development and validation tools |
| `rdklogger` | RDK centralized logging | Integrates with RDK logging system | rdk-logger library | Centralized log management |
| `systemd` | System service management | Systemd integration and service files | systemd development libraries | Service lifecycle management |
| `coverity` | Static code analysis | Enables Coverity scanning | 

**RDK-B Platform and Integration Requirements:** 

- **RDK-B Components**: rtrouted daemon (mandatory), rbus_session_mgr service, systemd integration
- **HAL Dependencies**: Platform-agnostic HAL abstraction interface, no specific HAL version requirements
- **Systemd Services**: rbus.service, rbus_session_mgr.service must be active with proper service ordering
- **Message Bus**: RBus native IPC transport with rtrouted broker, automatic service discovery and registration
- **Configuration Files**: Component-specific .conf files for service definitions, /etc/rbus/rbus.conf for routing
- **Startup Order**: rtrouted daemon must start before all RDK-B middleware components (TR-069 PA, P&M, OneWifi, etc.)

**Dependent Components:** 

- **All RDK-B Middleware**: CcspPandM, OneWifi, WAN Manager, CcspTr069Pa, CcspCMAgent, CcspPsm, CcspDmCli etc. depend on RBus for IPC
- **Component Manager**: System health monitoring and component lifecycle management through RBus events
- **Telemetry Services**: Network analytics, performance monitoring, and logging systems consume RBus events
- **Management Systems**: WebPA, TR-069 ACS, cloud management platforms rely on RBus for device parameter access

<br>

**Threading Model:** 

RBus implements a hybrid threading architecture optimized for both high-throughput message processing and low-latency event handling. The framework uses a combination of dedicated service threads, worker thread pools, and event-driven processing to efficiently manage concurrent operations across multiple client connections.

- **Threading Architecture**: Multi-threaded with dedicated threads for different operational aspects
- **Main Thread**: Handles component initialization, client registration/deregistration, and API entry points for synchronous operations
- **Worker Threads**: 
  - **Message Router Thread**: Processes incoming messages, performs routing decisions, and manages message queues
  - **Event Publisher Thread**: Handles asynchronous event publishing and subscriber notification management
  - **Socket Handler Threads**: One per active client connection for dedicated I/O processing and connection state management
  - **Cleanup Thread**: Performs periodic maintenance, connection health checks, and resource garbage collection
- **Synchronization**: Uses mutex locks for critical sections, condition variables for thread coordination, and atomic operations for performance-critical counters

### Component State Flow

**Initialization to Active State**

RBus follows a structured initialization sequence that ensures proper service registration, dependency resolution, and runtime readiness before accepting client connections. The initialization process includes rtrouted daemon startup, socket establishment, service discovery registration, and health check validation.

```mermaid
stateDiagram-v2
    [*] --> Initializing
    Initializing --> LoadingConfig: Load RBus Configuration
    LoadingConfig --> StartingRTRouted: Launch rtrouted Daemon
    StartingRTRouted --> RegisteringServices: Register Core Services
    RegisteringServices --> EstablishingSockets: Create IPC Endpoints
    EstablishingSockets --> DiscoveryReady: Enable Service Discovery
    DiscoveryReady --> Active: All Systems Operational
    Active --> ProcessingMessages: Handle Client Requests
    ProcessingMessages --> Active: Message Processed
    Active --> ClientConnect: New Client Connection
    ClientConnect --> Active: Client Registered
    Active --> EventPublishing: Publish System Events
    EventPublishing --> Active: Events Dispatched
    Active --> Maintenance: Periodic Cleanup
    Maintenance --> Active: Resources Optimized
    Active --> Shutdown: Stop Request Received
    Shutdown --> [*]

    note right of Initializing
        - Initialize logging subsystem
        - Allocate core data structures
        - Setup signal handlers
    end note

    note right of Active
        - Process get/set requests
        - Route method invocations
        - Manage event subscriptions
        - Monitor system health
    end note
```

```mermaid
sequenceDiagram
    autonumber
    participant System
    participant RBus
    participant RTRouted
    participant Services
    participant Sockets
    participant Discovery
    participant Clients

    System->>System: Start [*] → Initializing
    Note right of System: Initialize logging<br>Allocate data structures<br>Setup signal handlers

    System->>RBus: Framework Start → LoadingConfig
    Note right of RBus: Load RBus configuration<br>Parse routing settings<br>Validate parameters

    RBus->>RTRouted: Config Loaded →<br>StartingRTRouted
    RTRouted->>Services: Daemon Ready →<br>RegisteringServices
    Services->>Sockets: Services Registered →<br>EstablishingSockets
    Sockets->>Discovery: Endpoints Created →<br>DiscoveryReady

    Discovery->>System: Discovery Active → Active
    Note right of System: Process get/set requests<br>Route method invocations<br>Manage subscriptions<br>Monitor health

    System->>Clients: Client Requests → ProcessingMessages
    Clients->>System: Messages Processed → Active
    System->>System: Periodic Tasks → Maintenance
    System->>System: Resources Optimized → Active

    System->>System: Stop Request → Shutdown → [*]
```

**Runtime State Changes and Context Switching**

RBus maintains operational state context during runtime to handle different operational modes, error conditions, and performance optimization scenarios. The system supports graceful degradation, load balancing, and failover mechanisms.

**State Change Triggers:**

- Client connection/disconnection events trigger service availability updates and resource reallocation
- Network or socket errors trigger connection retry mechanisms and alternative routing path discovery
- High message load triggers performance optimization modes including message batching and priority queuing
- Configuration updates trigger service re-registration and capability advertisement updates

**Context Switching Scenarios:**

- Performance mode switching between low-latency and high-throughput processing based on message volume
- Error recovery mode activation when client connections fail, including automatic retry and graceful degradation
- Maintenance mode entry for system updates, configuration reloads, and resource optimization operations

### Call Flow

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant Init as System Init
    participant RBus as RBus Framework
    participant RTRouted as rtrouted Daemon
    participant Client as RBus Client

    Init->>RBus: Start RBus Service
    RBus->>RBus: Load Configuration Files
    RBus->>RTRouted: Launch rtrouted Daemon
    RTRouted->>RTRouted: Initialize Message Router
    RTRouted->>RBus: Daemon Ready Signal
    RBus->>RBus: Create IPC Endpoints
    RBus->>RBus: Register Core Services
    RBus->>Init: RBus Framework Ready
    Client->>RBus: rbus_open() Connection Request
    RBus->>RTRouted: Register New Client
    RTRouted->>RBus: Client Registration Complete
    RBus->>Client: Connection Handle Returned
```

**Request Processing Call Flow:**

```mermaid
sequenceDiagram
    participant Client as RBus Client
    participant RBusAPI as RBus API Layer
    participant RBusCore as RBus Core
    participant RTRouted as Message Router
    participant Provider as Service Provider

    Client->>RBusAPI: rbus_get("Device.WiFi.Radio.1.Enable")
    RBusAPI->>RBusCore: Serialize Get Request
    RBusCore->>RTRouted: Route Message to Provider
    RTRouted->>Provider: Forward Get Request
    Provider->>Provider: Process Property Access
    Provider->>RTRouted: Return Property Value
    RTRouted->>RBusCore: Route Response Message
    RBusCore->>RBusAPI: Deserialize Response
    RBusAPI->>Client: Return Property Value
```

## Internal Modules

RBus is structured as a modular framework with distinct layers handling different aspects of inter-process communication. The Core module manages the high-level API and data model operations, while the RTMessage layer provides low-level transport and routing capabilities. The Session Manager handles client lifecycle and authentication, ensuring secure and reliable connections between components.

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| **RBus API Layer** | High-level C API providing property access, method invocation, event subscription, and data model management interfaces for RDK-B components | `rbus.c`, `rbus.h`, `rbus_element.c` |
| **RBus Core Engine** | Core message processing engine handling serialization, deserialization, routing logic, and data model validation with MessagePack encoding | `rbuscore.c`, `rbuscore.h`, `rbuscore_message.c` |
| **RT Message Transport** | Low-level messaging transport layer providing Unix domain socket communication, connection management, and message routing infrastructure | `rtConnection.c`, `rtMessage.c`, `rtSocket.c` |
| **Session Manager** | Client session lifecycle management, authentication, resource tracking, and cleanup operations for maintaining system stability | `session_manager/` directory files |
| **Event System** | Publish-subscribe event management including subscription handling, event filtering, value change detection, and asynchronous delivery | `rbus_asyncsubscribe.c`, `rbus_subscriptions.c` |
| **Value Management** | Data type handling, serialization, validation, and conversion for all supported RBus data types including strings, integers, booleans, and complex objects | `rbus_value.c`, `rbus_property.c`, `rbus_object.c` |

```mermaid
flowchart TD
    subgraph RBusFramework [RBus Framework Architecture]
        subgraph APILayer [RBus API Layer]
            API[RBus Public API]
            Elements[Element Management]
            Handles[Handle Management]
        end
        
        subgraph CoreLayer [RBus Core Layer]
            Core[Message Processing]
            Serialization[Data Serialization]
            Validation[Model Validation]
        end
        
        subgraph EventLayer [Event System]
            EventMgr[Event Manager]
            Subscriptions[Subscription Handler]
            AsyncEvents[Async Event Processor]
        end
        
        subgraph TransportLayer [RT Message Transport]
            RTMessage[RT Message Engine]
            Connections[Connection Manager]
            Sockets[Socket Handler]
        end
        
        subgraph SessionLayer [Session Management]
            SessionMgr[Session Manager]
            Auth[Authentication]
            Cleanup[Resource Cleanup]
        end
    end
    
    API --> Core
    Elements --> Validation
    Handles --> Connections
    Core --> Serialization
    Core --> EventMgr
    EventMgr --> Subscriptions
    Subscriptions --> AsyncEvents
    Core --> RTMessage
    RTMessage --> Connections
    Connections --> Sockets
    SessionMgr --> Auth
    SessionMgr --> Cleanup
    Auth --> Connections
```

## Component Interactions

RBus serves as the central communication hub that enables seamless interaction between all RDK-B middleware components, external management systems, and hardware abstraction layers. The framework provides both synchronous request-response patterns and asynchronous event-driven communication, supporting diverse integration requirements across the RDK-B ecosystem.

```mermaid
flowchart TD
    subgraph ExternalSystems [External Management Systems]
        ACS[TR-069 ACS Server]
        WebUI[Web Management Interface]
        CloudPlatform[Cloud Management Platform]
    end
    
    subgraph RDKBMiddleware [RDK-B Middleware Components]
        RBusFramework[RBus Framework]
        TR069PA[CcspTr069Pa]
        PAM[CcspPandM]
        OneWifi[OneWifi]
        CMAgent[CcspCMAgent]
        PSMComponent[CcspPsm]
        DMCli[CcspDmCli]
    end
    
    subgraph SystemLayer [System & HAL Layer]
        HALLayer[Hardware Abstraction Layer]
        PlatformServices[Platform Services]
        SystemdServices[Systemd Services]
    end

    ACS -->|CWMP/SOAP over HTTPS| TR069PA
    WebUI -->|HTTP/REST API| PAM
    CloudPlatform -->|MQTT/CoAP/WebSocket| PAM
    
    TR069PA <-->|rbus_get/rbus_set/Events| RBusFramework
    PAM <-->|Method Calls/Property Access| RBusFramework
    OneWifi <-->|WiFi Configuration/Events| RBusFramework
    CMAgent <-->|Cable Modem Status/Config| RBusFramework
    PSMComponent <-->|Data Persistence/Retrieval| RBusFramework
    DMCli <-->|CLI Operations/Diagnostics| RBusFramework
    
    RBusFramework -->|HAL API Calls| HALLayer
    RBusFramework -->|Service Control| SystemdServices
    RBusFramework -->|File I/O/Process Mgmt| PlatformServices

    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef rbus fill:#e3f2fd,stroke:#1976d2,stroke-width:3px;
    classDef middleware fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef system fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    
    class ACS,WebUI,CloudPlatform external;
    class RBusFramework rbus;
    class TR069PA,PAM,OneWifi,CMAgent,PSMComponent,DMCli middleware;
    class HALLayer,PlatformServices,SystemdServices system;
```

### Interaction Matrix

| Target Component/Layer | Interaction Purpose | IPC Mechanism | Message Format | Communication Pattern | Key APIs/Endpoints |
|------------------------|-------------------|---------------|----------------|---------------------|------------------|
| **RDK-B Middleware Components** |
| CcspTr069Pa | TR-069 parameter access, event notifications, remote method execution for ACS communication | RBus Native | MessagePack Binary | Request-Response/Pub-Sub | `rbus_get()`, `rbus_set()`, `Device.ManagementServer.*` |
| CcspPandM | Device configuration management, system status reporting, policy enforcement | RBus Native | MessagePack Binary | Request-Response/Events | `rbus_registerObj()`, `rbus_invokeRemoteMethod()`, `Device.*` |
| OneWifi | WiFi configuration, status monitoring, client association events, performance metrics | RBus Native | MessagePack Binary | Async Events/Polling | `rbus_subscribe()`, `Device.WiFi.*`, `WiFi.AccessPoint.*` |
| CcspCMAgent | Cable modem status, signal quality monitoring, provisioning state management | RBus Native | MessagePack Binary | Event-Driven/Polling | `rbus_publishEvent()`, `Device.X_CISCO_COM_CableModem.*` |
| CcspPsm | Persistent configuration storage, parameter validation, backup/restore operations | RBus Native | MessagePack Binary | Synchronous Calls | `rbus_get()`, `rbus_set()`, `dmsb.device.deviceinfo.*` |
| CcspDmCli | Diagnostic operations, CLI command execution, system troubleshooting | RBus Native | MessagePack Binary | Command-Response | `rbus_invokeRemoteMethod()`, `dmcli.*` commands |
| **System & HAL Layers** |
| Hardware Abstraction Layer | Hardware control interfaces, driver communication, platform-specific operations | Direct Function Calls | C Structures | Synchronous API Calls | `hal_*()` functions per HAL module |
| Platform Services | System resource management, process control, file system operations | System Calls/D-Bus | Binary/Text Config | File I/O/Process Control | `/proc`, `/sys`, systemd D-Bus interface |
| Systemd Services | Service lifecycle management, dependency resolution, system state control | D-Bus System Bus | D-Bus Messages | Method Calls/Signals | `org.freedesktop.systemd1.Manager` |
| **External Systems** |
| Cloud/ACS Management | Remote device management, configuration updates, firmware deployment | HTTPS/MQTT/CoAP | JSON/XML/Binary | RESTful/Message Queue | `POST /api/v1/devices/{id}/config` |

**Events Published by RBus:**

| Event Name | Event Topic/Path | Trigger Condition | Payload Format | Subscriber Components |
|------------|-----------------|-------------------|----------------|---------------------|
| ComponentReady | `rbus.component.{name}.ready` | Component registration complete | JSON: `{component, status, timestamp, capabilities}` | All dependent middleware components |
| ParameterValueChange | `{object_path}.{parameter}!` | Parameter value modification | MessagePack: `{oldValue, newValue, source, timestamp}` | TR-069 PA, monitoring systems |
| SystemStatusUpdate | `rbus.system.status` | System health/performance changes | JSON: `{cpu_usage, memory, connections, errors}` | Management interfaces, telemetry |
| ClientConnectionEvent | `rbus.client.{action}` | Client connect/disconnect/timeout | MessagePack: `{client_id, action, timestamp, details}` | Session manager, monitoring systems |

**Events Consumed by RBus:**

| Event Source | Event Topic/Path | Purpose | Expected Payload | Handler Function |
|-------------|-----------------|---------|------------------|------------------|
| Systemd | `org.freedesktop.systemd1.JobRemoved` | Service lifecycle state changes | D-Bus struct: `{job_id, job, unit, result}` | `systemd_job_handler()` |
| System Monitor | `system.resource.threshold` | Resource usage threshold violations | JSON: `{resource, current, threshold, action}` | `resource_threshold_handler()` |
| HAL Events | `hal.{subsystem}.event` | Hardware state changes and notifications | Binary: hardware-specific structures | `hal_event_processor()` |

### IPC Flow Patterns

**Primary IPC Flow - Property Access:**

```mermaid
sequenceDiagram
    participant Client as RDK-B Component
    participant RBusCore as RBus Core
    participant RTRouted as Message Router
    participant Provider as Property Provider
    participant HAL as HAL Layer

    Client->>RBusCore: rbus_get("Device.WiFi.Radio.1.Channel")
    Note over RBusCore: Validate parameter path and permissions
    RBusCore->>RTRouted: Route request to WiFi provider
    RTRouted->>Provider: Forward property get request
    Provider->>HAL: hal_wifi_getRadioChannel(1)
    HAL-->>Provider: Return channel value
    Provider->>RTRouted: Property response with value
    RTRouted->>RBusCore: Route response back to client
    RBusCore-->>Client: Return property value
```

**Event Notification Flow:**

```mermaid
sequenceDiagram
    participant HAL as HAL Layer
    participant Provider as Event Provider
    participant RBusCore as RBus Core
    participant Sub1 as Subscriber 1
    participant Sub2 as Subscriber 2

    HAL->>Provider: Hardware event notification
    Note over Provider: Process event and determine impact
    Provider->>RBusCore: rbus_publishEvent() with event data
    Note over RBusCore: Identify active subscribers for event
    RBusCore->>Sub1: Async event delivery
    RBusCore->>Sub2: Async event delivery
    Sub1-->>RBusCore: Event acknowledgment (if required)
    Sub2-->>RBusCore: Event acknowledgment (if required)
```

## Implementation Details

### Major HAL APIs Integration

RBus provides a flexible abstraction layer that allows RDK-B components to interact with Hardware Abstraction Layer (HAL) modules without direct coupling. The framework supports both direct HAL API calls and HAL event integration for hardware status monitoring and control operations.

**Core HAL APIs:**

| HAL API | Purpose | Parameters | Return Values | Implementation File |
|---------|---------|------------|---------------|-------------------|
| `hal_platform_init()` | Initialize platform-specific HAL subsystems | `platform_config_t *config` | `0=success, <0=error` | `rbuscore.c` |
| `hal_wifi_*()` functions | WiFi hardware control and status monitoring | Device index, configuration structures | HAL status codes | OneWifi integration |
| `hal_cm_*()` functions | Cable modem hardware interface operations | Modem index, parameter structures | Status/error codes | CM Agent integration |
| `hal_ethernet_*()` functions | Ethernet interface management and statistics | Port index, configuration data | Interface status | P&M Component integration |

### Key Implementation Logic

- **Message Processing Engine**: Core message handling implemented in `rbuscore.c` with high-performance message queue management, priority-based routing, and load balancing capabilities across multiple client connections. Main implementation in `rbuscore.c` with message serialization, validation, and routing logic. Connection state management in `rtConnection.c` handling client lifecycle and resource cleanup.
  
- **Event Processing**: Hardware and software events processed through publish-subscribe mechanism with filtering, transformation, and reliable delivery guarantees. Event subscription management with topic-based filtering and wildcard support. Asynchronous event delivery with retry mechanisms and failure handling. Value change detection with configurable thresholds and debouncing logic.

- **Error Handling Strategy**: Comprehensive error detection, logging, and recovery mechanisms ensure system stability during component failures and network issues. HAL error code mapping with automatic retry logic for transient failures. Connection failure recovery with exponential backoff and alternative routing. Message timeout handling with configurable retry counts and escalation procedures.

- **Logging & Debugging**: Multi-level logging system with performance monitoring, debug tracing, and system health metrics for troubleshooting and optimization. Message flow tracing with unique transaction IDs for end-to-end debugging. Performance metrics collection including latency, throughput, and error rates. Debug hooks for real-time system state inspection and configuration validation.

### Key Configuration Files

| Configuration File | Purpose | Key Parameters | Default Values | Override Mechanisms |
|--------------------|---------|---------------|----------------|--------------------|
| `/etc/rbus/rbus.conf` | Main RBus configuration | `MaxConnections`, `MessageTimeout`, `LogLevel` | `200`, `30000ms`, `INFO` | Environment variables, command line |
| `/usr/lib/systemd/system/rbus.service` | Systemd service definition | `ExecStart`, `Restart`, `Dependencies` | rtrouted daemon | Systemd overrides |
| `/tmp/rtrouted.conf` | Runtime router configuration | `SocketPath`, `MaxMessageSize`, `ClientTimeout` | `/tmp/rtroute`, `10MB`, `60s` | Runtime generation |
| Component-specific `.conf` files | Individual component settings | Service names, object registrations, capabilities | Component-dependent | Component initialization |