# RDK Logger Documentation

RDK Logger is a comprehensive logging framework that serves as the cornerstone logging mechanism for all RDK-B middleware components. It provides centralized, configurable, and runtime-controllable logging capabilities across the entire RDK-B ecosystem. The component abstracts the complexity of underlying logging utilities while offering fine-grained control over log levels, formatting, and output destinations for different modules and components.

RDK Logger serves three critical functions in the RDK-B middleware: First, it provides a unified logging interface that standardizes how all RDK-B components generate and manage log messages, ensuring consistency across the entire platform. Second, it enables dynamic runtime control of logging behavior, allowing operators to adjust logging levels and verbosity without requiring system restarts or service interruptions. Third, it optimizes system performance by providing efficient filtering mechanisms that minimize logging overhead when verbose logging is disabled.

At the module level, RDK Logger implements a sophisticated configuration-driven architecture that allows each component to maintain its own logging context while participating in a centralized logging ecosystem. The framework handles log message formatting, filtering, routing, and output management, while providing thread-safe operations and minimal performance impact on the host applications.

```mermaid
graph TD
    subgraph ExternalSys["External Systems"]
        Admin[System Administrator]
        Monitor[Monitoring Systems]
        Debug[Debug Tools]
    end
    
    subgraph RDKBComponents["RDK-B Middleware Components"]
        CM[CcspCMAgent]
        TR069[CcspTr069Pa]
        WiFi[CcspWifiAgent]
        PAM[CcspPandM]
        Other[Other RDK Components]
    end
    
    subgraph RDKLoggerCore["RDK Logger Core"]
        RDKLog[RDK Logger Library]
        Config[Configuration Manager]
        Runtime[Runtime Controller]
        Format[Log Formatter]
    end
    
    subgraph PlatformLayer["Platform Layer"]
        Log4C[(Log4C Backend)]
        FileSystem[File System]
        Stdout[Standard Output]
        Syslog[System Logger]
    end
    
    subgraph ConfigFiles["Configuration"]
        DebugIni[debug.ini]
        Override[nvram override]
    end
    
    Admin -->|rdklogctrl commands| Runtime
    Monitor -->|Log parsing/analysis| FileSystem
    Debug -->|Real-time monitoring| Stdout
    
    CM -->|RDK_LOG calls| RDKLog
    TR069 -->|RDK_LOG calls| RDKLog
    WiFi -->|RDK_LOG calls| RDKLog
    PAM -->|RDK_LOG calls| RDKLog
    Other -->|RDK_LOG calls| RDKLog
    
    Config -->|Loads| DebugIni
    Config -->|Override from| Override
    Runtime -->|Dynamic updates| Config
    
    RDKLog -->|Formatted messages| Format
    Format -->|Output routing| Log4C
    Format -->|Direct output| Stdout
    Format -->|System integration| Syslog
    Log4C -->|File management| FileSystem

    classDef user fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef component fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef rdklogger fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px;
    classDef platform fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef config fill:#fff8e1,stroke:#f57f17,stroke-width:2px;
    
    class Admin,Monitor,Debug user;
    class CM,TR069,WiFi,PAM,Other component;
    class RDKLog,Config,Runtime,Format rdklogger;
    class Log4C,FileSystem,Stdout,Syslog platform;
    class DebugIni,Override config;
```

