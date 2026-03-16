# CcspHomeSecurity Documentation

CcspHomeSecurity is the RDK-B component responsible for providing Home Network Administration Protocol (HNAP) server functionality for managing home security devices and settings. This component serves as a protocol adapter that bridges HNAP requests from external clients to the CCSP data model infrastructure, enabling remote management and configuration of home security devices through standardized HNAP interfaces. CcspHomeSecurity implements HNAP 1.0 protocol specifications and provides device abstraction layer for accessing various device settings, network configurations, and security parameters through XML-based SOAP messaging.

The component acts as a standalone HTTP server listening for HNAP requests and translating them into CCSP message bus calls to access the underlying data model. It handles authentication, request parsing, method dispatching, and response generation for all supported HNAP operations.

```mermaid
graph LR
    subgraph "External Systems"
        Remote[Remote Management<br/>HNAP Clients]
    end

    subgraph "RDK-B Middleware Layer"
        HomeSecurity[CcspHomeSecurity<br/>HNAP Server]
        CR[Component Registry<br/>CcspCr]
        PandM[CcspPandM<br/>Protocol & Device Mgmt]
        WiFi[WiFi Agent<br/>CcspWiFiAgent/OneWifi]
        PSM[PSM<br/>Configuration Storage]
    end

    subgraph "System Layer"
        MBus[CCSP Message Bus]
        Syscfg[Syscfg<br/>Local Storage]
    end

    Remote -->|HTTP POST /HNAP1<br/>SOAP XML| HomeSecurity
    HomeSecurity -->|Component Discovery| CR
    HomeSecurity -->|Message Bus<br/>Parameter Access| MBus
    MBus -->|DeviceInfo, Time, UserInterface<br/>NAT, Users, DHCP, DNS| PandM
    MBus -->|WiFi Radio, AccessPoint| WiFi
    MBus -->|TR-181 Persistence| PSM
    HomeSecurity -->|syscfg_get/set/commit| Syscfg
    
    classDef external fill:#f9d5e5,stroke:#c75b7a,stroke-width:2px;
    classDef rdkb fill:#e3f2fd,stroke:#1976d2,stroke-width:2px;
    classDef system fill:#f1f8e9,stroke:#558b2f,stroke-width:2px;
    
    class Remote external
    class HomeSecurity,CR,PandM,WiFi,PSM rdkb
    class MBus,Syscfg system
```

**Key Features & Responsibilities**: 

- **HNAP Protocol Server**: Implements HNAP 1.0 server functionality including HTTP request handling, SOAP/XML parsing, and response generation for home network device management operations
- **Device Settings Management**: Provides access to device configuration parameters including network settings, wireless configurations, firmware information, and administrative credentials through HNAP interfaces
- **Authentication and Security**: Implements HTTP Basic Authentication for HNAP requests and validates credentials against system configuration to ensure secure access to device management functions
- **CCSP Data Model Integration**: Translates HNAP method calls into CCSP message bus operations for reading and writing TR-181 data model parameters across multiple RDK-B components
- **Network Management APIs**: Exposes HNAP methods for network configuration including LAN settings, wireless settings, port mappings, MAC filtering, and connected device enumeration


## Design

CcspHomeSecurity follows a request-response architecture designed around the HNAP protocol specification. The design emphasizes protocol compliance, secure authentication, and seamless integration with the CCSP middleware infrastructure. The component operates as a single-threaded HTTP server that processes HNAP requests synchronously, parsing incoming XML payloads, dispatching to appropriate method handlers, and generating XML responses.

The architecture separates HNAP protocol handling from device-specific operations through a well-defined abstraction layer. The core protocol engine manages HTTP communication, XML serialization/deserialization, and SOAP message processing, while the Abstract Device Interface (ADI) layer provides device-agnostic implementations of HNAP methods. The device glue layer connects ADI implementations to the CCSP message bus for accessing the underlying data model.

The northbound interface accepts HTTP POST requests on the `/HNAP1` endpoint, with SOAP Action headers identifying the requested method. The southbound interface utilizes CCSP message bus APIs for component discovery, parameter retrieval, and parameter modification across the RDK-B middleware stack. The component registers with the message bus as a client and discovers component destinations through the Component registry. Configuration persistence is achieved through syscfg APIs for local storage and PSM integration for TR-181 parameter persistence.

