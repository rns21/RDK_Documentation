# Configuration Guide

## Overview

This guide covers the build options, platform integration points, and TR-181 parameters that control PPP Manager. Parameter names and types are taken from `config/RdkPppManager.xml`. Build options are taken from `configure.ac` and the `Makefile.am` files.

## Build Options

| Option | Effect |
|--------|--------|
| `--with-ccsp-arch=<arch>` | Sets the CCSP architecture |
| `--with-ccsp-platform=<platform>` | Sets the CCSP platform |
| `--enable-notify` | Defines `ENABLE_SD_NOTIFY` and links `-lsystemd` |
| `--enable-dropearly` | Defines `DROP_ROOT_EARLY` |

`configure.ac` also sets the `GIT_VERSION` macro from `git describe`.

Source-only macros are not set by any build file in this repository. Define them in the platform build if the feature is needed:

| Macro | Purpose |
|-------|---------|
| `USE_PPP_DAEMON` | Starts `pppd` directly instead of through `pppoe-start` |
| `DUID_UUID_ENABLE` | Generates a DUID file from the `UUID` syscfg value |
| `PPP_USERNAME_PASSWORD_FROM_PSM` | Stores and reads username and password in PSM |
| `DYNAMIC_CONFIGURE_PPP_LOWERLAYER` | Enables the dynamic lower-layer configuration code path |

## Platform Integration

1. **Install the data model definition.** The SSP layer registers `/usr/rdk/pppmanager/RdkPppManager.xml` with the Component Registry at startup. Install `config/RdkPppManager.xml` to that path.
2. **Provide the nanomsg address.** `PPP_MANAGER_ADDR` must be defined in `ipc_msg.h` on the platform build path. The `pppd` plugins must use the same address.
3. **Provide the PPP plugins.** PPPoE and PPPoA sessions use `/usr/lib/pppd/2.4.9/rp-pppoe.so` and `pppoatm.so` as hard-coded paths in `pppmgr_dml_ppp_apis.c`.
4. **Provide the PPPoE helper scripts.** In the default build (`USE_PPP_DAEMON` undefined), the component runs `pppoe_config.sh`, `/usr/sbin/pppoe-start`, and `/usr/sbin/pppoe-stop`.
5. **Provide syscfg and sysevent keys.** The component reads `wan_proto`, `UUID` (when `DUID_UUID_ENABLE` is defined), and `SYSEVENT_PPP_STATUS`.

### Configuration Tree

```
/usr/rdk/pppmanager/
└── RdkPppManager.xml          # TR-181 data model (installed from config/)

PSM (dmsb.pppmanager.*)
├── pppifcount                 # Number of configured interfaces
└── if.<N>.*                   # Per-interface settings (see below)
```

## TR-181 Parameter Reference

All parameters are under `Device.PPP`.

### PPP

| Parameter | Type | Access | Description |
|-----------|------|--------|-------------|
| `SupportedNCPs` | string | Not writable | Supported network control protocols |
| `InterfaceNumberOfEntries` | unsignedInt | Not writable | Number of `Interface` entries |

### Interface

The `Interface` table holds up to 128 entries.

| Parameter | Type | Description |
|-----------|------|-------------|
| `Enable` | boolean | Starts or stops the PPP session |
| `IPCPEnable` | boolean | Enables IPv4 control protocol |
| `IPv6CPEnable` | boolean | Enables IPv6 control protocol |
| `Status` | enum | Interface state |
| `Alias` | string | Alias name |
| `Name` | string | Interface name |
| `LastChange` | unsignedInt | Time since the last status change |
| `LowerLayers` | string | Lower-layer reference |
| `Reset` | boolean | Writable in the data model; the reset behavior is handled in `pppmgr_dml.c` |
| `ConnectionStatus` | enum | Session state |
| `LastConnectionError` | enum | Most recent connection error |
| `AutoDisconnectTime` | unsignedInt | Time after which the session is disconnected automatically |
| `IdleDisconnectTime` | unsignedInt | Idle time before disconnect |
| `WarnDisconnectDelay` | unsignedInt | Delay before the disconnect warning |
| `Username` | string(64) | PPP username |
| `Password` | string(64) | PPP password |
| `EncryptionProtocol` | enum | `None`, `MPPE` |
| `CompressionProtocol` | enum | `None`, `Van Jacobson`, `STAC LZS` |
| `AuthenticationProtocol` | enum | `PAP`, `CHAP`, `MS-CHAP`, `AUTO` |
| `MaxMRUSize` | unsignedInt | Maximum receive unit, range 1280 to 1500 |
| `CurrentMRUSize` | unsignedInt | Current receive unit, range 1 to 1540 |
| `X_T_ONLINE_DE_SRU` | unsignedInt | Vendor-specific parameter defined in the XML; no behavior is implemented in this repository |
| `X_T_ONLINE_DE_SRD` | unsignedInt | Vendor-specific parameter defined in the XML; no behavior is implemented in this repository |
| `ConnectionTrigger` | enum | `OnDemand`, `AlwaysOn`, `Manual` |
| `X_RDK_LinkType` | enum | `PPPoA`, `PPPoE` |
| `LCPEcho` | unsignedInt | LCP echo interval, default 30 |
| `LCPEchoRetry` | unsignedInt | LCP echo retry count, default 3 |

