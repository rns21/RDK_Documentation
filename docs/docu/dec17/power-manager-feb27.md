# Power Manager Documentation

The RDKB Power Manager is a lightweight system service responsible for managing power state transitions and coordinating orderly shutdown and startup of RDKB CCSP components based on power source changes and thermal conditions. This component monitors power transition events from the system layer and orchestrates component lifecycle management to ensure system stability during power state changes. Power Manager handles transitions between AC power and battery operation on supported platforms, as well as thermal management states to protect hardware from overheating conditions.

The component operates as a daemon process that listens to sysevent notifications for power state changes, validates transitions, invokes management scripts to control RDKB component lifecycles, and publishes the current power state for other components to consume. Power Manager maintains minimal resource footprint while ensuring reliable power event handling and component coordination across different power modes.

```mermaid
graph LR
    subgraph "External Systems"
        SYSD[System Power Events]
        THERM[Thermal Monitoring]
    end

    subgraph "RDK-B Platform"
        PWR["Power Manager"]
        PANDM["CCSP P&M"]
        MTA["MTA Agent"]
        WIFI["WiFi Manager"]
        MOCA["MoCA Agent"]
        LM["LMLite"]
        HARV["Harvester"]

        subgraph "System Layer"
            SYSEVT["Sysevent Daemon"]
            SYSD_SVC["Systemd Services"]
        end
        
        subgraph "HAL Layer"
            MTAHAL["MTA HAL"]
        end
    end
    
    SYSD -->|Power Events| SYSEVT
    THERM -->|Thermal Events| SYSEVT
    SYSEVT <-->|rdkb-power-transition<br>rdkb-power-state| PWR
    PWR -->|Script Execution| SYSD_SVC
    PWR -->|Battery Query| MTAHAL
    SYSD_SVC -.->|Shutdown Order| HARV
    SYSD_SVC -.->|Shutdown Order| LM
    SYSD_SVC -.->|Shutdown Order| WIFI
    SYSD_SVC -.->|Shutdown Order| MOCA
    SYSD_SVC -.->|Keep Running| PANDM
    SYSD_SVC -.->|Keep Running| MTA
    
    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef pwrMgr fill:#e3f2fd,stroke:#1976d2,stroke-width:3px;
    classDef rdkbComponent fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef system fill:#fce4ec,stroke:#c2185b,stroke-width:2px;
    
    class SYSD,THERM external;
    class PWR pwrMgr;
    class PANDM,MTA,WIFI,MOCA,LM,HARV rdkbComponent;
    class SYSEVT,SYSD_SVC,MTAHAL system;
```

**Key Features & Responsibilities**: 

- **Power State Transition Management**: Monitors and processes power source transitions between AC power and battery operation on supported platforms, ensuring graceful component shutdown and startup sequences
- **Thermal State Management**: Handles thermal condition transitions from normal operation to hot state and back to cooled state, triggering protective component shutdowns to prevent hardware damage
- **Component Lifecycle Coordination**: Orchestrates orderly shutdown and startup of non-essential RDKB components while preserving critical services for remote management and voice functionality
- **Sysevent Integration**: Listens to rdkb-power-transition events and publishes rdkb-power-state notifications enabling system-wide awareness of current power operating mode

## Design

Power Manager implements a lightweight event-driven architecture focused on reliable power state monitoring and component coordination with minimal system overhead. The design separates power event detection, state transition validation, and component lifecycle management through well-defined interfaces. The component operates as a standalone daemon process with dedicated threading for asynchronous event handling ensuring responsive state transitions without blocking critical operations.

The architecture maintains a simple state machine tracking current power mode and validating transition requests to prevent invalid state changes. Power Manager delegates actual component shutdown and startup operations to a companion shell script that encapsulates platform-specific systemd service management commands. This separation enables flexible adaptation to different platform requirements while maintaining consistent core power management logic across product variants.

Sysevent serves as the primary IPC mechanism for both receiving power transition notifications and publishing current state information. The component establishes two sysevent connections - one dedicated to asynchronous event notifications and another for synchronous state publication operations. On startup, Power Manager queries battery status through MTA HAL on battery-capable platforms to initialize with correct power state before beginning event processing.

