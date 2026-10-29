# PPP Manager Documentation

## Overview

PPP Manager is an RDK-B component that manages PPP WAN interfaces on a gateway device. It exposes the TR-181 `Device.PPP` data model over the CCSP message bus and drives PPP sessions (PPPoE and PPPoA) through the `pppd` daemon and its plugins. It also tracks session state, connection errors, and interface statistics, and it persists selected settings to PSM.

The component is built as the `pppmanager` binary and is registered with the CCSP Component Registry under the component ID `com.cisco.spvtg.ccsp.pppmanager`.

## Features

- **TR-181 PPP data model**: Implements the `Device.PPP` object, including `Interface` table entries (up to 128), with `PPPoE`, `IPCP`, `IPv6CP`, and `Stats` sub-objects.
- **PPPoE and PPPoA links**: The `X_RDK_LinkType` parameter selects PPPoA or PPPoE for each interface.
- **Session lifecycle control**: Starts and stops PPP clients from `Enable` and related parameters, and tracks the `Status` and `ConnectionStatus` of each interface.
- **Event-driven state updates**: Receives state changes from `pppd` plugins over nanomsg and updates the data model.
- **Error reporting**: Maps `pppd` exit status to `LastConnectionError` values.
- **Interface statistics**: Reports per-interface packet and byte counters through `Stats`.
- **Persistence**: Stores interface configuration and session identifiers in PSM.

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture: Component Diagram](./architecture/component-diagram.md) | System context, process and thread model, data flows, and state handling |
| [Configuration Guide](./configuration-guide.md) | Build options, platform integration, and TR-181 parameter reference |
| [SSP Layer](./components/ssp.md) | Process entry point, CCSP registration, and message bus setup |
| [IPC Layer](./components/ipc.md) | nanomsg and POSIX queue event handling and pppd state mapping |
| [Data Model Layer](./components/data-model-layer.md) | TR-181 handlers, the interface data store, and PSM persistence |
| [PPP Session Control](./components/ppp-session-control.md) | Starting and stopping PPP clients, and interface statistics |

## Directory Structure

```
ppp-manager/
├── configure.ac                       # Autoconf build options
├── config/
│   └── RdkPppManager.xml              # TR-181 data model definition
├── source/
│   ├── PppManager/                    # SSP layer and pppmanager binary
│   │   ├── pppmgr_ssp_main.c          # Process entry point
│   │   ├── pppmgr_ssp_action.c        # CCSP component lifecycle
│   │   ├── pppmgr_ssp_messagebus_interface.c
│   │   ├── pppmgr_ipc.c               # nanomsg / POSIX queue event handling
│   │   └── pppmgr_global.h
│   └── TR-181/
│       ├── include/                   # Include path (no headers in this repository)
│       └── middle_layer_src/          # TR-181 handlers and PPP control
│           ├── pppmgr_dml_plugin_main.c
│           ├── pppmgr_dml.c / .h
│           ├── pppmgr_dml_ppp_apis.c / .h
│           ├── pppmgr_data.c / .h
│           └── pppmgr_utils.c / .h
└── docs/                              # This documentation set
```

## Quick Start

### Prerequisites

- Autotools (`autoconf`, `automake`, `libtool`)
- RDK-B build environment, with the `hal` and `CcspCommonLibrary` components available as sibling trees
- Libraries referenced in the build files: `ccsp_common`, `rdkloggers`, `hal_platform`, `nanomsg`, `syscfg`, `sysevent`

### Build

```bash
autoreconf -i
./configure --with-ccsp-arch=<arch> --with-ccsp-platform=<platform>
make
make install
```

Optional features are described in the [Configuration Guide](./configuration-guide.md#build-options).

### Runtime

The `pppmanager` binary runs as a daemon by default. Use `-c` to run in console mode, and `-subsys` to set the subsystem prefix. See the [SSP Layer](./components/ssp.md) document for details.

## Key Interfaces

| Interface | Direction | Purpose |
|-----------|-----------|---------|
| CCSP message bus | Bidirectional | TR-181 `Device.PPP` get/set/validate/commit/rollback |
| nanomsg (`PPP_MANAGER_ADDR`) | Inbound | PPP state and event messages from `pppd` plugins |
| POSIX queue `/pppmgr_queue` | Internal | Events queued within the process |
| PSM | Read/Write | Persistent interface configuration and session ID |
| sysevent / syscfg | Read | `wan_proto`, `SYSEVENT_PPP_STATUS`, `UUID` |
| `/proc/net/pppoe`, `/proc/net/dev` | Read | PPPoE session data and interface counters |

## Related Documentation

- [Architecture: Component Diagram](./architecture/component-diagram.md)
- [Configuration Guide](./configuration-guide.md)