```mermaid
graph LR
    subgraph ExternalSystems ["External Systems"]
        CR[Component Registry<br/>CcspCr]
        PandM[CcspPandM]
        WiFi[CcspWiFiAgent/OneWifi]
        PSM[PSM]
        Syscfg[Syscfg]
    end

    subgraph CcspHomeSecurity ["CcspHomeSecurity"]
        subgraph HTTPServer ["HTTP/HNAP Protocol Handler"]
            HNAPServer[HNAP Server<br/>hnapd.c]
            HDKCore[HDK Core<br/>hdk.c]
            HDKContext[Context Manager<br/>hdk_context.c]
        end

        subgraph MethodDispatch ["Method Dispatch Layer"]
            HDKMethods[Method Handlers<br/>hdk_methods.c]
            HDKADI[Abstract Device Interface<br/>hdk_adi.c]
        end

        subgraph DataAccess ["Data Access Layer"]
            HDKDevice[Device Glue<br/>hdk_device.c]
            HDKMBus[Message Bus Client<br/>hdk_ccsp_mbus.c]
        end

        subgraph Utilities ["Utilities"]
            HDKEncode[Encoding Utilities<br/>hdk_encode.c]
            HDKData[Data Structures<br/>hdk_data.c]
        end

        HNAPServer -->|Parse Request| HDKCore
        HDKCore -->|Method Dispatch| HDKMethods
        HDKMethods -->|Call ADI| HDKADI
        HDKADI -->|Device Operations| HDKDevice
        HDKDevice -->|CCSP APIs| HDKMBus
        HDKCore -->|XML Processing| HDKEncode
        HDKCore -->|Data Types| HDKData
        HDKContext -->|Manage State| HNAPServer
    end

    CR -->|Component Discovery| HDKMBus
    PandM -->|TR-181 Parameters| HDKMBus
    WiFi -->|TR-181 Parameters| HDKMBus
    PSM -.->|TR-181 Persistence| PandM
    PSM -.->|TR-181 Persistence| WiFi
    Syscfg -->|Authentication| HDKDevice

    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef server fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef dispatch fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef util fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    
    class CR,PandM,WiFi,PSM,Syscfg external
    class HNAPServer,HDKCore,HDKContext server
    class HDKMethods,HDKADI dispatch
    class HDKDevice,HDKMBus data
    class HDKEncode,HDKData util
```

### Prerequisites and Dependencies

**Build-Time Flags and Configuration:**

| Configure Option | DISTRO Feature | Build Flag | Purpose | Default |
|------------------|----------------|------------|---------|---------|
| `--enable-mountutils` | `MountUtils` | `LIBRDKCONFIG_BUILD` | Enable rdkconfig library for configuration file management as replacement for mountutils | Disabled |
| `--enable-unitTestDockerSupport` | N/A | `UNIT_TEST_DOCKER_SUPPORT` | Enable Docker-based unit testing infrastructure with mock components | Disabled |
| N/A | `safec` | `SAFEC_DUMMY_API` | Define dummy SafeC API macros when SafeC library is not available | Enabled when safec absent |

<br>

**RDK-B Platform and Integration Requirements:**

* **Build Dependencies**: `libxml2`, `ccsp-common-library`, `utopia`, `curl`, `mountutils` (from ccsp-home-security.bb)
  * Note: `utopia` is listed in build dependencies but no direct Utopia API calls found in CcspHomeSecurity source code; integration may be indirect through CcspPandM
* **RDK-B Components**: 
  * `CcspCr` (Component Registry) - required for dynamic component discovery
  * `CcspPandM` (Protocol and Device Management) - provides Device.DeviceInfo, Device.UserInterface, Device.Time, Device.NAT, Device.Users, Device.DHCPv4, Device.DNS, Device.X_CISCO_COM_MultiLAN data model namespaces
  * `CcspWiFiAgent/OneWifi` - provides Device.WiFi data model namespace for wireless configuration
  * `PSM` (Persistent Storage Manager) - optional for TR-181 parameter persistence