```mermaid
graph TD
    subgraph External ["External Services"]
        SYSE[Sysevent Daemon]
        HAL[MTA HAL]
        SHELL[Shell Script rdkb_power_manager.sh]
    end
    
    subgraph PowerMgr ["Power Manager"]
        direction TB
        MAIN[Main Process]
        INIT[Initialization Module]
        STATE[State Machine]
        SYSE_HAND[Sysevent Handler Thread]
        TRANS[Transition Handler]
        SCRIPT[Script Executor]
    end
    
    MAIN -->|Initialize| INIT
    INIT -->|Register Events| SYSE
    INIT -->|Query Battery Status| HAL
    INIT -->|Set Initial State| STATE
    INIT -->|Spawn Thread| SYSE_HAND
    SYSE_HAND <-->|Get Notifications| SYSE
    SYSE_HAND -->|Validate & Process| TRANS
    TRANS -->|Check Current State| STATE
    TRANS -->|Execute Script| SCRIPT
    SCRIPT -->|Invoke Shell| SHELL
    SHELL -->|systemctl commands| External
    TRANS -->|Update State| STATE
    TRANS -->|Publish State| SYSE
    
    classDef component fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef external fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    
    class MAIN,INIT,STATE,SYSE_HAND,TRANS,SCRIPT component;
    class SYSE,HAL,SHELL external;
```

### Prerequisites and Dependencies

**Build-Time Flags and Configuration:**

| Configure Option | DISTRO Feature | Build Flag | Purpose | Default |
|------------------|----------------|------------|---------|---------|
| `--enable-gtestapp` | N/A | `GTEST_ENABLE` | Enable GTest support for unit testing | Disabled |
| N/A | Platform-specific | `_XBB1_SUPPORTED_` | Enable XBB1 platform battery power management support | Platform conditional |
| N/A | Platform-specific | `_CBR2_PRODUCT_REQ_` | Enable CBR2 platform battery power management support | Platform conditional |
| N/A | RDK logging | `FEATURE_SUPPORT_RDKLOG` | Enable RDK logger integration for standardized logging | Enabled |
| N/A | Crash reporting | `INCLUDE_BREAKPAD` | Enable breakpad crash handler for minidump generation | Enabled |
| N/A | Development | `_DEBUG` | Enable debug output redirection to console | Enabled in source |

<br>

**RDK-B Platform and Integration Requirements:**

* **Build Dependencies**: `ccsp-common-library`, `sysevent`, `syscfg`, `hal-mta`, `rdk-logger`, `breakpad`, `breakpad-wrapper`, `secure-wrapper`
* **RDK-B Components**: `CcspCrSsp`, `CcspMtaAgentSsp`
* **HAL Dependencies**: MTA HAL APIs for battery status query on battery-capable platforms
* **Systemd Services**: `CcspCrSsp.service`, `CcspMtaAgentSsp.service` must be active before `rdkbPowerManager.service` starts
* **Configuration Files**: `/tmp/.rdkbPowerMgr.pid` for process tracking, `/etc/device.properties` for platform configuration, `/etc/debug.ini` for RDK logger initialization
* **Startup Order**: Initialize after sysevent daemon is running and MTA agent services are available

<br>

**Threading Model:** 

Power Manager implements a multi-threaded architecture with a main process thread and a dedicated worker thread for asynchronous sysevent notification handling.

- **Threading Architecture**: Multi-threaded with event-driven worker thread
- **Main Thread**: Handles component initialization, sysevent registration, initial state setup, and process lifecycle management including thread creation and cleanup
- **Worker Threads**: 
  - **Sysevent Handler Thread**: Continuously monitors rdkb-power-transition events, validates incoming transition requests, invokes state transition logic, and publishes updated power state
- **Synchronization**: Thread naming using pthread_setname_np for debugging and monitoring, thread joining on shutdown for clean termination

### Component State Flow

**Initialization to Active State**

Power Manager follows a sequential initialization process establishing sysevent connections, querying initial power state, and spawning the event handler thread before transitioning to active monitoring mode.