### Interface Sub-objects

| Object | Parameters |
|--------|------------|
| `PPPoE` | `SessionID`, `ACName`, `ServiceName` |
| `IPCP` | `LocalIPAddress`, `RemoteIPAddress`, `DNSServers`, `PassthroughEnable`, `PassthroughDHCPPool` |
| `IPv6CP` | `LocalInterfaceIdentifier`, `RemoteInterfaceIdentifier` |
| `Stats` | 16 read-only `unsignedInt` counters, from `BytesSent` through `UnknownProtoPacketsReceived` |

## Enumerations

| Enumeration | Values |
|-------------|--------|
| Link type | PPPoA (1), PPPoE (2) |
| Interface status | Up, Down, Unknown, Dormant, NotPresent, LowerLayerDown, Error |
| Connection status | Unconfigured through AuthenticationFailed |
| Last connection error | 23 values, from `ERROR_NONE` to `ERROR_UNKNOWN` |
| Authentication protocol | PAP, CHAP, MS_CHAP, AUTO |

The full list of `LastConnectionError` values is defined in `pppmgr_dml.h`.

## Persistent Storage Keys

Interface settings are stored in PSM under the `dmsb.pppmanager.*` prefix. Entries use the instance number in place of `<N>`:

| Key | Content |
|-----|---------|
| `dmsb.pppmanager.pppifcount` | Number of interfaces |
| `dmsb.pppmanager.if.<N>.ServiceName` | PPPoE service name |
| `dmsb.pppmanager.if.<N>.Name` | Interface name |
| `dmsb.pppmanager.if.<N>.Alias` | Alias |
| `dmsb.pppmanager.if.<N>.AuthenticationProtocol` | Authentication protocol |
| `dmsb.pppmanager.if.<N>.lastconnectionerror` | Last connection error |
| `dmsb.pppmanager.if.<N>.idletime` | Idle disconnect time |
| `dmsb.pppmanager.if.<N>.maxmrusize` | Maximum MRU size |
| `dmsb.pppmanager.if.<N>.linktype` | Link type |
| `dmsb.pppmanager.if.<N>.LowerLayer` | Lower-layer reference |
| `dmsb.pppmanager.if.<N>.sessionid` | PPPoE session ID (see [Known Issues](#known-issues)) |

Username and password keys are used only when `PPP_USERNAME_PASSWORD_FROM_PSM` is defined.

## Troubleshooting

| Symptom | Likely cause | Check |
|---------|--------------|-------|
| `ConnectionStatus` does not leave `Connecting` | `pppd` is not running, or the plugin cannot reach the nanomsg address | Confirm `PPP_MANAGER_ADDR` matches the plugin build and that `pppd` is running |
| `LastConnectionError` shows `ERROR_AUTHENTICATION_FAILURE` | `pppd` exited with status 11 or 19 | Verify `Username`, `Password`, and `AuthenticationProtocol` |
| `LastConnectionError` shows `ERROR_ISP_TIME_OUT` | `pppd` exited with status 16 | Check the physical link and the `ACName` and `ServiceName` values |
| `LastConnectionError` shows `ERROR_UNKNOWN` | `pppd` exited with a status not in the mapping | Review the `pppd` log for the exit reason |

## Best Practices

- Keep `MaxMRUSize` within 1280 to 1500 to match the TR-181 range.
- Set `Username`, `Password`, and `AuthenticationProtocol` together, then commit the changes.
- Test `AutoDisconnectTime` before relying on it. It is implemented with a `sleep` and `pppoe-stop` shell command in `pppmgr_dml.c`.

## Known Issues

- In `pppmgr_ipc.c`, the session-ID write on `PPP_INTERFACE_UP` passes the PSM key macro without substituting the instance number. The key written is `dmsb.pppmanager.if.%ld.sessionid` instead of the per-instance key.
- The `Author` field in `pppmgr_ssp_action.c` is still the template placeholder value.
