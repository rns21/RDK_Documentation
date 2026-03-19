# Cellular Modem Manager

Cellular Modem Manager, also known as **RdkCellularManager-MM**, is the RDK-B component responsible for managing cellular modem interfaces, maintaining network connectivity through cellular WAN links, and providing standardized TR-181 data model access to cellular hardware capabilities. This component serves as the management and control interface between RDK-B middleware and vendor-specific cellular modem hardware through HAL (Hardware Abstraction Layer) APIs.

Cellular Modem Manager monitors and controls cellular modem initialization, SIM card management, network registration, profile configuration, and packet data network connectivity. The component implements the `Device.Cellular` TR-181 data model namespace enabling standardized access to cellular-specific parameters including interface status, signal quality, network registration state, and connection statistics. The component supports multiple cellular modem backends through conditional compilation: QMI (Qualcomm MSM Interface) direct access, ModemManager daemon integration (the primary default path using `libmm-glib` and `libmbim`), and a hybrid dynamic-detection mode that auto-selects between RNDIS and ModemManager-based control at runtime.

The component integrates with RDK-B message bus infrastructure through R-BUS for real-time event notifications and parameter synchronization. Cellular Modem Manager maintains the cellular WAN interface lifecycle through an internal state machine that responds to modem events, manages network attachment sequences, and coordinates IP address configuration with the system networking stack.

```mermaid
graph LR
    subgraph "External Systems"
        RemoteMgmt["Remote Management"]
        LocalUI["Local Web UI"]
    end

    subgraph "RDK-B Platform"
        subgraph "Remote Management Agents"
            ProtocolAgents["Protocol Agents TR-069, WebPA, USP"]
        end

        PNM["CCSP P&M"]
        PSM["CCSP PSM"]
        CellMgr["Cellular Modem Manager"]

        subgraph "Platform Layer"
            MM["ModemManager Daemon"]
            HAL["cellular_hal"]
            Linux["Linux Kernel & Drivers"]
        end
    end

    RemoteMgmt -->|TR-069/WebPA/TR-369| ProtocolAgents
    LocalUI -->|HTTP/HTTPS| ProtocolAgents

    ProtocolAgents -->|R-BUS| CellMgr

    CellMgr -->|R-BUS| PNM
    CellMgr -->|R-BUS| PSM

    CellMgr <-->|HAL APIs| HAL
    HAL <-->|libmm-glib D-Bus| MM
    HAL <-->|libqmi-glib QMI| Linux

    MM <-->|libmbim MBIM protocol| Linux
    MM <-->|libqmi-glib QMI protocol| Linux
    CellMgr <-->|sysevent/syscfg| Linux

    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef cellmgr fill:#e3f2fd,stroke:#1976d2,stroke-width:3px;
    classDef rdkbComponent fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px;
    classDef system fill:#fce4ec,stroke:#c2185b,stroke-width:2px;
    classDef daemon fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    class RemoteMgmt,LocalUI external;
    class CellMgr cellmgr;
    class ProtocolAgents,PNM,PSM rdkbComponent;
    class HAL,Linux system;
    class MM daemon;
```

**Key Features & Responsibilities**:

- **Cellular Modem Lifecycle Management**: Controls modem device detection, initialization, firmware activation, and operational state transitions with support for multiple modem protocols including QMI direct access, ModemManager (`libmm-glib`/`libmbim`), and hybrid dynamic-detection backends
- **Network Registration and Attachment**: Manages cellular network registration including operator selection, roaming control, radio access technology selection, and NAS (Non-Access Stratum) registration state monitoring
- **SIM Card and Profile Management**: Provides SIM card detection, ICCID reading, PIN management, UICC slot selection, and cellular profile configuration including APN settings and authentication parameters
- **Packet Data Network Connectivity**: Establishes and maintains packet data connections supporting IPv4 and IPv6 address families with automatic IP configuration through DHCP client integration
- **Signal Quality and Network Metrics**: Monitors radio signal strength, serving cell information, neighbor cell data, network registration status, and connection statistics for performance analysis
- **TR-181 Data Model Implementation**: Implements comprehensive `Device.Cellular` object hierarchy following BBF TR-181 specifications for standardized access to cellular interface parameters
- **State Machine Control**: Executes policy-driven state machine managing cellular interface lifecycle from modem detection through network registration to active data connection establishment
- **Event-Driven Notifications**: Publishes R-BUS events for cellular interface status changes, registration state transitions, and connection state updates enabling real-time monitoring by dependent components

## Design

Cellular Modem Manager follows a layered architecture separating TR-181 data model implementation, state machine control logic, and hardware abstraction through well-defined interfaces. The design emphasizes asynchronous event-driven operation with non-blocking HAL communication to maintain responsiveness during modem initialization and network attachment sequences. The component maintains centralized data structures holding current cellular interface state synchronized through periodic polling and event callbacks from the vendor HAL layer.

The TR-181 middle layer implements `Device.Cellular` object hierarchy functions for parameter get/set operations, table synchronization, validation, commit, and rollback operations following CCSP data model agent conventions. The state machine controller orchestrates modem initialization, network registration, profile configuration, and packet data connection establishment providing separation between data model interface and connection management logic. The policy control state machine monitors modem detection status, device open state, SIM status, network registration, and IP configuration to autonomously manage interface enable/disable operations based on configuration and network conditions.