```mermaid
sequenceDiagram
    autonumber
    participant System as System Startup
    participant PowerMgr as Power Manager
    participant Sysevent as Sysevent Daemon
    participant HAL as MTA HAL
    participant Thread as Sysevent Handler Thread

    System->>PowerMgr: Start rdkbPowerMgr Process
    Note over PowerMgr: State: Initializing<br/>Fork and daemonize process
    
    PowerMgr->>PowerMgr: Check PID File /tmp/.rdkbPowerMgr.pid
    Note over PowerMgr: Prevent duplicate instances
    
    PowerMgr->>Sysevent: Register rdkb_power_manger Connection
    Sysevent-->>PowerMgr: sysevent_fd and token
    PowerMgr->>Sysevent: Register rdkb_power_manger-gs Connection
    Sysevent-->>PowerMgr: sysevent_fd_gs and token_gs
    Note over PowerMgr: State: Initializing → LoadingDefaults
    
    PowerMgr->>HAL: mta_hal_BatteryGetPowerStatus
    Note over PowerMgr: Query battery status on XBB1/CBR2
    HAL-->>PowerMgr: Battery Status or AC
    PowerMgr->>PowerMgr: Set gCurPowerState
    Note over PowerMgr: State: LoadingDefaults → RegisteringEvents
    
    PowerMgr->>Sysevent: Publish Initial rdkb-power-state
    PowerMgr->>Thread: pthread_create Sysevent Handler
    Thread->>Sysevent: sysevent_setnotification rdkb-power-transition
    Sysevent-->>Thread: async_id registered
    Note over PowerMgr: State: RegisteringEvents → Active
    
    PowerMgr->>System: Initialization Complete
    Note over Thread: State: Active<br/>Event monitoring loop
    
    loop Power State Monitoring
        Thread->>Sysevent: sysevent_getnotification
        Sysevent-->>Thread: Power Transition Event
        Thread->>Thread: Process Transition
    end
    
    System->>PowerMgr: Stop Signal
    PowerMgr->>Thread: pthread_join
    Thread-->>PowerMgr: Thread Terminated
    Note over PowerMgr: State: Active → Shutdown
    PowerMgr->>System: Process Exit
```

**Runtime State Changes and Context Switching**

During active operation Power Manager responds to power transition events triggering state validation and component lifecycle management operations.

**State Change Triggers:**

- `rdkb-power-transition` sysevent set to `POWER_TRANS_AC` initiates transition to AC power mode with component startup
- `rdkb-power-transition` sysevent set to `POWER_TRANS_BATTERY` initiates transition to battery mode with non-essential component shutdown on battery-capable platforms
- `rdkb-power-transition` sysevent set to `POWER_TRANS_HOT` initiates transition to thermal hot state with protective component shutdown
- `rdkb-power-transition` sysevent set to `POWER_TRANS_COOLED` initiates transition from thermal hot to cooled state with component restart
- Sysevent daemon restart detection triggers connection re-establishment after 600 second delay

**Context Switching Scenarios:**

- Battery to AC transition switches from low-power component-limited mode to full operational mode with all services running
- AC to Battery transition switches from full operational mode to low-power mode preserving only critical services for remote management and voice
- Thermal hot transition switches from normal operation to protective mode shutting down high-activity components to reduce heat generation
- Thermal cooled transition restores normal operational context after thermal conditions normalize

### Call Flow

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant Main as Main Process
    participant Init as PwrMgr_Init
    participant Reg as PwrMgr_Register_sysevent
    participant Def as PwrMgr_SetDefaults
    participant HAL as MTA HAL

    Main->>Main: Daemonize Process
    Main->>Main: checkIfAlreadyRunning
    Main->>Init: PwrMgr_Init
    Init->>Reg: PwrMgr_Register_sysevent
    Reg->>Reg: sysevent_open rdkb_power_manger
    Reg->>Reg: sysevent_open rdkb_power_manger-gs
    Reg->>Def: PwrMgr_SetDefaults
    Def->>HAL: mta_hal_BatteryGetPowerStatus
    HAL-->>Def: Battery Status AC or Battery
    Def->>Def: Set gCurPowerState
    Def->>Def: sleep 5 seconds
    Def->>Def: PwrMgr_SyseventSetStr rdkb-power-state
    Def-->>Reg: Initialization Complete
    Reg-->>Init: Registration Complete
    Init->>Init: pthread_create PwrMgr_sysevent_handler
    Init-->>Main: Initialization Complete