```mermaid
graph LR
    subgraph "External Systems"
        RemoteMgmt["Remote Management"]
        LocalUI["Local Web UI"]
        AdminTools["Admin Tools<br/>rdklogctrl"]
        MonitorSys["Monitoring Systems"]
    end

    subgraph "RDK-B Platform"
        subgraph "Remote Management Agents"
            ProtocolAgents["TR-069/WebPA/TR-369<br/>Protocol Agents"]
        end
        
        subgraph "Logging Framework"
            RDKLogger["RDKLogger<br/>(Logging Framework)"]
        end
        
        subgraph "RDK-B Core Components"
            CMAgent["CM Agent"]
            WiFiAgent["WiFi Agent"]
            PAM["P&M Component"]
            PSM["PSM"]
            OtherComp["Other Components"]
        end
        
        subgraph "System Layer"
            Log4C["Log4C Backend"]
            Linux["Linux Kernel<br/>(System Logger)"]
        end
    end

    %% External connections
    RemoteMgmt -->|TR-069/WebPA/TR-369| ProtocolAgents
    LocalUI -->|HTTP/HTTPS| ProtocolAgents
    AdminTools -->|UDP Control| RDKLogger
    MonitorSys -->|Log Analysis| RDKLogger

    %% Upper layer to RDK Logger
    ProtocolAgents -->|RDK_LOG APIs| RDKLogger

    %% RDK-B Components to Logger
    CMAgent -->|RDK_LOG APIs| RDKLogger
    WiFiAgent -->|RDK_LOG APIs| RDKLogger
    PAM -->|RDK_LOG APIs| RDKLogger
    PSM -->|RDK_LOG APIs| RDKLogger
    OtherComp -->|RDK_LOG APIs| RDKLogger

    %% System Layer interactions
    RDKLogger <-->|Log4C APIs| Log4C
    Log4C <-->|System Calls| Linux

    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef rdklogger fill:#e3f2fd,stroke:#1976d2,stroke-width:3px;
    classDef rdkbComponent fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef system fill:#fce4ec,stroke:#c2185b,stroke-width:2px;

    class RemoteMgmt,LocalUI,AdminTools,MonitorSys external;
    class RDKLogger rdklogger;
    class ProtocolAgents,CMAgent,WiFiAgent,PAM,PSM,OtherComp rdkbComponent;
    class Log4C,Linux system;
```

**Key Features & Responsibilities**: 

- **Centralized Logging Framework**: Provides a unified logging API and configuration system for all RDK-B middleware components, ensuring consistent logging behavior across the entire platform
- **Dynamic Runtime Control**: Enables real-time adjustment of log levels and verbosity for individual modules through the `rdklogctrl` utility without requiring service restarts
- **Module-Specific Configuration**: Supports independent log level configuration for each component through the `debug.ini` file, allowing fine-grained control over logging behavior
- **Performance Optimization**: Implements efficient filtering mechanisms that minimize CPU and memory overhead when verbose logging is disabled, crucial for resource-constrained embedded systems
- **Multi-Level Logging Support**: Provides comprehensive log level hierarchy (TRACE, DEBUG, INFO, NOTICE, WARN, ERROR, FATAL) with configurable verbosity control
- **Thread-Safe Operations**: Ensures safe concurrent access to logging functions across multi-threaded RDK-B components without requiring external synchronization
- **Configuration Management**: Handles automatic detection of configuration file overrides (`/nvram/debug.ini` vs `/etc/debug.ini`) and runtime configuration updates
- **Log Format Standardization**: Enforces consistent timestamp, module identification, and message formatting across all RDK-B components for improved log analysis and monitoring

## Design

RDK Logger is architected as a lightweight, efficient logging abstraction layer that sits between RDK-B applications and the underlying Log4C logging infrastructure. The design follows a modular approach where the core logging functionality is separated from configuration management, runtime control, and output formatting. This separation enables independent evolution of each subsystem while maintaining backward compatibility and minimizing performance impact on client applications.

The architecture emphasizes configuration-driven behavior where all logging policies are externalized to the `debug.ini` configuration file. This design choice enables system administrators and developers to adjust logging behavior without code changes or application restarts. The framework implements a two-tier configuration system: default system-wide settings in `/etc/debug.ini` and optional overrides in `/nvram/debug.ini`, providing flexibility for both development and production environments.

Northbound interactions with RDK-B middleware components are handled through a simple, high-performance C API that provides printf-style logging functions. The API design minimizes function call overhead and includes compile-time optimizations for disabled log levels. Southbound interactions with the Log4C library and system logging facilities are abstracted through a pluggable backend architecture that allows for future extensibility to alternative logging systems.