* **HAL Dependencies**: No direct HAL dependencies (HAL interaction through CcspPandM and CcspWiFiAgent/OneWifi)
* **Systemd Services**: 
  * Component Registry service must be active before CcspHomeSecurity starts
  * CcspPandM must be running to provide Device.DeviceInfo, Device.Time, Device.UserInterface, Device.NAT, Device.Users, Device.DHCPv4, Device.DNS parameters
  * CcspWiFiAgent/OneWifi must be running to provide Device.WiFi parameters
* **Message Bus**: CCSP message bus client registration using CCSP_Message_Bus_Init() from hdk_ccsp_mbus.c
* **Configuration Files**: Syscfg configuration database for authentication credentials (admin username/password) and device settings
* **Startup Order**: Initialize after message bus, Component Registry, CcspPandM, and CcspWiFiAgent/OneWifi are operational

<br>

<br>

**Threading Model:** 

CcspHomeSecurity implements a single-threaded architecture centered around a synchronous HTTP request processing loop.

- **Threading Architecture**: Single-threaded with blocking I/O
- **Main Thread**: Handles all HTTP server operations including socket accept, request parsing, HNAP method execution, and response generation in a sequential manner
- **Synchronization**: No explicit synchronization mechanisms required due to single-threaded design

### Component State Flow

**Initialization to Active State**

CcspHomeSecurity follows a straightforward initialization sequence focused on establishing message bus connectivity and starting the HTTP server.

```mermaid
sequenceDiagram
    autonumber
    participant System as System Startup
    participant Component as CcspHomeSecurity
    participant MBus as Message Bus
    participant Syscfg as Syscfg
    participant Socket as Network Socket

    System->>Component: Start Process
    Note over Component: State: Initializing
    
    Component->>MBus: Initialize Message Bus Client
    MBus-->>Component: Bus Handle
    Note over Component: State: Message Bus Connected
    
    Component->>MBus: Register Component
    MBus-->>Component: Registration Success
    
    Component->>Syscfg: Load Configuration
    Syscfg-->>Component: Configuration Data
    
    Component->>Socket: Create Listen Socket
    Note over Socket: Port specified via<br/>command-line argument
    Socket-->>Component: Socket Descriptor
    
    Component->>Socket: Bind and Listen
    Socket-->>Component: Ready
    Note over Component: State: Active - Accepting Connections
    
    loop HTTP Request Processing
        Socket->>Component: Accept Connection
        Component->>Component: Process HNAP Request
        Component->>Socket: Send Response
        Component->>Socket: Close Connection
    end
    
    System->>Component: Shutdown Signal
    Component->>Socket: Close Listen Socket
    Component->>MBus: Disconnect
    Note over Component: State: Terminated
```

**Runtime State Changes and Context Switching**

During normal operation, CcspHomeSecurity maintains a steady state while processing HNAP requests sequentially.

**State Change Triggers:**

- Message bus disconnection events requiring reconnection attempts to restore data model access
- Configuration parameter changes through syscfg affecting authentication credentials or device settings
- Network socket errors causing server restart or connection handling failures

**Context Switching Scenarios:**

- Switching between authenticated and unauthenticated request handling based on HNAP method requirements
- Transitioning between read-only operations (GetDeviceSettings) and write operations (SetDeviceSettings) requiring different data model access patterns

### Call Flow

**Initialization Call Flow:**

```mermaid
sequenceDiagram
    participant Init as Main Function
    participant MBus as Message Bus Module
    participant Server as HTTP Server
    participant Syscfg as Syscfg
    
    Init->>MBus: MBus_Create()
    MBus-->>Init: MBus Object
    
    Init->>Syscfg: syscfg_init()
    Syscfg-->>Init: Success
    
    Init->>Server: HTTP_ServerInit()
    Server->>Server: socket(), bind(), listen()
    Server-->>Init: Ready
    
    Init->>Server: HTTP_ServerRun()
    Note over Server: Enter main accept() loop
    Server-->>Init: Initialization Complete (Active State)
```

**Request Processing Call Flow:**