The northbound interface exposes TR-181 parameters through R-BUS messaging for integration with CcspPandM and other RDK-B components supporting both synchronous get/set operations and asynchronous event subscriptions. The southbound interface abstracts vendor-specific cellular modem control through the HAL layer (`cellular_hal.c`) supporting three distinct protocol backends selected at compile time: QMI direct access (`QMI_SUPPORT`), ModemManager daemon integration (`MM_SUPPORT`, default), and a dynamic hybrid mode (`HYBRID_SUPPORT`) capable of switching HAL implementations at runtime based on detected USB device drivers. Configuration persistence is achieved through PSM for storing runtime configuration changes and syscfg for system-level settings. Network configuration is propagated to the system through sysevent mechanisms enabling coordination with DHCP clients and routing daemons.

```mermaid
graph TD
    subgraph CellularManager ["Cellular Modem Manager"]
        subgraph MainManager ["Cellular Controller"]
            CellMgr["Cellular Manager APIs"]
            StateMachine["State Machine"]
        end

        subgraph DataModel ["Data Models"]
            MgmtDML["DML Management"]
        end

        subgraph HALModule ["HAL Abstraction - cellular_hal.c"]
            HALCore["HAL Dispatch Layer"]
        end

    end

    subgraph ExternalSystems ["External Systems"]
        rdkbComponents["Other RDK-B Components"]
        PSM["CCSP PSM"]
    end

    subgraph BackendLayer ["HAL Backends - compile-time selection"]
        QMIBackend["QMI_SUPPORT\ncellular_hal_qmi_apis.c\nlibqmi-glib"]
        MMBackend["MM_SUPPORT default\ncellular_hal_mm_apis.c\nlibmm-glib"]
        HYBRIDBackend["HYBRID_SUPPORT\ncellular_hal_device_manager.c\nlibusb + libudev"]
    end

    subgraph ModemLayer ["Modem Control Layer"]
        MMDaemon["ModemManager Daemon\nD-Bus Interface"]
        Drivers["Linux Kernel Drivers\ncdc_mbim, qmi_wwan, rndis_host"]
    end

    CellMgr --> DataModel
    DataModel <--> rdkbComponents
    PSM --> CellMgr
    CellMgr --> StateMachine
    StateMachine --> HALCore

    HALCore --> QMIBackend
    HALCore --> MMBackend
    HALCore --> HYBRIDBackend

    QMIBackend -->|direct QMI| Drivers
    MMBackend -->|libmm-glib D-Bus| MMDaemon
    HYBRIDBackend -->|runtime-selected| MMDaemon
    HYBRIDBackend -->|runtime-selected| Drivers
    MMDaemon -->|libmbim MBIM\nlibqmi QMI| Drivers
```

### HAL Backend Design Variants

Cellular Modem Manager supports three distinct HAL backend modes selected at compile time via build flags. The selection determines which protocol stack, libraries, and device communication paths are used. The `cellular_hal.c` dispatch layer uses `#ifdef` chains to route all HAL API calls to the active backend.

```mermaid
graph LR
    subgraph "QMI_SUPPORT mode"
        Q1["cellular_hal_qmi_apis.c"] --> Q2["libqmi-glib"]
        Q2 --> Q3["/dev/cdc-wdm0\nQMI Device Node"]
        Q3 --> Q4["Cellular Modem"]
    end

    subgraph "MM_SUPPORT mode (default)"
        M1["cellular_hal_mm_apis.c"] -->|libmm-glib| M2["ModemManager Daemon\n(D-Bus)"]
        M2 -->|libmbim| M3["MBIM Modem\ncdc_mbim driver"]
        M2 -->|libqmi| M4["QMI Modem\nqmi_wwan driver"]
        M2 -->|AT commands| M5["wwan0 interface"]
    end

    subgraph "HYBRID_SUPPORT mode"
        H1["cellular_hal_device_manager.c"]
        H1 -->|libusb hotplug| H2["USB Device Detection"]
        H1 -->|libudev monitor| H3["Driver-Type Detection"]
        H3 -->|cdc_ncm / qmi_wwan\ncdc_mbim driver| H4["FEATURE_MODEM_HAL\ncellular_hal_modem_apis.c\nlibmm-glib → ModemManager"]
        H3 -->|rndis_host / cdc_ether\nipheth driver| H5["FEATURE_RNDIS_HAL\ncellular_hal_rndis_apis.c\nRNDIS Interface"]
    end
```

#### QMI_SUPPORT

The `QMI_SUPPORT` mode provides direct QMI protocol access without requiring a ModemManager daemon. It is a legacy/platform-specific path targeting modems that expose a `/dev/cdc-wdm0` QMI device node.

| Attribute            | Detail                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| **Compile flag**     | `-DQMI_SUPPORT`                                                           |
| **Source file**      | `cellular_hal_qmi_apis.c`                                                 |
| **Library**          | `libqmi-glib`                                                             |
| **Device interface** | `/dev/cdc-wdm0`                                                           |
| **Modem detection**  | Checks existence of `cdc-wdm0` device file                                |
| **Use case**         | Platforms with a fixed QMI-capable modem, no ModemManager daemon required |
| **Limitations**      | Does not support MBIM modems; no hot-plug capability in this mode         |

Key initialization: `cellular_hal_qmi_init()` opens the QMI device, registers WDS (Wireless Data Service), NAS (Network Access Service), and UIM (Universal IC Card) service clients.

#### MM_SUPPORT (Default)