The IPC mechanism design leverages UDP sockets for runtime log level control, enabling the `rdklogctrl` utility to communicate with running processes without requiring complex IPC infrastructure. This lightweight approach ensures that runtime control operations have minimal impact on system performance and can function reliably even under high system load conditions.

Data persistence and storage management are handled through a combination of in-memory configuration caching and file-based persistence. The framework loads configuration at startup, caches it in memory for performance, and provides mechanisms for runtime updates. Log output persistence is delegated to the underlying Log4C system, which handles file rotation, compression, and storage management according to its own configuration.

```mermaid
graph TD

    subgraph ContainerBoundary ["RDK Logger Library"]
        subgraph CoreAPI ["Core Logging API"]
            API[RDK_LOG Macros & Functions]
            Init[rdk_logger_init.c]
            Utils[rdk_logger_util.c]
            noteAPI["Purpose: Main logging interface"]
        end

        subgraph ConfigMgmt ["Configuration Management"]
            Config[Configuration Parser]
            Override[Override Handler]
            Cache[In-Memory Cache]
            noteConfig["Purpose: Manages debug.ini parsing"]
        end

        subgraph Runtime ["Runtime Control System"]
            DynLog[rdk_dynamic_logger.c]
            Socket[UDP Socket Handler]
            LevelCtrl[Level Control Logic]
            noteRuntime["Purpose: Dynamic log level changes"]
        end

        subgraph Debug ["Debug & Utilities"]
            DebugMod[rdk_debug.c]
            DebugPriv[rdk_debug_priv.c]
            Milestone[rdk_logger_milestone.c]
            noteDebug["Purpose: Debugging and diagnostics"]
        end

        subgraph OutputMgmt ["Output Management"]
            Formatter[Log Formatter]
            Router[Output Router]
            Filter[Level Filter]
            noteOutput["Purpose: Message formatting and routing"]
        end
    end

    subgraph ExternalSystems ["External Systems"]
        Log4C[(Log4C Logging Library)]
        GLib[(GLib-2.0)]
        FileSystem[File System]
        ConfigFiles[Configuration Files]
    end

    subgraph Utilities ["Utility Programs"]
        RdkLogCtrl[rdklogctrl]
        OnBoard[onboard_main.c]
        MilestoneUtil[rdklogmilestone]
    end

    API -->|Configuration requests| Config
    Config -->|Cached settings| Cache
    Cache -->|Level queries| Filter
    
    DynLog -->|UDP Socket communication| Socket
    Socket -->|Runtime updates| Cache
    
    API -->|Log messages| Formatter
    Formatter -->|Filtered output| Filter
    Filter -->|Formatted logs| Router
    Router -->|Backend calls| Log4C
    Router -->|Direct output| FileSystem
    
    DebugMod -->|Internal logging| API
    Milestone -->|Milestone events| API
    
    Config -->|File I/O| ConfigFiles
    Log4C -->|File management| FileSystem
    
    RdkLogCtrl -->|UDP control messages| Socket
    OnBoard -->|Initialization support| Init
```

```mermaid
flowchart TD
    subgraph "RDK Logger Architecture"
        subgraph "Public API Layer"
            API[Core Logging API<br/>rdk_logger.h]
            Macros[RDK_LOG Macros]
        end
        
        subgraph "Configuration Layer"
            Config[Configuration Manager]
            Cache[Configuration Cache]
        end
        
        subgraph "Runtime Control"
            DynLog[Dynamic Logger]
            UDPServer[UDP Control Server]
        end
        
        subgraph "Logging Subsystems"
            Debug[Debug Support]
            Milestone[Milestone Logging]
            OnBoard[Onboarding Support]
        end
        
        subgraph "Output Management"
            Formatter[Message Formatter]
            Filter[Level Filter]
            Router[Output Router]
        end
        
        subgraph "Backend Integration"
            Log4C[Log4C Backend]
            FileOut[File Output]
            ConsoleOut[Console Output]
        end
    end
    
    API --> Config
    Macros --> Filter
    Config --> Cache
    Cache --> Filter
    
    DynLog --> UDPServer
    UDPServer --> Cache
    
    API --> Debug
    Debug --> Milestone
    Milestone --> OnBoard
    
    Filter --> Formatter
    Formatter --> Router
    Router --> Log4C
    Router --> FileOut
    Router --> ConsoleOut
    
    classDef api fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef config fill:#fff8e1,stroke:#f57f17,stroke-width:2px;
    classDef runtime fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef subsystem fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef output fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef backend fill:#fce4ec,stroke:#c2185b,stroke-width:2px;
    
    class API,Macros api;
    class Config,Cache config;
    class DynLog,UDPServer runtime;
    class Debug,Milestone,OnBoard subsystem;
    class Formatter,Filter,Router output;
    class Log4C,FileOut,ConsoleOut backend;
```