The most critical flow is processing an HNAP GetDeviceSettings request, which demonstrates the complete request-response cycle.

```mermaid
sequenceDiagram
    participant Client as HNAP Client
    participant Server as HTTP Server<br/>(hnapd.c)
    participant Core as HNAP Core<br/>(hdk.c)
    participant Method as Method Handler<br/>(hdk_methods.c)
    participant ADI as Abstract Device<br/>(hdk_adi.c)
    participant Device as Device Glue<br/>(hdk_device.c)
    participant MBus as Message Bus<br/>(hdk_ccsp_mbus.c)
    participant CR as Component Registry<br/>CcspCr
    participant PandM as CcspPandM
    participant WiFi as CcspWiFiAgent/OneWifi

    Client->>Server: HTTP POST /HNAP1<br/>SOAPAction: GetDeviceSettings
    Server->>Server: HTTP_ParseHeaders()
    Server->>Server: HTTP_AuthDecode()
    Note over Server: Validate credentials via syscfg
    
    Server->>Core: HDK_HandleRequest()
    Core->>Core: HDK_Request_Init()
    Note over Core: Parse SOAP XML request
    
    Core->>Method: HDK_Method_PN_GetDeviceSettings()
    Method->>ADI: HDK_ADI_PN_GetDeviceSettings()
    
    ADI->>Device: HDK_Device_GetValue(DeviceInfo.ModelName)
    Device->>MBus: MBus_GetParamVal("Device.DeviceInfo.ModelName")
    MBus->>CR: CcspBaseIf_discComponentSupportingNamespace()
    CR-->>MBus: Component: com.cisco.spvtg.ccsp.pam
    MBus->>PandM: CcspBaseIf_getParameterValues()
    PandM-->>MBus: Value: "XB6"
    MBus-->>Device: Value
    Device-->>ADI: Value
    
    ADI->>Device: HDK_Device_GetValue(UserInterface.RemoteAccess)
    Device->>MBus: MBus_GetParamVal("Device.UserInterface...")
    MBus->>CR: CcspBaseIf_discComponentSupportingNamespace()
    CR-->>MBus: Component: com.cisco.spvtg.ccsp.pam
    MBus->>PandM: CcspBaseIf_getParameterValues()
    PandM-->>MBus: Value
    MBus-->>Device: Value
    Device-->>ADI: Value
    
    ADI->>Device: HDK_Device_GetValue(WiFi Settings)
    Device->>MBus: MBus_GetParamVal("Device.WiFi.Radio...")
    MBus->>CR: CcspBaseIf_discComponentSupportingNamespace()
    CR-->>MBus: Component: com.cisco.spvtg.ccsp.wifi
    MBus->>WiFi: CcspBaseIf_getParameterValues()
    WiFi-->>MBus: Value
    MBus-->>Device: Value
    Device-->>ADI: Value
    
    ADI->>ADI: Build response struct
    ADI-->>Method: Response struct
    Method-->>Core: Response struct
    
    Core->>Core: HDK_EncodeResponse()
    Note over Core: Generate SOAP XML response
    Core-->>Server: XML response
    
    Server->>Client: HTTP 200 OK<br/>SOAP XML Response
```

## Internal Modules

CcspHomeSecurity is organized into specialized modules handling protocol processing, method dispatch, and data access layers.

| Module/Class | Description | Key Files |
|-------------|------------|-----------|
| **HTTP/HNAP Server** | Main HTTP server daemon processing incoming HNAP requests, handling socket operations, HTTP header parsing, and authentication validation | `hnapd.c` |
| **HNAP Protocol Engine** | Core HNAP protocol implementation managing request parsing, method routing, SOAP message processing, and XML response generation | `hdk.c`, `hdk.h` |
| **Context Manager** | Request context management maintaining per-request state including file handles, authentication status, and reboot flags | `hdk_context.c`, `hdk_context.h` |
| **Method Handlers** | HNAP method callback implementations providing entry points for all supported HNAP operations with request validation and response preparation | `hdk_methods.c`, `hdk_methods.h` |
| **Abstract Device Interface** | Device-agnostic HNAP method implementations providing logical operations for device management without platform-specific details | `hdk_adi.c`, `hdk_adi.h` |
| **Device Glue Layer** | Platform-specific device operations connecting HNAP ADI layer to CCSP data model through message bus APIs and syscfg storage | `hdk_device.c` |
| **Message Bus Client** | CCSP message bus integration providing parameter get/set operations, component discovery, and data model object manipulation | `hdk_ccsp_mbus.c`, `hdk_ccsp_mbus.h` |
| **Encoding Utilities** | XML and Base64 encoding/decoding functions for SOAP message processing and authentication credential handling | `hdk_encode.c`, `hdk_encode.h` |
| **Data Structures** | HNAP type system implementation including structures, enumerations, and type conversion utilities for protocol data representation | `hdk_data.c`, `hdk_data.h` |