The `MM_SUPPORT` mode is the **default build configuration** when `HYBRID_SUPPORT` is not enabled. It delegates all modem control to the **ModemManager** system daemon, accessed via D-Bus using the `libmm-glib` client library. ModemManager internally manages protocol selection (MBIM via `libmbim`, QMI via `libqmi-glib`, or AT commands) based on the modem's capabilities.

| Attribute            | Detail                                                                            |
| -------------------- | --------------------------------------------------------------------------------- |
| **Compile flag**     | `-DMM_SUPPORT` (set by default in `Makefile.am` else branch)                      |
| **Source file**      | `cellular_hal_mm_apis.c`                                                          |
| **Library**          | `libmm-glib` (ModemManager GLib client)                                           |
| **External daemon**  | ModemManager (`org.freedesktop.ModemManager1` D-Bus service)                      |
| **Protocol support** | MBIM (`libmbim`), QMI (`libqmi-glib`), AT commands — selected by ModemManager     |
| **WAN interface**    | `wwan0`                                                                           |
| **Modem detection**  | `cellular_hal_mm_is_modem_ready(NULL)` — queries ModemManager via D-Bus           |
| **Use case**         | Platforms with a fixed or SoC-integrated modem managed by the ModemManager daemon |

Key initialization: `cellular_hal_mm_main_loop_init()` establishes a GLib main loop, connects to the system D-Bus, and registers an `MMManager` object to enumerate and monitor modems. State change signals from ModemManager are forwarded to the Cellular Modem Manager state machine via callbacks.

**ModemManager / libmbim integration**: Cellular Modem Manager communicates with ModemManager exclusively through `libmm-glib`. ModemManager then selects `libmbim` for MBIM-capable modems (e.g., those using the `cdc_mbim` kernel driver) and `libqmi-glib` for QMI-capable modems (`qmi_wwan` kernel driver). This abstraction means Cellular Modem Manager is insulated from the underlying protocol used by the modem hardware.

#### HYBRID_SUPPORT

The `HYBRID_SUPPORT` mode is designed for platforms where cellular modems are connected via USB and may vary in type — either RNDIS/CDC-Ethernet dongles or full modem devices managed by ModemManager. The Device Manager layer dynamically detects the attached USB device and loads the appropriate HAL implementation at runtime.

| Attribute        | Detail                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Compile flag** | `-DHYBRID_SUPPORT` (Yocto DISTRO feature `HYBRID_SUPPORT`)                                                                     |
| **Source files** | `cellular_hal_device_manager.c`, `cellular_hal_device_abstraction.c`, `cellular_hal_rndis_apis.c`, `cellular_hal_modem_apis.c` |
| **Libraries**    | `libusb` (hotplug), `libudev` (driver detection), `libmm-glib` (modem path)                                                    |
| **Sub-features** | `FEATURE_MODEM_HAL` (ModemManager-based path), `FEATURE_RNDIS_HAL` (RNDIS path)                                                |
| **Use case**     | Platforms with USB cellular dongles that may appear as different device classes                                                |

The HYBRID backend uses a virtual function table (`DEVICE_HAL_ABSTRATCOR_` struct of function pointers) to swap between `modem_device_hal` and `rndis_device_hal` at runtime without recompiling. A pthread mutex (`g_halAccessSerializer`) serializes HAL calls against HAL-swap operations during hot-plug events.

**Supported USB dongle table** (`SupportedUSBDeviceTable`): The device manager maintains a table of known USB dongles that require mode-switching (`usb_modeswitch`) before they present as a modem interface:

| Dongle           | VID    | PID    | Mode Switch Action |
| ---------------- | ------ | ------ | ------------------ |
| Huawei E353      | 0x12d1 | 0x1f01 | Switch to 0x14db   |
| Alcatel IK40V    | 0x1bbb | 0xf000 | Switch to 0x0195   |
| Huawei E3372-607 | 0x12d1 | 0x14fe | Switch to 0x14db   |

### Auto-Detection Mechanism (HYBRID_SUPPORT)

The HYBRID_SUPPORT mode implements an event-driven auto-detection pipeline using two concurrent monitoring threads and the libusb API:

```mermaid
sequenceDiagram
    participant libusb as libusb Hotplug Thread
    participant udev as libudev Monitor Thread
    participant DevMgr as Device Manager
    participant HAL as Active HAL

    Note over libusb,udev: Both threads start on cellular_hal_device_init()

    libusb->>DevMgr: USB device attached event (VID/PID)
    DevMgr->>DevMgr: configure_usb_dongle(VID, PID)
    Note over DevMgr: usb_modeswitch if dongle needs mode switch

    udev->>DevMgr: Network interface added (ID_USB_DRIVER)

    alt Driver is rndis_host / cdc_ether / ipheth
        DevMgr->>HAL: Load rndis_device_hal vtable
        DevMgr->>HAL: hal_init() + hal_set_device_props(interface)
        Note over HAL: FEATURE_RNDIS_HAL active
    else Driver is cdc_ncm / qmi_wwan / cdc_mbim / huawei_cdc_ncm
        DevMgr->>HAL: Load modem_device_hal vtable
        DevMgr->>HAL: hal_init() → ModemManager via libmm-glib
        Note over HAL: FEATURE_MODEM_HAL active
    end

    DevMgr->>DevMgr: g_device_status = USB_DEVICE_ATTACHED
    DevMgr->>DevMgr: g_modem_device_type = MODEM_USBRNDIS or MODEM_USBMODEM

    Note over libusb,udev: On USB removal

    udev->>DevMgr: Network interface removed event
    DevMgr->>HAL: hal_set_device_props("", 0)
    DevMgr->>HAL: Clear HAL vtable (memset to 0)
    Note over DevMgr: For modem path: systemctl restart ModemManager
    DevMgr->>DevMgr: g_device_status = USB_DEVICE_REMOVED
```