```

**Power Transition Processing Call Flow:**

```mermaid
sequenceDiagram
    participant Event as External Event Source
    participant Thread as Sysevent Handler Thread
    participant Trans as PwrMgr_StateTransition
    participant Script as Shell Script Executor
    participant Systemd as Systemd Services

    Event->>Thread: Power Transition Event
    Thread->>Thread: sysevent_getnotification
    Thread->>Thread: Parse Event Name and Value
    Thread->>Trans: PwrMgr_StateTransition Value
    Trans->>Trans: Convert String to Power State Enum
    Trans->>Trans: Validate Current vs New State
    
    alt Valid Transition
        Trans->>Script: v_secure_system rdkb_power_manager.sh
        Script->>Systemd: systemctl stop/start Services
        Systemd-->>Script: Services Stopped/Started
        Script-->>Trans: Exit Code 0 Success
        Trans->>Trans: Update gCurPowerState
        Trans->>Trans: PwrMgr_SyseventSetStr rdkb-power-state
    else Invalid or Same State
        Trans->>Trans: Log Warning and Ignore
    end
    
    Trans-->>Thread: Transition Result
    Thread->>Thread: Continue Event Loop
```

## Internal Modules

Power Manager consists of a single monolithic process with functional separation through internal functions rather than separate module files.

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| **Main Process** | Process entry point handling daemonization, PID file management, initialization orchestration, and breakpad crash handler setup | `pwrMgr.c` main function |
| **Initialization Handler** | Component initialization logic including sysevent registration, default state setup, and thread creation | `pwrMgr.c` PwrMgr_Init, PwrMgr_Register_sysevent, PwrMgr_SetDefaults |
| **Sysevent Handler Thread** | Asynchronous event monitoring loop receiving and dispatching power transition notifications | `pwrMgr.c` PwrMgr_sysevent_handler |
| **State Transition Engine** | Power state validation and transition execution including script invocation and state publication | `pwrMgr.c` PwrMgr_StateTranstion |
| **Configuration Module** | Power state definitions and transition string mappings | `pwrMgr.h` PWRMGR_PwrState, PWRMGR_PwrStateItem |

## Component Interactions

Power Manager maintains focused interactions with system services for event monitoring and component lifecycle management.

### Interaction Matrix

| Target Component/Layer | Interaction Purpose | Key APIs/Endpoints |
|------------------------|-------------------|------------------|
| **System Services** |
| Sysevent Daemon | Power state event monitoring and current state publication | `sysevent_open()`, `sysevent_setnotification()`, `sysevent_getnotification()`, `sysevent_set()` for rdkb-power-transition and rdkb-power-state |
| Systemd Services | Orderly component shutdown and startup during power transitions | `systemctl stop/start` via shell script for CcspMoca.service, ccspwifiagent.service, onewifi.service, CcspLMLite.service, harvester.service |
| **HAL Layer** |
| MTA HAL | Battery power status query on initialization for battery-capable platforms | `mta_hal_BatteryGetPowerStatus()` |

**Events Published by Power Manager:**

| Event Name | Event Topic/Path | Trigger Condition | Subscriber Components |
|------------|-----------------|-------------------|---------------------|
| Power State Update | `rdkb-power-state` sysevent | Successful power state transition completion | All RDKB components monitoring power state for operational adjustments |

**Events Subscribed by Power Manager:**

| Event Name | Event Topic/Path | Action Taken |
|------------|-----------------|--------------|
| Power Transition Request | `rdkb-power-transition` sysevent | Validate and execute power state transition invoking management script |

### IPC Flow Patterns

**Primary IPC Flow - Power State Transition:**

```mermaid
sequenceDiagram
    participant External as External Event Source
    participant Sysevent as Sysevent Daemon
    participant PowerMgr as Power Manager
    participant Script as rdkb_power_manager.sh
    participant Systemd as Systemd

    External->>Sysevent: sysevent set rdkb-power-transition Value
    Note over Sysevent: Event: rdkb-power-transition<br/>Value: POWER_TRANS_*
    Sysevent->>PowerMgr: Notification Callback
    Note over PowerMgr: Validate transition request
    PowerMgr->>Script: v_secure_system Execute
    Script->>Systemd: systemctl stop/start Commands
    Systemd-->>Script: Service State Changed
    Script-->>PowerMgr: Exit Status 0 or 1
    
    alt Success
        PowerMgr->>PowerMgr: Update gCurPowerState
        PowerMgr->>Sysevent: sysevent_set rdkb-power-state
        Note over Sysevent: Published State Available
    else Failure
        PowerMgr->>PowerMgr: Log Error Keep Current State
    end