## Component Interactions

CcspHomeSecurity maintains interactions with CCSP middleware components and system services for data model access and configuration management.

### Interaction Matrix

| Target Component | Why CcspHomeSecurity Needs It | How It's Used |
|------------------|-------------------------------|---------------|
| **RDK-B Middleware Components** |
| Component Registry (CcspCr) | **Dynamic component discovery for TR-181 access**<br/>CcspHomeSecurity doesn't know which component owns which data model namespace | Uses `CcspBaseIf_discComponentSupportingNamespace()` in hdk_ccsp_mbus.c to query CR before every parameter access, enabling flexible deployment without hardcoded dependencies |
| CcspPandM | **HNAP device information and management methods**<br/>To implement HNAP GetDeviceSettings, SetRouterSettings, GetRouterSettings, etc. | Accesses TR-181 namespaces: `Device.DeviceInfo.*` (model, manufacturer, firmware), `Device.UserInterface.*` (remote access, language), `Device.Time.*` (timezone), `Device.NAT.*` (port mappings), `Device.Users.*` (admin accounts), `Device.DHCP/DNS.*` (network config), `Device.X_CISCO_COM_MultiLAN.*` (home security VLAN paths)<br/>**APIs**: `MBus_GetParamVal()`, `MBus_SetParamVal()`, `MBus_FindObjectIns()`, `MBus_AddObjectIns()`, `MBus_DelObjectIns()` from hdk_device.c |
| CcspWiFiAgent/OneWifi | **HNAP wireless configuration methods**<br/>To implement HNAP SetWiFiRadioSettings, SetWiFiSettings, GetWiFiRadioSettings, etc. | Accesses TR-181 namespaces: `Device.WiFi.Radio.*` (enable, channel, standards), `Device.WiFi.AccessPoint.*` (SSID, security, passphrase, WPS)<br/>**APIs**: `MBus_GetParamVal()`, `MBus_SetParamVal()`, `MBus_FindObjectIns()` from hdk_device.c<br/>**Note**: Actual WiFi instance paths obtained via CcspPandM's MultiLAN parameters first |
| PSM (indirect) | **TR-181 parameter persistence**<br/>So HNAP configuration changes survive reboots | CcspHomeSecurity doesn't interact directly with PSM; data model components (CcspPandM, CcspWiFiAgent/OneWifi) handle persistence after parameter commits |
| **System & Configuration Layers** |
| Syscfg | **HNAP authentication**<br/>To validate HTTP Basic Auth credentials in HNAP requests | Uses `syscfg_get()` to retrieve admin username/password for credential validation in hdk_device.c<br/>Uses `syscfg_set()` and `syscfg_commit()` for updating authentication settings |
| CCSP Message Bus | **IPC transport for all TR-181 operations**<br/>To communicate with dynamically discovered components | Initialized via `CCSP_Message_Bus_Init()` in hdk_ccsp_mbus.c<br/>Uses `CcspBaseIf_getParameterValues()`, `CcspBaseIf_setParameterValues()`, `CcspBaseIf_AddTblRow()`, `CcspBaseIf_DeleteTblRow()` to invoke operations on remote components |

**Key Discovery Pattern:**

All data model access follows this pattern in hdk_ccsp_mbus.c:
1. Call `CcspBaseIf_discComponentSupportingNamespace(handle, CR_ComponentID, parameter_path, subsystem, &components, &count)` to find owning component
2. Extract component name and DBus path from returned component structure
3. Invoke CCSP API (`getParameterValues`, `setParameterValues`, etc.) with discovered component details
4. Release component structure memory