**Detection Logic:**

The `udev_eventhandler_thread` monitors the `net` subsystem for interface add/remove events and reads the `ID_USB_DRIVER` udev property to determine the device class:

| Detected Kernel Driver                              | Device Classification            | HAL Selected                                                     |
| --------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| `rndis_host`, `cdc_ether`, `ipheth`                 | RNDIS / CDC-Ether dongle         | `FEATURE_RNDIS_HAL` → `cellular_hal_rndis_apis.c`                |
| `cdc_ncm`, `huawei_cdc_ncm`, `qmi_wwan`, `cdc_mbim` | USB Modem (ModemManager-managed) | `FEATURE_MODEM_HAL` → `cellular_hal_modem_apis.c` → ModemManager |

**Modem Device Types** (`MODEM_DEVICETYPE` enum):

| Value            | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `MODEM_SOC`      | SoC-integrated modem (not USB, fixed connection)             |
| `MODEM_USBMODEM` | USB modem device controlled through ModemManager             |
| `MODEM_USBRNDIS` | USB RNDIS/CDC-Ether dongle presenting as a network interface |
| `MODEM_UNKNOWN`  | Default state; no device detected or device removed          |

**Initialization sequence** (`cellular_hal_device_init`):

1. Initialize `libusb` context and register a generic hotplug callback for all USB attach/detach events
2. Start `usb_eventhandler_thread` to process libusb events
3. Start `udev_eventhandler_thread` to monitor network interface driver changes
4. Call `usb_helper_dev_reset()` to enumerate all connected USB devices and reset CDC-class devices — this ensures any pre-attached device is detected cleanly by the udev listener

### Prerequisites and Dependencies

**Build-Time Flags and Configuration:**

| Configure Option     | DISTRO Feature                  | Build Flag               | Purpose                                                                                                 | Default                                                |
| -------------------- | ------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `--enable-gtestapp`  | N/A                             | `GTEST_ENABLE`           | Enable Google Test framework support for unit testing                                                   | Disabled                                               |
| `--enable-notify`    | N/A                             | `ENABLE_SD_NOTIFY`       | Enable systemd service notification support for service readiness signaling                             | Disabled                                               |
| `--enable-dropearly` | N/A                             | `DROP_ROOT_EARLY`        | Enable dropping root privileges early in initialization for security                                    | Disabled                                               |
| N/A                  | `HYBRID_SUPPORT` (Yocto DISTRO) | `HYBRID_SUPPORT`         | Enable hybrid USB device manager with runtime auto-detection of RNDIS vs ModemManager-controlled modems | Conditional                                            |
| N/A                  | N/A                             | `MM_SUPPORT`             | Enable ModemManager daemon integration (`libmm-glib`/`libmbim`) as primary modem control path           | **Default** (set when `HYBRID_SUPPORT` is not enabled) |
| N/A                  | N/A                             | `QMI_SUPPORT`            | Enable direct QMI protocol access bypassing ModemManager (legacy/platform-specific)                     | Conditional                                            |
| N/A                  | N/A                             | `FEATURE_MODEM_HAL`      | Within `HYBRID_SUPPORT`: enable the ModemManager-based USB modem HAL path                               | Conditional                                            |
| N/A                  | N/A                             | `FEATURE_RNDIS_HAL`      | Within `HYBRID_SUPPORT`: enable the RNDIS/CDC-Ether USB dongle HAL path                                 | Conditional                                            |
| N/A                  | N/A                             | `RBUS_BUILD_FLAG_ENABLE` | Enable RBus messaging infrastructure for inter-component communication                                  | Platform Dependent                                     |
| N/A                  | N/A                             | `FEATURE_SUPPORT_RDKLOG` | Enable RDK logging framework integration for centralized log management                                 | Platform Dependent                                     |

<br>

**RDK-B Platform and Integration Requirements:**

- **RDK-B Components**: `CcspPandM`, `CcspPsm`, `WebPA`, `CcspCommonLibrary`
- **HAL Dependencies**: Cellular HAL APIs with backend selected by build flag: `libqmi-glib` (QMI_SUPPORT), `libmm-glib` + ModemManager daemon (MM_SUPPORT / HYBRID modem path), `libusb` + `libudev` (HYBRID_SUPPORT)
- **ModemManager**: Required for `MM_SUPPORT` (default) and `HYBRID_SUPPORT` with `FEATURE_MODEM_HAL`; provides `libmm-glib` client library and `org.freedesktop.ModemManager1` D-Bus service
- **Systemd Services**: `CcspCrSsp.service`, `CcspPsmSsp.service` must be active before `RdkCellularManager.service` starts
- **Message Bus**: R-BUS registration under cellular namespace for event publishing and parameter access
- **TR-181 Data Model**: `Device.Cellular` object hierarchy implementation for interface management and statistics
- **Configuration Files**: `RdkCellularManager.xml` for TR-181 parameter definitions located in component configuration directory
- **System Libraries**: `libnanomsg`, `libsysevent`, `libsyscfg`, `libwebconfig_framework`, `libsecure_wrapper`, `libmsgpackc`, `libcurl`, `libtrower-base64`
- **Startup Order**: Initialize after network interfaces are available, PSM services are running, and message bus infrastructure is established