```

**Event Notification Flow:**

```mermaid
sequenceDiagram
    participant Sysevent as Sysevent Daemon
    participant PowerMgr as Power Manager Sysevent Thread
    participant Components as Listening Components

    loop Active Monitoring
        PowerMgr->>Sysevent: sysevent_getnotification
        Note over PowerMgr: Blocking call waiting for events
        Sysevent-->>PowerMgr: Event Name and Value
        PowerMgr->>PowerMgr: Process rdkb-power-transition
        PowerMgr->>PowerMgr: Execute State Transition
        PowerMgr->>Sysevent: sysevent_set rdkb-power-state
    end
    
    Note over Sysevent: State change published
    Sysevent->>Components: Notify subscribed components
    Components->>Components: Adjust behavior based on power state
```

## Implementation Details

### Major HAL APIs Integration

Power Manager integrates with MTA HAL on battery-capable platforms to query initial battery power status during component initialization.

**Core HAL APIs:**

| HAL API | Purpose | Implementation File |
|---------|---------|-------------------|
| `mta_hal_BatteryGetPowerStatus()` | Query current battery power status returning AC Battery or Unknown for initial state determination | `pwrMgr.c` PwrMgr_SetDefaults function |

### Key Implementation Logic

- **State Machine Engine**: Maintains current power state in `gCurPowerState` global variable with predefined state definitions in `powerStateArr` array mapping enum values to transition strings and state strings

  - State transition validation in `pwrMgr.c` PwrMgr_StateTranstion function comparing requested state against current state
  - State transition handlers in `pwrMgr.c` PwrMgr_StateTranstion switch statement executing platform-specific transitions

- **Event Processing**: Sysevent notification handling in dedicated thread continuously monitoring rdkb-power-transition events

  - Asynchronous event retrieval using `sysevent_getnotification()` in blocking mode within infinite loop
  - Event name matching and value extraction dispatching to PwrMgr_StateTranstion function
  - Sysevent daemon availability monitoring with 600 second retry delay on connection failure

- **Error Handling Strategy**: Validates power state transitions preventing invalid or duplicate state change requests

  - Duplicate state transition requests logged with warning and ignored without script execution
  - Script execution failure detection through `v_secure_system()` return code checking
  - Sysevent connection failure retry logic with maximum 6 attempts and automatic syseventd restart
  - Thread creation failure detection with error logging and initialization abort

- **Logging & Debugging**: RDK logger integration for standardized log message formatting when `FEATURE_SUPPORT_RDKLOG` enabled

  - Debug logging with function name and line number inclusion using `PWRMGRLOG` macro
  - Log severity levels INFO WARNING ERROR mapped to CcspTrace functions
  - Component name LOG.RDK.PWRMGR for log message identification and filtering
  - Thread naming using pthread_setname_np for process monitoring and debugging

### Key Configuration Files

| Configuration File | Purpose | Override Mechanisms |
|--------------------|---------|--------------------|
| `/tmp/.rdkbPowerMgr.pid` | Process ID file preventing duplicate daemon instances | N/A system managed |
| `/etc/device.properties` | Platform configuration properties used by management script | Platform build configuration |
| `/etc/debug.ini` | RDK logger initialization configuration | Manual configuration file edit |
| `/usr/ccsp/pwrMgr/rdkb_power_manager.sh` | Component lifecycle management script | Platform-specific customization |