This dynamic discovery mechanism allows CcspHomeSecurity to work with any data model layout without hardcoded component dependencies.

**Major events Published by CcspHomeSecurity:**

CcspHomeSecurity does not publish events. It operates as a request-response service processing HNAP requests synchronously.

### IPC Flow Patterns

**Primary IPC Flow - HNAP Parameter Get with Dynamic Component Discovery:**

```mermaid
sequenceDiagram
    participant Client as HNAP Client
    participant Server as CcspHomeSecurity
    participant MBus as Message Bus<br/>(hdk_ccsp_mbus.c)
    participant CR as Component Registry<br/>CcspCr
    participant PandM as CcspPandM
    
    Client->>Server: HNAP Request (GetDeviceSettings)
    Note over Server: Parse SOAP XML request
    
    Server->>MBus: MBus_GetParamVal("Device.DeviceInfo.ModelName")
    MBus->>MBus: MBus_Process(MBUS_GETPARAM)
    MBus->>CR: CcspBaseIf_discComponentSupportingNamespace<br/>("Device.DeviceInfo.", subsystem)
    Note over CR: Query component registry<br/>for namespace owner
    CR-->>MBus: componentStruct: com.cisco.spvtg.ccsp.pam<br/>dbusPath: /com/cisco/spvtg/ccsp/pam
    
    MBus->>PandM: CcspBaseIf_getParameterValues<br/>(["Device.DeviceInfo.ModelName"])
    Note over PandM: Retrieve parameter from<br/>internal data model
    PandM-->>MBus: parameterValStruct: "XB6"
    MBus-->>Server: Value: "XB6"
    
    Note over Server: Build HNAP response struct
    Server->>Server: HDK_EncodeResponse()
    Server-->>Client: HTTP 200 OK (SOAP XML Response)
```

**Configuration Update Flow with Multi-Component Interaction:**