<br>

**Threading Model:**

Cellular Modem Manager implements a multi-threaded architecture designed to handle concurrent modem operations, state machine execution, and external communications without blocking critical operations.

- **Threading Architecture**: Multi-threaded with main event loop and specialized worker threads for state machine execution
- **Main Thread**: Handles TR-181 parameter requests, R-BUS message processing, component lifecycle management, and message bus interface operations
- **Main worker Threads**:
  - **State Machine Thread**: Executes cellular policy control state machine with 500ms loop interval managing modem lifecycle transitions, network registration sequences, and connection establishment
  - **HAL Event Threads**: Process asynchronous callbacks from cellular HAL layer for modem events, registration status updates, and packet service notifications
  - **USB Event Handler Thread** _(HYBRID_SUPPORT only)_: Monitors `libusb` events for USB device hot-plug and detach notifications
  - **UDEV Event Handler Thread** _(HYBRID_SUPPORT only)_: Monitors `libudev` network subsystem events to detect USB driver type and trigger HAL selection
- **Synchronization**: Uses pthread mutex locks for shared data structure protection, thread-safe HAL API invocations, and state machine state transitions. In HYBRID_SUPPORT mode, `g_halAccessSerializer` mutex additionally serializes HAL vtable updates against concurrent HAL API calls during hot-plug events

### Component State Flow

**Initialization to Active State**

Cellular Modem Manager follows a structured initialization sequence ensuring all dependencies are properly established before entering active cellular management mode. The component performs configuration loading, TR-181 parameter registration, HAL initialization, and state machine startup in a predetermined order to guarantee system stability and modem connectivity.

```mermaid
sequenceDiagram
    autonumber
    participant System as System Startup
    participant Component as Cellular Modem Manager
    participant Config as Configuration PSM
    participant HAL as Cellular HAL
    participant StateMachine as State Machine

    System->>Component: Start RdkCellularManager Service
    Note over Component: State: Initializing

    Component->>Config: Load Configuration from PSM
    Config-->>Component: Configuration Loaded
    Note over Component: State: LoadingConfig → RegisteringDataModel

    Component->>System: Register TR-181 Data Models
    System-->>Component: Registration Complete (R-BUS)
    Note over Component: State: RegisteringDataModel → InitializingHAL

    Component->>HAL: Initialize Cellular HAL
    Note over HAL: QMI_SUPPORT: open /dev/cdc-wdm0\nMM_SUPPORT: connect ModemManager D-Bus\nHYBRID: start libusb + libudev threads
    HAL-->>Component: HAL Initialization Complete
    Note over Component: State: InitializingHAL → StartingStateMachine

    Component->>StateMachine: Start State Machine Thread
    StateMachine-->>Component: State Machine Running
    Note over Component: State: StartingStateMachine → Active

    Note over Component,StateMachine: Component Active and Managing Cellular Interface

    System->>Component: Stop Signal
    Component->>StateMachine: Stop State Machine
    Component->>HAL: Deinitialize HAL
    Component->>System: Component Stopped
```

**Runtime State Changes and Context Switching**

During normal operation, Cellular Modem Manager responds to various modem events, network conditions, and configuration changes that affect cellular interface operational state and connectivity behavior.

**State Change Triggers:**

- Modem device detection/removal events causing reinitialization of HAL and state machine reset
- SIM card insertion/removal events triggering SIM status validation and profile reconfiguration
- Network registration state changes requiring connection establishment or teardown based on registration success
- Configuration parameter changes affecting profile selection, APN settings, or roaming policies requiring connection restart
- Packet service status changes indicating data connection activation or deactivation requiring IP configuration updates

**Context Switching Scenarios:**

- State machine transitions between DOWN, DEACTIVATED, DEREGISTERED, REGISTERING, REGISTERED, and CONNECTED states based on modem and network conditions
- Protocol switching between QMI, ModemManager, or hybrid backends based on detected modem capabilities during initialization
- IP address family context switches between IPv4-only, IPv6-only, or dual-stack operation based on profile configuration and network support

### Call Flow

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant Init as Initialization Process
    participant SSP as SSP Main
    participant MsgBus as Message Bus Interface
    participant HAL as Cellular HAL
    participant SM as State Machine

    Init->>SSP: component_start()
    SSP->>MsgBus: Initialize Message Bus
    MsgBus-->>SSP: Bus Initialized
    SSP->>HAL: cellular_hal_init()
    HAL-->>SSP: HAL Initialized
    SSP->>SM: Start State Machine Thread
    SM-->>SSP: Thread Started
    SSP-->>Init: Initialization Complete (Active State)
```

**Request Processing Call Flow:**

```mermaid
sequenceDiagram
    participant Client as External Client
    participant RBus as R-BUS Interface
    participant DML as DML Layer
    participant CellAPI as Cellular APIs
    participant HAL as Cellular HAL

    Client->>RBus: R-BUS Get (Device.Cellular.Interface.1.Status)
    RBus->>DML: Cellular_Interface_GetParamStringValue()
    DML->>CellAPI: CellularMgr_GetInterfaceStatus()
    CellAPI->>HAL: cellular_hal_get_device_info()
    HAL-->>CellAPI: Device Status
    CellAPI-->>DML: Interface Status
    DML-->>RBus: Status String
    RBus-->>Client: Response (Status Value)