### Prerequisites and Dependencies

**Build-Time Flags and Configuration:**

| Configure Option | DISTRO Feature | Build Flag | Purpose | Default |
|------------------|----------------|------------|---------|---------|
| `--enable-milestone` | N/A | `LOGMILESTONE` | Enable milestone logging for system events and boot tracking | Enabled |
| `--enable-onboardlog` | N/A | `IS_ONBOARDLOG_ENABLED` | Enable onboard logging utilities and support | Disabled |
| `--enable-systemd-syslog-helper` | N/A | `SYSTEMD_SYSLOG_HELPER` | Enable systemd syslog helper integration | Disabled |
| `--enable-journal` | N/A | `SYSTEMD_JOURNAL` | Enable systemd journal logging support | Disabled |
| N/A | `safec` | `SAFEC_DUMMY_API` | Safe C library integration for secure string operations | Auto-detected |

**RDK-B Platform and Integration Requirements**

- **RDK-B Components**: 
  - No mandatory RDK-B middleware dependencies (RDK Logger is a foundational component)
  - Integration with `systemd` for service management in systemd-enabled builds
  - Coordination with `rdk-logger` recipe in Yocto build system
- **HAL Dependencies**: No direct HAL interface dependencies (operates at middleware layer)
- **Systemd Services**: No specific systemd service dependencies, but integrates with systemd journal when available
- **Message Bus**: No RBus registration required (RDK Logger operates below the message bus layer)
- **Configuration Files**: 
  - `/etc/debug.ini` (primary configuration file, must exist)
  - `/nvram/debug.ini` (optional override configuration)
  - Proper file system permissions for configuration file access
- **Startup Order**: Must initialize before any RDK-B component that uses logging (typically first in startup sequence)

<br>

**Threading Model:**

RDK Logger implements a library-based architecture with minimal threading, designed for high-performance integration into multi-threaded RDK-B applications. Unlike service-based components, RDK Logger operates as a shared library that provides thread-safe logging APIs to client applications.

| Thread & Function | Purpose | Cycle/Timeout | Synchronization |
|-------------------|---------|----------------|------------------|
| **Client Application Thread**<br>`RDK_LOG()` calls | Primary logging interface for client applications | Event-driven API calls, immediate log processing, thread-safe Log4C integration | Thread-safe Log4C backend, atomic log level checks |
| **UDP Control Listener**<br>`rdk_dyn_log_process_pending_request()` | Runtime log level control via rdklogctrl utility | Non-blocking UDP socket polling, immediate configuration updates | Socket-based IPC, configuration cache updates |
| **Configuration Manager**<br>`rdk_logger_init()` / `rdk_logger_deinit()` | Library initialization and cleanup operations | One-time initialization per process, configuration file parsing | File system synchronization, memory management |

### Component State Flow

**Initialization to Active State**

RDK Logger follows a well-defined initialization sequence that ensures proper configuration loading, backend initialization, and runtime control setup before becoming available for client applications.