```mermaid
sequenceDiagram
    participant Client as HNAP Client
    participant Server as CcspHomeSecurity
    participant Syscfg as Syscfg Storage
    participant MBus as Message Bus
    participant CR as Component Registry
    participant PandM as CcspPandM
    participant WiFi as CcspWiFiAgent/OneWifi
    
    Client->>Server: HNAP Request (SetWiFiRadioSettings)
    Note over Server: Parse and validate request
    
    alt Authentication Update (Local)
        Server->>Syscfg: syscfg_set("admin_password", value)
        Syscfg-->>Server: Success
        Server->>Syscfg: syscfg_commit()
        Syscfg-->>Server: Persisted to flash
    end
    
    alt Remote Access Port (PandM)
        Server->>MBus: MBus_SetParamVal<br/>("Device.UserInterface...HttpPort", 8080)
        MBus->>CR: CcspBaseIf_discComponentSupportingNamespace<br/>("Device.UserInterface.")
        CR-->>MBus: Component: CcspPandM
        MBus->>PandM: CcspBaseIf_setParameterValues<br/>(commit=true)
        PandM->>PandM: Update parameter & commit
        PandM-->>MBus: Success
        MBus-->>Server: Success
    end
    
    alt WiFi Radio Enable (WiFi)
        Server->>MBus: MBus_GetParamVal<br/>("Device.X_CISCO_COM_MultiLAN.HomeSecurityWiFiRadio")
        Note over MBus: Get WiFi radio instance path
        MBus->>CR: Discover component
        CR-->>MBus: Component: CcspPandM
        MBus->>PandM: Get parameter
        PandM-->>MBus: Path: "Device.WiFi.Radio.2."
        MBus-->>Server: Radio path
        
        Server->>MBus: MBus_SetParamVal<br/>("Device.WiFi.Radio.2.Enable", true)
        MBus->>CR: CcspBaseIf_discComponentSupportingNamespace<br/>("Device.WiFi.Radio.2.Enable")
        CR-->>MBus: Component: CcspWiFiAgent/OneWifi
        MBus->>WiFi: CcspBaseIf_setParameterValues
        WiFi->>WiFi: Configure radio hardware
        WiFi-->>MBus: Success
        MBus-->>Server: Success
    end
    
    Server->>Server: Build success response
    Server-->>Client: HTTP 200 OK (SetWiFiRadioSettingsResponse)
```
```

## Implementation Details

### HAL Integration

**No Direct HAL Dependencies:**

CcspHomeSecurity does not directly integrate with Hardware Abstraction Layer (HAL) APIs. All hardware-related operations are performed indirectly through data model components:

- **WiFi Hardware Operations**: Delegated to CcspWiFiAgent/OneWifi component via Device.WiFi.* TR-181 parameters
- **Network Hardware Operations**: Managed by CcspPandM component via Device.NAT.*, Device.DHCP.*, Device.DNS.* parameters  
- **Device Hardware Information**: Retrieved from CcspPandM via Device.DeviceInfo.* parameters

This architecture provides a clean separation where CcspHomeSecurity operates purely at the protocol adaptation layer, translating HNAP requests into TR-181 data model operations without direct hardware dependencies.

### Message Bus APIs Integration

CcspHomeSecurity utilizes CCSP message bus APIs for accessing the TR-181 data model across RDK-B components.

**Core Message Bus APIs:**

| Message Bus API | Purpose | Implementation File |
|---------|---------|-------------------|
| `MBus_Create()` | Initialize message bus object with subsystem configuration and component registration | `hdk_ccsp_mbus.c` |
| `MBus_Destroy()` | Clean up message bus resources and disconnect from bus | `hdk_ccsp_mbus.c` |
| `MBus_GetParamVal()` | Retrieve single parameter value from data model with component discovery | `hdk_ccsp_mbus.c` |
| `MBus_SetParamVal()` | Set single parameter value in data model with type validation | `hdk_ccsp_mbus.c` |
| `MBus_GetParamList()` | Retrieve multiple parameter values in single operation | `hdk_ccsp_mbus.c` |
| `MBus_SetParamList()` | Set multiple parameter values atomically | `hdk_ccsp_mbus.c` |
| `MBus_Commit()` | Commit pending parameter changes to persistent storage | `hdk_ccsp_mbus.c` |
| `MBus_AddObject()` | Create new data model object instance | `hdk_ccsp_mbus.c` |
| `MBus_DelObject()` | Delete data model object instance | `hdk_ccsp_mbus.c` |
| `CcspBaseIf_discComponentSupportingNamespace()` | Discover component responsible for data model namespace | `hdk_ccsp_mbus.c` |

### Key Implementation Logic

- **HTTP Server Engine**: Single-threaded HTTP server implementation in `hnapd.c` using standard POSIX socket APIs with blocking accept/read/write operations for processing HNAP requests with configurable port specified as command line argument

- **HNAP Protocol Processing**: XML-based SOAP message parsing and generation implemented in `hdk.c` using custom XML parser, with method dispatch based on SOAPAction header matching to registered HNAP method handlers

- **Authentication Mechanism**: HTTP Basic Authentication validation implemented in `hnapd.c` with Base64-decoding of Authorization header and credential verification against syscfg stored admin username/password

- **Device Abstraction Layer**: Abstract Device Interface in `hdk_adi.c` provides device-agnostic implementations of HNAP methods, delegating device-specific operations to `hdk_device.c` glue layer for CCSP data model mapping

- **Error Handling Strategy**: HNAP error codes mapped to `HDK_Enum_Result` enumeration with HTTP 200 responses containing SOAP fault details for protocol-level errors, and component-level error propagation through message bus return codes

- **Logging & Debugging**: Syslog-based logging using `chs_log.h` macros with severity levels (LOG_ERR, LOG_WARNING, LOG_INFO) for request processing, message bus operations, and error conditions

### Key Configuration Files

| Configuration File | Purpose | Override Mechanisms |
|--------------------|---------|--------------------|
| CCSP message bus config | Message bus configuration specifying R-Bus connection parameters referenced by CCSP_MSG_BUS_CFG macro | Environment variables for bus configuration paths |
| Syscfg database | Authentication credentials (admin username/password) and device configuration parameters | `syscfg_set` command-line utility |