```

## TR‑181 Data Models

### Supported TR-181 Parameters

Cellular Modem Manager implements comprehensive TR-181 data model support for cellular interface management following BBF TR-181 specifications for `Device.Cellular` object hierarchy. The component provides both standard BBF-defined parameters and vendor-specific extensions to support advanced RDK-B cellular connectivity features.

### Object Hierarchy

```
Device.
└── Cellular.
    ├── RoamingEnabled (boolean, R/W)
    ├── RoamingStatus (string, R)
    ├── InterfaceNumberOfEntries (unsignedInt, R)
    ├── AccessPointNumberOfEntries (unsignedInt, R)
    └── Interface.{i}.
        ├── Enable (boolean, R/W)
        ├── Status (string, R)
        ├── Alias (string, R/W)
        ├── Name (string, R)
        ├── LastChange (unsignedInt, R)
        ├── LowerLayers (string, R/W)
        ├── Upstream (boolean, R)
        ├── IMEI (string, R)
        ├── SupportedAccessTechnologies (string, R)
        ├── PreferredAccessTechnology (string, R/W)
        ├── CurrentAccessTechnology (string, R)
        ├── NetworkInUse (string, R)
        ├── RSSI (int, R)
        ├── RSRP (int, R)
        ├── RSRQ (int, R)
        ├── SNR (int, R)
        ├── X_RDK_Status (string, R)
        ├── X_RDK_LinkAvailability (string, R)
        ├── USIM.
        │   ├── Status (string, R)
        │   ├── IMSI (string, R)
        │   ├── ICCID (string, R)
        │   ├── MSISDN (string, R)
        │   └── PINCheck (string, R/W)
        ├── AccessPoint.{i}.
        │   ├── Enable (boolean, R/W)
        │   ├── Alias (string, R/W)
        │   ├── APN (string, R/W)
        │   ├── Username (string, R/W)
        │   ├── Password (string, R/W)
        │   ├── X_RDK_ApnAuthentication (string, R/W)
        │   ├── X_RDK_IpAddressFamily (string, R/W)
        │   └── X_RDK_Roaming (boolean, R/W)
        └── X_RDK_Statistics.
            ├── BytesSent (unsignedLong, R)
            ├── BytesReceived (unsignedLong, R)
            ├── PacketsSent (unsignedLong, R)
            ├── PacketsReceived (unsignedLong, R)
            └── PacketsDropped (unsignedLong, R)