```mermaid
sequenceDiagram
    participant System as System Startup/Application
    participant Logger as RDK Logger Core
    participant Config as Configuration Manager
    participant Log4C as Log4C Backend
    participant DynCtrl as Dynamic Controller
    participant FileSystem as File System

    System->>Logger: RDK_LOGGER_INIT()
    Note over Logger: State: Initializing<br/>Check file paths, setup logging context
    
    Logger->>FileSystem: Check /nvram/debug.ini existence
    FileSystem-->>Logger: File status (exists/not exists)
    
    alt Override file exists
        Logger->>Config: Load /nvram/debug.ini
    else Default configuration
        Logger->>Config: Load /etc/debug.ini
    end
    
    Config->>FileSystem: Parse configuration file
    FileSystem-->>Config: Configuration data
    Config-->>Logger: Configuration loaded successfully
    Note over Logger: State: LoadingConfig → InitializingBackend
    
    Logger->>Log4C: Initialize Log4C backend
    Log4C-->>Logger: Backend initialization complete
    Note over Logger: State: InitializingBackend → StartingDynamicControl
    
    Logger->>DynCtrl: Start UDP listener for runtime control
    DynCtrl-->>Logger: Dynamic control service active
    Note over Logger: State: StartingDynamicControl → Active
    
    Logger->>System: RDK_SUCCESS (Initialization Complete)
    
    loop Runtime Operations
        Note over Logger: State: Active<br/>Process log messages, handle runtime updates
        System->>Logger: RDK_LOG() calls
        Logger->>Logger: Filter, format, and route messages
        
        DynCtrl->>Config: Runtime level changes via rdklogctrl
        Config->>Logger: Update cached configuration
    end
    
    System->>Logger: rdk_logger_deinit()
    Note over Logger: State: Active → Shutdown
    Logger->>DynCtrl: Stop dynamic control service
    Logger->>Log4C: Cleanup backend resources
    Logger->>System: Shutdown complete
```

**Runtime State Changes and Context Switching**

RDK Logger maintains several operational contexts that can change during runtime based on external events and configuration updates.

**State Change Triggers:**

- **Configuration File Updates**: Detection of changes to debug.ini files triggers configuration reload and cache updates
- **Dynamic Log Level Changes**: Runtime commands via `rdklogctrl` trigger immediate log level updates for specific modules
- **Backend Failures**: Log4C backend errors trigger fallback to direct stdout/stderr output to maintain logging availability
- **Memory Pressure**: High memory usage can trigger log message queuing and batch processing optimizations

**Context Switching Scenarios:**

- **Configuration Override Detection**: Switch between `/etc/debug.ini` and `/nvram/debug.ini` based on file availability and modification times
- **Output Destination Switching**: Automatic fallback from file output to console output when log files become unavailable
- **Debug Mode Activation**: Enhanced logging and diagnostic output when debug flags are enabled through configuration or runtime commands

### Call Flow

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant App as RDK-B Application
    participant RDKLog as RDK Logger API
    participant ConfigMgr as Configuration Manager
    participant Log4C as Log4C Backend
    participant DynLog as Dynamic Logger

    App->>RDKLog: RDK_LOGGER_INIT()
    RDKLog->>RDKLog: Check configuration file paths
    RDKLog->>ConfigMgr: Initialize configuration system
    ConfigMgr->>ConfigMgr: Parse debug.ini file
    ConfigMgr-->>RDKLog: Configuration loaded
    RDKLog->>Log4C: Initialize Log4C backend
    Log4C-->>RDKLog: Backend ready
    RDKLog->>DynLog: Start dynamic control listener
    DynLog-->>RDKLog: UDP listener active
    RDKLog-->>App: RDK_SUCCESS (Active State)
```

**Request Processing Call Flow:**

The most critical flow is the standard log message processing, which must be highly optimized for performance:

```mermaid
sequenceDiagram
    participant App as RDK-B Application
    participant RDKLog as RDK Logger Macro
    participant Filter as Level Filter
    participant Formatter as Message Formatter
    participant Backend as Log4C/Output

    App->>RDKLog: RDK_LOG(level, module, format, ...)
    RDKLog->>Filter: Check if level enabled for module
    
    alt Log level enabled
        Filter-->>RDKLog: Level check passed
        RDKLog->>Formatter: Format message with timestamp, module, level
        Formatter->>Backend: Send formatted message
        Backend-->>Formatter: Message written
        Formatter-->>RDKLog: Success
        RDKLog-->>App: Message logged
    else Log level disabled
        Filter-->>RDKLog: Level check failed (no-op)
        RDKLog-->>App: Message filtered (fast return)
    end