```

## Internal Modules

Cellular Modem Manager is organized into specialized modules responsible for different aspects of cellular modem management, data model implementation, state machine control, and HAL abstraction. Each module encapsulates specific functionality while maintaining clear interfaces for inter-module communication and data sharing.

| Module/Class                                      | Description                                                                                                                                                                                 | Key Files                                                                                                                                                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Service Support Platform**                      | Process lifecycle management, message bus initialization, and component entry point providing integration with RDK-B service infrastructure                                                 | `cellularmgr_main.c`, `cellularmgr_ssp_action.c`, `cellularmgr_ssp_internal.h`, `cellularmgr_messagebus_interface.c`                                                                                                                            |
| **State Machine Controller**                      | Policy-driven state machine managing cellular interface lifecycle from modem detection through network registration to active data connection with autonomous state transitions             | `cellularmgr_sm.c`, `cellularmgr_sm.h`                                                                                                                                                                                                          |
| **Cellular Management APIs**                      | Core business logic coordinating modem operations, profile management, network registration, and connection control with centralized data structure management                              | `cellularmgr_cellular_apis.c`, `cellularmgr_cellular_apis.h`, `cellularmgr_cellular_internal.c`, `cellularmgr_cellular_internal.h`                                                                                                              |
| **TR-181 Data Model Layer**                       | `Device.Cellular` object implementation providing standardized interface for cellular parameter access with validation, commit, and rollback support                                        | `cellularmgr_cellular_dml.c`, `cellularmgr_cellular_dml.h`, `cellularmgr_cellular_param.c`, `cellularmgr_plugin_main.c`, `cellularmgr_plugin_main_apis.c`                                                                                       |
| **R-BUS Integration**                             | R-BUS data element registration, get/set handlers, and event publishing for real-time cellular interface monitoring and control                                                              | `cellularmgr_rbus_dml.c`, `cellularmgr_rbus_dml.h`, `cellularmgr_rbus_events.c`, `cellularmgr_rbus_events.h`, `cellularmgr_rbus_helpers.c`                                                                                                      |
| **WebConfig Support**                             | Web configuration framework integration for remote cellular configuration management through cloud-based configuration updates                                                              | `cellularmgr_cellular_webconfig_api.c`, `cellularmgr_cellular_webconfig_api.h`                                                                                                                                                                  |
| **HAL Abstraction Layer**                         | Hardware abstraction dispatch layer routing calls to the active backend: `QMI_SUPPORT` (direct QMI), `MM_SUPPORT` (ModemManager/`libmm-glib`), or `HYBRID_SUPPORT` (dynamic device manager) | `cellular_hal.c`, `cellular_hal.h`, `cellular_hal_qmi_apis.c`, `cellular_hal_mm_apis.c`, `cellular_hal_device_manager.c`, `cellular_hal_device_abstraction.c`, `cellular_hal_modem_apis.c`, `cellular_hal_rndis_apis.c`, `cellular_hal_utils.c` |
| **HYBRID Device Manager** _(HYBRID_SUPPORT only)_ | Runtime USB device detection and HAL selection using `libusb` hotplug and `libudev` network interface monitoring; maintains HAL virtual function table                                      | `cellular_hal_device_manager.c`, `cellular_hal_device_abstraction.c`                                                                                                                                                                            |
| **Bus Utilities**                                 | Component discovery and parameter access utilities for interacting with other RDK-B components through message bus infrastructure                                                           | `cellularmgr_bus_utils.c`, `cellularmgr_bus_utils.h`                                                                                                                                                                                            |

## Component Interactions

Cellular Modem Manager maintains extensive interactions with RDK-B middleware components, system services, and cellular modem hardware to provide comprehensive cellular WAN connectivity management. These interactions span multiple protocols and communication patterns including synchronous API calls, asynchronous event notifications, and data synchronization mechanisms.

### Interaction Matrix

| Target Component/Layer          | Interaction Purpose                                                                                                                                                                      | Key APIs/Endpoints                                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **RDK-B Middleware Components** |                                                                                                                                                                                          |                                                                                                                       |
| CcspPandM                       | TR-181 parameter registration, component configuration management, operational state coordination                                                                                        | R-BUS data element registration, parameter get/set handlers                                                            |
| CcspPsm                         | Persistent cellular configuration storage including profile settings, enable state, and user credentials                                                                                 | `PSM_Set_Record_Value2()`, `PSM_Get_Record_Value2()`                                                                  |
| WebPA                           | Cloud-based management interface for remote cellular configuration and monitoring                                                                                                        | R-BUS parameter access, event subscriptions                                                                            |
| **System & HAL Layers**         |                                                                                                                                                                                          |                                                                                                                       |
| Cellular HAL                    | Modem initialization, network registration control, profile configuration, packet data connection management                                                                             | `cellular_hal_init()`, `cellular_hal_open_device()`, `cellular_hal_start_network()`, `cellular_hal_get_device_info()` |
| ModemManager Daemon             | Modem lifecycle management and protocol abstraction accessed via D-Bus in MM_SUPPORT and HYBRID_SUPPORT (modem path); provides MBIM (`libmbim`) and QMI (`libqmi-glib`) protocol support | `mm_manager_new_sync()`, `libmm-glib` D-Bus API, `org.freedesktop.ModemManager1`                                      |
| sysevent                        | System event notification for WAN IP configuration propagation to routing and DHCP services                                                                                              | `sysevent_set()` for IPv4/IPv6 address, gateway, DNS configuration                                                    |
| syscfg                          | System configuration storage for persistent settings across reboots                                                                                                                      | `syscfg_get()`, `syscfg_set()`                                                                                        |

**Major events Published by Cellular Modem Manager:**

| Event Name                 | Event Topic/Path                             | Trigger Condition                            | Subscriber Components                   |
| -------------------------- | -------------------------------------------- | -------------------------------------------- | --------------------------------------- |
| Interface_Status_Change    | `Device.Cellular.Interface.{i}.Status`       | Cellular interface operational status change | CcspPandM, WebPA, Monitoring Services   |
| Registration_Status_Change | `Device.Cellular.Interface.{i}.NetworkInUse` | Network registration state transition        | Connection Manager, Telemetry Services  |
| Signal_Quality_Update      | `Device.Cellular.Interface.{i}.RSSI`         | Radio signal quality metrics update          | Network Analytics, Telemetry Collection |
| Connection_State_Change    | `Device.Cellular.Interface.{i}.X_RDK_Status` | Packet data connection state change          | WAN Manager, Routing Services           |

### IPC Flow Patterns

**Primary IPC Flow - Network Connection Establishment:**

```mermaid
sequenceDiagram
    participant SM as State Machine
    participant CellAPI as Cellular APIs
    participant HAL as Cellular HAL
    participant MM as ModemManager Daemon
    participant Modem as Modem Hardware
    participant SysEvent as sysevent

    SM->>CellAPI: Request Network Start
    CellAPI->>HAL: cellular_hal_start_network(profile)
    alt MM_SUPPORT or HYBRID modem path
        HAL->>MM: libmm-glib bearer connect request
        MM->>Modem: MBIM/QMI Start Network Command
        Modem-->>MM: Network Started
        MM-->>HAL: Bearer connected callback
    else QMI_SUPPORT
        HAL->>Modem: QMI WDS Start Network Command
        Modem-->>HAL: Network Started Event
    end
    HAL-->>CellAPI: Start Network Success
    CellAPI->>HAL: cellular_hal_get_ip_config()
    HAL-->>CellAPI: IP Configuration
    CellAPI->>SysEvent: Set cellular_wan_v4_ip
    CellAPI->>SysEvent: Set cellular_wan_v4_gw
    CellAPI-->>SM: Network Connection Established
```

**Event Notification Flow:**

```mermaid
sequenceDiagram
    participant Modem as Modem Hardware
    participant MM as ModemManager Daemon
    participant HAL as Cellular HAL
    participant CellAPI as Cellular APIs
    participant RBusEvents as R-BUS Events
    participant Subscribers as Event Subscribers

    Modem-->>MM: Registration state change
    MM-->>HAL: libmm-glib state-change signal (D-Bus)
    HAL->>CellAPI: Registration Status Callback
    CellAPI->>RBusEvents: Publish Status Change Event
    RBusEvents->>Subscribers: R-BUS Event Notification
    Subscribers-->>RBusEvents: Ack
```

## Implementation Details

### Major HAL APIs Integration

Cellular Modem Manager integrates with Cellular HAL APIs to abstract vendor-specific modem control operations. The `cellular_hal.c` dispatch layer routes each API call to the active backend (QMI_SUPPORT, MM_SUPPORT, or HYBRID_SUPPORT) through compile-time `#ifdef` selection. In MM_SUPPORT mode the calls flow through `libmm-glib` to the ModemManager daemon, which in turn uses `libmbim` for MBIM modems or `libqmi-glib` for QMI modems.

**Core HAL APIs:**

| HAL API                                  | Purpose                                                                     | Implementation File |
| ---------------------------------------- | --------------------------------------------------------------------------- | ------------------- |
| `cellular_hal_IsModemDevicePresent()`    | Detect presence of cellular modem hardware on the system                    | `cellular_hal.c`    |
| `cellular_hal_init()`                    | Initialize cellular HAL layer and establish communication with modem        | `cellular_hal.c`    |
| `cellular_hal_open_device()`             | Open modem device interface and prepare for control operations              | `cellular_hal.c`    |
| `cellular_hal_get_device_info()`         | Retrieve modem hardware information including IMEI, manufacturer, model     | `cellular_hal.c`    |
| `cellular_hal_sim_power_enable()`        | Enable SIM card power and initialize SIM interface                          | `cellular_hal.c`    |
| `cellular_hal_get_sim_card_info()`       | Read SIM card information including ICCID, IMSI, status                     | `cellular_hal.c`    |
| `cellular_hal_select_profile()`          | Configure cellular profile with APN, authentication, and IP family settings | `cellular_hal.c`    |
| `cellular_hal_start_network()`           | Initiate packet data network connection with selected profile               | `cellular_hal.c`    |
| `cellular_hal_stop_network()`            | Terminate active packet data connection and release network resources       | `cellular_hal.c`    |
| `cellular_hal_get_ip_config()`           | Retrieve IP configuration including address, gateway, DNS from modem        | `cellular_hal.c`    |
| `cellular_hal_get_signal_info()`         | Read radio signal quality metrics including RSSI, RSRP, RSRQ, SNR           | `cellular_hal.c`    |
| `cellular_hal_get_registration_status()` | Query network registration status and registered operator information       | `cellular_hal.c`    |

### Key Implementation Logic

- **State Machine Engine**: Policy control state machine implemented in `cellularmgr_sm.c` manages cellular interface lifecycle through predefined states (DOWN, DEACTIVATED, DEREGISTERED, REGISTERING, REGISTERED, CONNECTED) with 500ms loop interval executing state-specific logic and transition functions based on modem status and configuration
  - State handlers process current state conditions and determine next state transitions: `StateDown()`, `StateDeactivated()`, `StateDeregistered()`, `StateRegistering()`, `StateRegistered()`, `StateConnected()`
  - Transition functions perform operations required for state changes including HAL API invocations and event notifications: `TransitionDown()`, `TransitionDeactivated()`, `TransitionDeregistered()`, `TransitionRegistering()`, `TransitionRegistered()`, `TransitionConnected()`
  - State machine thread executes continuously polling modem status and configuration changes to drive autonomous state transitions in `CellularMgr_StateMachine_Thread()`

- **Event Processing**: Cellular modem events processed through HAL callback mechanism with registration of callback functions during initialization
  - Device detection callbacks notify state machine of modem insertion/removal through `CellularMgrDeviceRemovedStatusCBForSM()`
  - Device open status callbacks indicate successful modem initialization through `CellularMgrDeviceOpenStatusCBForSM()`
  - Network registration callbacks provide registration state updates enabling state machine progression through registration phases; in MM_SUPPORT/HYBRID modem path these originate as ModemManager D-Bus state-change signals forwarded via `libmm-glib`
  - Asynchronous event processing maintains responsiveness during long-duration modem operations
  - In HYBRID_SUPPORT, USB hotplug removal triggers `systemctl restart ModemManager` to recover from ModemManager's inability to automatically handle device re-enumeration after USB unplug

- **Error Handling Strategy**: Comprehensive error detection and recovery mechanisms throughout component layers
  - HAL API return code checking with error logging and state machine notification for retry logic
  - State machine timeout handling for stuck states with automatic recovery through state reset sequences
  - Configuration validation preventing invalid parameter combinations that could cause modem failures
  - Timeout handling and retry logic for network attachment failures with exponential backoff

- **Logging & Debugging**: Multi-level logging infrastructure with RDK logging framework integration
  - `CcspTraceInfo`, `CcspTraceWarning`, `CcspTraceError` macros provide categorized logging throughout component
  - State machine state transitions logged with timestamps for debugging connection establishment sequences
  - HAL API invocations and responses logged for troubleshooting modem communication issues
  - Debug hooks for troubleshooting cellular connectivity including state dump, modem status query, and manual state transitions

### Key Configuration Files

| Configuration File          | Purpose                                                                                           | Override Mechanisms             |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------- |
| `RdkCellularManager.xml`    | TR-181 data model registration defining `Device.Cellular` object hierarchy and parameter metadata | N/A                             |
| `/nvram/cellularmgr_*.conf` | Persistent cellular profile configuration including APN settings, authentication credentials      | PSM database, WebConfig updates |