```

**Dynamic Control Call Flow:**

```mermaid
sequenceDiagram
    participant Admin as System Administrator
    participant RdkLogCtrl as rdklogctrl utility
    participant UDPListener as UDP Control Listener
    participant ConfigCache as Configuration Cache
    participant TargetApp as Target Application

    Admin->>RdkLogCtrl: rdklogctrl process_name module_name log_level
    RdkLogCtrl->>UDPListener: UDP control message
    UDPListener->>ConfigCache: Update log level for module
    ConfigCache->>TargetApp: Apply new log level immediately
    TargetApp-->>ConfigCache: Level update acknowledged
    ConfigCache-->>UDPListener: Update successful
    UDPListener-->>RdkLogCtrl: Control command completed
    RdkLogCtrl-->>Admin: Log level changed successfully
```

## Internal Modules

RDK Logger is composed of several specialized modules, each responsible for specific aspects of the logging functionality. The modular design enables maintainability and allows for independent testing and optimization of each component.

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| **Core Logging API** | Main application interface providing RDK_LOG macros and initialization functions | `include/rdk_logger.h`, `src/rdk_logger_init.c`, `src/rdk_logger_util.c` |
| **Configuration Manager** | Handles parsing, caching, and management of debug.ini configuration files | `src/rdk_logger_init.c`, configuration parsing logic embedded |
| **Dynamic Logger** | Runtime control system for changing log levels via UDP socket communication | `src/rdk_dynamic_logger.c`, `include/rdk_dynamic_logger.h` |
| **Debug Support** | Enhanced debugging capabilities, internal diagnostics, and development tools | `src/rdk_debug.c`, `src/rdk_debug_priv.c`, `include/rdk_debug.h` |
| **Milestone Logging** | Special-purpose logging for system milestones and significant events | `src/rdk_logger_milestone.c`, `include/rdk_logger_milestone.h`, `scripts/logMilestone.sh` |
| **Onboarding Support** | Utilities for component integration and initialization assistance | `src/rdk_logger_onboard.c`, `utils/rdk_logger_onboard_main.c` |
| **Runtime Control Utilities** | Command-line tools for log level management and system interaction | `utils/rdklogctrl.c`, `utils/rdklogmilestone.c` |

## Component Interactions

RDK Logger serves as a foundational component that interfaces with multiple layers of the RDK-B architecture, from application-level middleware components down to system-level services and external administrative tools.

### Interaction Matrix

| Target Component/Layer | Interaction Purpose | Key APIs/Endpoints |
|------------------------|-------------------|------------------|
| **RDK-B Middleware Components** |
| CcspCMAgent | Cable modem status and configuration logging | `RDK_LOG()`, module: `LOG.RDK.CM` |
| CcspTr069Pa | TR-069 protocol events and diagnostic logging | `RDK_LOG()`, module: `LOG.RDK.TR069` |
| CcspWifiAgent | WiFi operations, connection events, security logging | `RDK_LOG()`, module: `LOG.RDK.WIFI` |
| CcspPandM | Platform and management events, system status | `RDK_LOG()`, module: `LOG.RDK.PAM` |
| CcspPsm | Parameter storage and retrieval operations | `RDK_LOG()`, module: `LOG.RDK.PSM` |
| WAN Manager | WAN interface management and failover events | `RDK_LOG()`, module: `LOG.RDK.WANMGR` |
| **System & Platform Layers** |
| Log4C Library | Backend log message formatting and file management | `log4c_init()`, `log4c_category_log()`, configuration via log4crc |
| System Logger (syslog) | System-wide log integration and kernel message coordination | Direct syslog API calls, facility LOG_USER |
| File System | Configuration file access and log file storage | `/etc/debug.ini`, `/nvram/debug.ini`, `/var/log/*` |
| systemd Journal | Modern Linux logging integration | Journal API integration when available |
| Network Services | UDP socket communication for runtime control | UDP port 12035, localhost interface |

**Events Published by RDK Logger:**

| Event Name | Event Topic/Path | Trigger Condition | Subscriber Components |
|------------|-----------------|-------------------|---------------------|
| Log Level Change | UDP control message | Dynamic log level modification via rdklogctrl | All RDK-B components using affected module |
| Configuration Reload | Internal event | debug.ini file modification detection | Internal configuration cache, all active loggers |
| Backend Failure | Internal diagnostic | Log4C backend initialization or runtime failure | Internal fallback mechanisms, system administrators |
| Milestone Event | Log message | System milestone reached (boot, configuration, etc.) | Log monitoring systems, diagnostic tools |

### IPC Flow Patterns

**Primary IPC Flow - Standard Logging:**

```mermaid
sequenceDiagram
    participant Client as RDK-B Component
    participant RDKLogger as RDK Logger Library
    participant ConfigCache as Configuration Cache
    participant Log4C as Log4C Backend
    participant FileSystem as File System

    Client->>RDKLogger: RDK_LOG(level, module, message, ...)
    Note over RDKLogger: Fast path: Check log level enabled
    RDKLogger->>ConfigCache: Query level for module (atomic read)
    ConfigCache-->>RDKLogger: Level enabled/disabled
    
    alt Log level enabled
        RDKLogger->>RDKLogger: Format message with timestamp, module ID
        RDKLogger->>Log4C: log4c_category_log(category, priority, message)
        Log4C->>FileSystem: Write formatted log to file
        FileSystem-->>Log4C: Write acknowledged
        Log4C-->>RDKLogger: Log operation complete
        RDKLogger-->>Client: Success (minimal overhead)
    else Log level disabled
        Note over RDKLogger: Fast return - no processing
        RDKLogger-->>Client: No-op return (optimized path)
    end
```

**Dynamic Control Flow - Runtime Log Level Changes:**

```mermaid
sequenceDiagram
    participant Admin as System Administrator
    participant RdkLogCtrl as rdklogctrl Utility
    participant UDPListener as RDK Logger UDP Listener
    participant ConfigCache as Configuration Cache
    participant ActiveLoggers as Active Logger Instances

    Admin->>RdkLogCtrl: rdklogctrl myapp LOG.RDK.WIFI DEBUG
    RdkLogCtrl->>RdkLogCtrl: Parse and validate command parameters
    RdkLogCtrl->>UDPListener: UDP control packet (port 12035)
    Note over UDPListener: Process: myapp, Module: LOG.RDK.WIFI, Level: DEBUG
    
    UDPListener->>ConfigCache: Update log level for module (atomic write)
    ConfigCache->>ActiveLoggers: Propagate level change to all instances
    Note over ActiveLoggers: Immediate effect - new log level active
    
    ActiveLoggers-->>ConfigCache: Update confirmation
    ConfigCache-->>UDPListener: Level change successful
    UDPListener-->>RdkLogCtrl: Success response
    RdkLogCtrl-->>Admin: "Log level changed successfully"
```

**Configuration Loading Flow:**

```mermaid
sequenceDiagram
    participant App as Application Startup
    participant RDKLogger as RDK Logger Init
    participant FileSystem as File System
    participant ConfigParser as Configuration Parser
    participant ConfigCache as Configuration Cache

    App->>RDKLogger: RDK_LOGGER_INIT()
    RDKLogger->>FileSystem: Check /nvram/debug.ini (override)
    
    alt Override file exists and is newer
        FileSystem-->>RDKLogger: Override file available
        RDKLogger->>ConfigParser: Parse /nvram/debug.ini
    else Use default configuration
        FileSystem-->>RDKLogger: Use default config
        RDKLogger->>ConfigParser: Parse /etc/debug.ini
    end
    
    ConfigParser->>FileSystem: Read configuration file
    FileSystem-->>ConfigParser: Configuration data
    ConfigParser->>ConfigCache: Populate log level cache
    ConfigCache-->>ConfigParser: Cache initialized
    ConfigParser-->>RDKLogger: Configuration loaded
    RDKLogger-->>App: RDK_SUCCESS (ready for logging)
```

## Implementation Details

### Major HAL APIs Integration

RDK Logger operates at the middleware layer and does not directly interface with Hardware Abstraction Layer (HAL) APIs. Instead, it provides logging services to RDK-B components that do interact with HAL layers. However, RDK Logger does integrate with system-level APIs for file access, network communication, and process management.

**Core System APIs:**

| System API | Purpose | Implementation File |
|---------|---------|-------------------|
| `socket()`, `bind()`, `recvfrom()` | UDP socket communication for runtime control via rdklogctrl | `src/rdk_dynamic_logger.c` |
| `fopen()`, `fread()`, `stat()` | Configuration file reading and monitoring | `src/rdk_logger_init.c` |
| `log4c_init()`, `log4c_category_log()` | Log4C backend initialization and message output | `src/rdk_logger_init.c`, `src/rdk_logger_util.c` |
| `gettimeofday()`, `localtime_r()` | Timestamp generation for log message formatting | `src/rdk_logger_util.c` |
| `pthread_mutex_*()` | Thread synchronization for configuration updates | `src/rdk_dynamic_logger.c` |

### Key Implementation Logic

- **Configuration Management Engine**: Core configuration system implemented in `src/rdk_logger_init.c` handles parsing of debug.ini files, detection of configuration overrides, and maintenance of in-memory configuration cache. The system supports both default configuration (`/etc/debug.ini`) and runtime overrides (`/nvram/debug.ini`) with automatic fallback mechanisms.
     - Main configuration parsing logic in `rdk_logger_init()` function 
     - Configuration override detection and file priority handling
     - In-memory cache management with atomic updates for thread safety

- **Dynamic Runtime Control**: Real-time log level modification system implemented in `src/rdk_dynamic_logger.c` provides UDP-based communication mechanism for the `rdklogctrl` utility. The system enables immediate log level changes without application restart.
     - UDP server implementation for control message reception
     - Message parsing and validation for security and stability 
     - Atomic configuration updates with immediate effect propagation

- **Performance Optimization Strategy**: High-performance logging implementation optimizes the critical path for log message processing to minimize impact on client applications.
     - Fast-path log level checking using atomic memory operations
     - Compile-time optimization for disabled log levels through macro expansion
     - Minimal function call overhead with inline level checks
     - Efficient message formatting with pre-allocated buffers

- **Error Handling and Resilience**: Comprehensive error handling ensures logging system availability even under adverse conditions.
     - Configuration file parsing error recovery with fallback to default settings
     - Log4C backend failure handling with automatic fallback to stdout/stderr
     - Network communication error handling for runtime control operations
     - Memory allocation failure handling with graceful degradation

- **Logging & Debugging**: Multi-level internal diagnostics and debugging support for troubleshooting logging system issues.
     - Internal debug logging with separate debug levels for RDK Logger itself
     - Configuration validation and reporting mechanisms
     - Runtime state monitoring and diagnostic output
     - Performance metrics collection for optimization analysis

### Key Configuration Files

| Configuration File | Purpose | Override Mechanisms |
|--------------------|---------|--------------------|
| `/etc/debug.ini` | Primary system-wide logging configuration with default log levels for all RDK-B components | Environment variable `RDK_LOGGER_CONFIG_PATH`, `/nvram/debug.ini` override |
| `/nvram/debug.ini` | Runtime configuration override file for temporary or persistent log level changes | Takes precedence when present and readable, automatic detection |
| `log4crc` | Log4C backend configuration for output formatting, file rotation, and destination control | Log4C environment variables, application-specific log4crc files |
| `/var/log/messages` | Default log output destination for system-wide RDK-B component logs | Log4C configuration, syslog configuration, systemd journal settings |
