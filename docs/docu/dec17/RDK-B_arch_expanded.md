# RDK-B Architecture - Expanded Diagram

## Architecture Overview

This diagram shows the expanded RDK-B architecture with detailed components from the reference specification, organized into 5 main layers:

- **Application Layer** - Web Apps, Operator Apps, 3rd Party Apps, and RDK Reference Apps
- **Middleware Layer** - IPC, CCSP Components (Legacy), and RDK Unified Components
- **HAL Layer** - Hardware Abstraction Layer interfaces
- **OSS Core** - Yocto oe-core packages and open source components
- **Platform Layer** - Linux Kernel, Bootloader, and SoC/OEM components

### Sample 1:

```mermaid
flowchart TB
    %% Application Layer
    subgraph APP[" "]
        A1[Web Apps]
        A2[Operator Apps]
        A3[3rd Party Apps]
        A4[RDK Reference Apps]
        A1 ~~~ A2 ~~~ A3 ~~~ A4
    end
    
    %% Middleware Layer
    subgraph MIDDLEWARE[" "]
        direction TB
        
        subgraph IPC[Rbus/Dbus IPC]
        end
        
        subgraph CCSP[CCSP Components Legacy]
            C1[CcspPandM]
            C2[CcspCr]
            C3[CcspPsm]
            C4[Utopia]
            C1 ~~~ C2 ~~~ C3 ~~~ C4
            C5[CcspEthAgent]
            C6[CcspMoca]
            C7[CcspXdns]
            C8[CcspLogAgent]
            C5 ~~~ C6 ~~~ C7 ~~~ C8
        end
        
        subgraph UNIFIED[RDK Unified Components]
            U1[RDKWanManager]
            U2[DhcpManager]
            U3[OneWifi]
            U4[RDKVlanManager]
            U5[BridgeManager]
            U1 ~~~ U2 ~~~ U3 ~~~ U4 ~~~ U5
            U6[RDKPPPManager]
            U7[RDKCellularManager]
            U8[RDKGPONManager]
            U9[RDKXdslManager]
            U6 ~~~ U7 ~~~ U8 ~~~ U9
        end
    end
    
    %% HAL Layer
    subgraph HAL[HAL]
        H1[WiFi HAL]
        H2[Ethernet HAL]
        H3[DHCP HAL]
        H4[XDSL HAL]
        H1 ~~~ H2 ~~~ H3 ~~~ H4
        H5[MoCA HAL]
        H6[Platform HAL]
        H7[Cellular HAL]
        H5 ~~~ H6 ~~~ H7
    end
    
    %% OSS Core
    subgraph OSS[Yocto oe-core packages, Other OSS, Security Patches]
        O1[systemd]
        O2[dbus]
        O3[iptables]
        O4[dnsmasq]
        O1 ~~~ O2 ~~~ O3 ~~~ O4
        O5[libhostap]
        O6[ModemManager]
        O7[busybox]
        O5 ~~~ O6 ~~~ O7
    end
    
    %% Platform Layer
    subgraph PLATFORM[Kernel, SDK, Vendor Libraries, Drivers and Bootloader]
        P1[Linux Kernel]
        P2[Bootloader]
        P3[SoC/OEM]
        P1 ~~~ P2 ~~~ P3
    end
    
    %% Connections
    APP --> MIDDLEWARE
    MIDDLEWARE --> HAL
    HAL --> OSS
    OSS --> PLATFORM
    
    %% Styling
    classDef appStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef middlewareStyle fill:#F0A30A,stroke:#333,stroke-width:3px,color:#000
    classDef halStyle fill:#1BA1E2,stroke:#333,stroke-width:3px,color:#000
    classDef ossStyle fill:#60A917,stroke:#333,stroke-width:3px,color:#000
    classDef platformStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef ipcStyle fill:#d5e8d4,stroke:#82b366,stroke-width:2px,color:#000
    classDef compStyle fill:#fff,stroke:#666,stroke-width:1px,color:#000
    
    class APP appStyle
    class MIDDLEWARE middlewareStyle
    class HAL halStyle
    class OSS ossStyle
    class PLATFORM platformStyle
    class IPC ipcStyle
    class CCSP,UNIFIED middlewareStyle
    class A1,A2,A3,A4,C1,C2,C3,C4,C5,C6,C7,C8,U1,U2,U3,U4,U5,U6,U7,U8,U9,H1,H2,H3,H4,H5,H6,H7,O1,O2,O3,O4,O5,O6,O7,P1,P2,P3 compStyle
```
### Sample 2:

```mermaid
flowchart TB
    %% Application Layer
    subgraph APP[" "]
        A1[Web Apps]
        A2[Operator Apps]
        A3[3rd Party Apps]
        A4[RDK Reference Apps]
        A1 ~~~ A2 ~~~ A3 ~~~ A4
    end
    
    %% Middleware Layer
    subgraph MIDDLEWARE[" "]
        direction TB
        
        subgraph IPC[Rbus/Dbus IPC]
        end
        
        subgraph REMOTE[Remote Management]
            R1[TR-369]
            R2[TR-069]
            R3[WebPA]
            R1 ~~~ R2 ~~~ R3
            R4[Webconfig]
            R5[SNMP]
            R6[SSH]
            R4 ~~~ R5 ~~~ R6
            R7[Local WebUI]
        end
        
        subgraph DEVICE[Device Management]
            D1[Firmware Upgrade]
            D2[Telemetry 2.0]
            D3[RFC]
            D1 ~~~ D2 ~~~ D3
            D4[Log Upload]
            D5[Crash Upload]
            D6[Log Rotation]
            D4 ~~~ D5 ~~~ D6
        end
        
        subgraph CCSP[CCSP Components Legacy]
            C1[CcspPandM]
            C2[CcspCr]
            C3[CcspPsm]
            C4[Utopia]
            C1 ~~~ C2 ~~~ C3 ~~~ C4
            C5[CcspCommonLib]
            C6[CcspEthAgent]
            C7[CcspMoca]
            C8[CcspXdns]
            C5 ~~~ C6 ~~~ C7 ~~~ C8
            C9[CcspLogAgent]
            C10[CcspLmLite]
            C11[CcspDmcli]
            C12[Test & Diag]
            C9 ~~~ C10 ~~~ C11 ~~~ C12
            C13[CcspHomeSec]
        end
        
        subgraph UNIFIED[RDK Unified Components]
            U1[RDKWanManager]
            U2[DhcpManager]
            U3[OneWifi]
            U4[RDKVlanManager]
            U1 ~~~ U2 ~~~ U3 ~~~ U4
            U5[BridgeManager]
            U6[RDKPPPManager]
            U7[RDKCellularManager]
            U8[RDKGPONManager]
            U5 ~~~ U6 ~~~ U7 ~~~ U8
            U9[RDKXdslManager]
            U10[RDKPlatformMgr]
            U11[Opensync]
            U12[Hotspot]
            U9 ~~~ U10 ~~~ U11 ~~~ U12
            U13[RDKTelcoVoiceMgr]
            U14[RDKLedManager]
            U13 ~~~ U14
        end
    end
    
    %% HAL Layer
    subgraph HAL[HAL]
        H1[WiFi HAL]
        H2[Ethernet HAL]
        H3[DHCP V4 HAL]
        H4[DHCP V6 HAL]
        H1 ~~~ H2 ~~~ H3 ~~~ H4
        H5[XDSL HAL]
        H6[MoCA HAL]
        H7[Platform HAL]
        H8[Cellular HAL]
        H5 ~~~ H6 ~~~ H7 ~~~ H8
        H9[VLAN HAL]
        H10[Voice HAL]
        H11[MTA HAL]
        H12[MSO HAL]
        H9 ~~~ H10 ~~~ H11 ~~~ H12
        H13[FW Upgrade HAL]
        H14[DPOE HAL]
        H13 ~~~ H14
    end
    
    %% OSS Core
    subgraph OSS[Yocto oe-core packages, Other OSS, Security Patches]
        O1[systemd]
        O2[dbus]
        O3[iptables]
        O4[dnsmasq]
        O1 ~~~ O2 ~~~ O3 ~~~ O4
        O5[libhostap]
        O6[ModemManager]
        O7[busybox]
        O8[Bridge Utils]
        O5 ~~~ O6 ~~~ O7 ~~~ O8
        O9[VLAN Utils]
        O10[Wireless Tools]
        O11[UPnP]
        O12[IGMP Proxy]
        O9 ~~~ O10 ~~~ O11 ~~~ O12
        O13[wget/curl]
        O14[Libqmi]
        O15[Dibbler]
        O13 ~~~ O14 ~~~ O15
    end
    
    %% Platform Layer
    subgraph PLATFORM[Kernel, SDK, Vendor Libraries, Drivers and Bootloader]
        P1[Linux Kernel & Drivers]
        P2[Bootloader]
        P1 ~~~ P2
        P3[Vendor Libraries]
        P4[SoC/OEM]
        P3 ~~~ P4
    end
    
    %% Connections
    APP --> MIDDLEWARE
    MIDDLEWARE --> HAL
    HAL --> OSS
    OSS --> PLATFORM
    
    %% Styling
    classDef appStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef middlewareStyle fill:#F0A30A,stroke:#333,stroke-width:3px,color:#000
    classDef remoteStyle fill:#f8cecc,stroke:#b85450,stroke-width:2px,color:#000
    classDef deviceStyle fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000
    classDef halStyle fill:#1BA1E2,stroke:#333,stroke-width:3px,color:#000
    classDef ossStyle fill:#60A917,stroke:#333,stroke-width:3px,color:#000
    classDef platformStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef ipcStyle fill:#d5e8d4,stroke:#82b366,stroke-width:2px,color:#000
    classDef compStyle fill:#fff,stroke:#666,stroke-width:1px,color:#000
    
    class APP appStyle
    class MIDDLEWARE middlewareStyle
    class REMOTE remoteStyle
    class DEVICE deviceStyle
    class HAL halStyle
    class OSS ossStyle
    class PLATFORM platformStyle
    class IPC ipcStyle
    class CCSP,UNIFIED middlewareStyle
    class A1,A2,A3,A4 compStyle
    class R1,R2,R3,R4,R5,R6,R7 compStyle
    class D1,D2,D3,D4,D5,D6 compStyle
    class C1,C2,C3,C4,C5,C6,C7,C8,C9,C10,C11,C12,C13 compStyle
    class U1,U2,U3,U4,U5,U6,U7,U8,U9,U10,U11,U12,U13,U14 compStyle
    class H1,H2,H3,H4,H5,H6,H7,H8,H9,H10,H11,H12,H13,H14 compStyle
    class O1,O2,O3,O4,O5,O6,O7,O8,O9,O10,O11,O12,O13,O14,O15 compStyle
    class P1,P2,P3,P4 compStyle
```
### Sample 3:

```mermaid
flowchart TB
    %% Application Layer
    subgraph APP[" "]
        A1[Web Apps]
        A2[Operator Apps]
        A3[3rd Party Apps]
        A1 ~~~ A2 ~~~ A3
        A4[RDK Reference Apps]
    end
    
    %% Middleware Layer
    subgraph MIDDLEWARE[" "]
        direction TB
        
        subgraph CCSP[CCSP Components Legacy]
            C1[CcspPandM]
            C2[CcspCr]
            C3[CcspPsm]
            C1 ~~~ C2 ~~~ C3
            C4[Utopia]
            C5[CcspCommonLib]
            C6[CcspEthAgent]
            C4 ~~~ C5 ~~~ C6
            C7[CcspMoca]
            C8[CcspXdns]
            C9[CcspLogAgent]
            C7 ~~~ C8 ~~~ C9
            C10[CcspLmLite]
            C11[CcspDmcli]
            C12[Test & Diag]
            C10 ~~~ C11 ~~~ C12
            C13[CcspHomeSec]
        end
        
        subgraph UNIFIED[RDK Unified Components]
            U1[RDKWanManager]
            U2[DhcpManager]
            U3[OneWifi]
            U1 ~~~ U2 ~~~ U3
            U4[RDKVlanManager]
            U5[BridgeManager]
            U6[RDKPPPManager]
            U4 ~~~ U5 ~~~ U6
            U7[RDKCellularManager]
            U8[RDKGPONManager]
            U9[RDKXdslManager]
            U7 ~~~ U8 ~~~ U9
            U10[RDKPlatformMgr]
            U11[Opensync]
            U12[Hotspot]
            U10 ~~~ U11 ~~~ U12
            U13[RDKTelcoVoiceMgr]
            U14[RDKLedManager]
            U13 ~~~ U14
        end
        
        CCSP ~~~ UNIFIED
        
        subgraph IPC[Rbus/Dbus IPC]
        end
        
        subgraph REMOTE[Remote Management]
            R1[TR-369]
            R2[TR-069]
            R3[WebPA]
            R1 ~~~ R2 ~~~ R3
            R4[Webconfig]
            R5[SNMP]
            R6[SSH]
            R4 ~~~ R5 ~~~ R6
            R7[Local WebUI]
        end
        
        subgraph DEVICE[Device Management]
            D1[Firmware Upgrade]
            D2[Telemetry 2.0]
            D3[RFC]
            D1 ~~~ D2 ~~~ D3
            D4[Log Upload]
            D5[Crash Upload]
            D6[Log Rotation]
            D4 ~~~ D5 ~~~ D6
        end
        
        IPC ~~~ REMOTE ~~~ DEVICE
    end
    
    %% HAL Layer
    subgraph HAL[HAL]
        H1[WiFi HAL]
        H2[Ethernet HAL]
        H3[DHCP V4 HAL]
        H1 ~~~ H2 ~~~ H3
        H4[DHCP V6 HAL]
        H5[XDSL HAL]
        H6[MoCA HAL]
        H4 ~~~ H5 ~~~ H6
        H7[Platform HAL]
        H8[Cellular HAL]
        H9[VLAN HAL]
        H7 ~~~ H8 ~~~ H9
        H10[Voice HAL]
        H11[MTA HAL]
        H12[MSO HAL]
        H10 ~~~ H11 ~~~ H12
        H13[FW Upgrade HAL]
        H14[DPOE HAL]
        H13 ~~~ H14
    end
    
    %% OSS Core
    subgraph OSS[Yocto oe-core packages, Other OSS, Security Patches]
        O1[systemd]
        O2[dbus]
        O3[iptables]
        O1 ~~~ O2 ~~~ O3
        O4[dnsmasq]
        O5[libhostap]
        O6[ModemManager]
        O4 ~~~ O5 ~~~ O6
        O7[busybox]
        O8[Bridge Utils]
        O9[VLAN Utils]
        O7 ~~~ O8 ~~~ O9
        O10[Wireless Tools]
        O11[UPnP]
        O12[IGMP Proxy]
        O10 ~~~ O11 ~~~ O12
        O13[wget/curl]
        O14[Libqmi]
        O15[Dibbler]
        O13 ~~~ O14 ~~~ O15
    end
    
    %% Platform Layer
    subgraph PLATFORM[Kernel, SDK, Vendor Libraries, Drivers and Bootloader]
        P1[Linux Kernel & Drivers]
        P2[Bootloader]
        P3[Vendor Libraries]
        P1 ~~~ P2 ~~~ P3
        P4[SoC/OEM]
    end
    
    %% Connections
    APP --> MIDDLEWARE
    MIDDLEWARE --> HAL
    HAL --> OSS
    OSS --> PLATFORM
    
    %% Styling
    classDef appStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef middlewareStyle fill:#F0A30A,stroke:#333,stroke-width:3px,color:#000
    classDef remoteStyle fill:#f8cecc,stroke:#b85450,stroke-width:2px,color:#000
    classDef deviceStyle fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000
    classDef halStyle fill:#1BA1E2,stroke:#333,stroke-width:3px,color:#000
    classDef ossStyle fill:#60A917,stroke:#333,stroke-width:3px,color:#000
    classDef platformStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef ipcStyle fill:#d5e8d4,stroke:#82b366,stroke-width:2px,color:#000
    classDef compStyle fill:#fff,stroke:#666,stroke-width:1px,color:#000
    
    class APP appStyle
    class MIDDLEWARE middlewareStyle
    class REMOTE remoteStyle
    class DEVICE deviceStyle
    class HAL halStyle
    class OSS ossStyle
    class PLATFORM platformStyle
    class IPC ipcStyle
    class CCSP,UNIFIED middlewareStyle
    class A1,A2,A3,A4 compStyle
    class R1,R2,R3,R4,R5,R6,R7 compStyle
    class D1,D2,D3,D4,D5,D6 compStyle
    class C1,C2,C3,C4,C5,C6,C7,C8,C9,C10,C11,C12,C13 compStyle
    class U1,U2,U3,U4,U5,U6,U7,U8,U9,U10,U11,U12,U13,U14 compStyle
    class H1,H2,H3,H4,H5,H6,H7,H8,H9,H10,H11,H12,H13,H14 compStyle
    class O1,O2,O3,O4,O5,O6,O7,O8,O9,O10,O11,O12,O13,O14,O15 compStyle
    class P1,P2,P3,P4 compStyle
```
### Sample 4:

```mermaid
flowchart TB
    %% Application Layer
    subgraph APP[" "]
        A1[Web Apps]
        A2[Operator Apps]
        A3[3rd Party Apps]
        A1 ~~~ A2 ~~~ A3
        A4[RDK Reference Apps]
    end
    
    %% Middleware Layer
    subgraph MIDDLEWARE[" "]
        direction TB
        
        subgraph CCSP[Ccsp components]
            C1[Webui]
            C2[WebPa]
            C3[Provisioning & Mgmnt]
            C1 ~~~ C2 ~~~ C3
            C4[CcspCr]
            C5[CcspCommonLibrary]
            C6[hotspot]
            C4 ~~~ C5 ~~~ C6
            C7[CcspCMAgent]
            C8[Persistent Storage]
            C9[Utopia]
            C7 ~~~ C8 ~~~ C9
            C10[CcspEthAgent]
            C11[CcspWifiAgent]
            C12[CcspPandM]
            C10 ~~~ C11 ~~~ C12
            C13[CcspPsm]
            C14[CcspLMLite]
            C15[CcspDmCli]
            C13 ~~~ C14 ~~~ C15
        end
        
        subgraph UNIFIED[RDK Unified Components]
            U1[Onewifi]
            U2[RDK VlanBridgeManager]
            U3[RDK Gpon Manager]
            U1 ~~~ U2 ~~~ U3
            U4[RDK Ppp Manager]
            U5[RDK WAN Manager]
            U6[RDK Telco Voice Manager]
            U4 ~~~ U5 ~~~ U6
            U7[RDK Cellular Manager-MM]
        end
        
        subgraph GENERIC[Generic open source components]
            G1[IP Tables]
            G2[IGMP Proxy]
            G3[UPNP IGD]
            G1 ~~~ G2 ~~~ G3
            G4[Bridge Utils]
        end
        
        CCSP ~~~ UNIFIED ~~~ GENERIC
        
        subgraph IPC[Rbus/Dbus IPC]
        end
        
        subgraph REMOTE[Remote Management]
            R1[TR-369]
            R2[TR-069]
            R3[WebPA]
            R1 ~~~ R2 ~~~ R3
            R4[Webconfig]
            R5[SNMP]
            R6[SSH]
            R4 ~~~ R5 ~~~ R6
            R7[Local WebUI]
        end
        
        subgraph DEVICE[Device Management]
            D1[Firmware Upgrade]
            D2[Telemetry 2.0]
            D3[RFC]
            D1 ~~~ D2 ~~~ D3
            D4[Log Upload]
            D5[Crash Upload]
            D6[Log Rotation]
            D4 ~~~ D5 ~~~ D6
        end
        
        IPC ~~~ REMOTE ~~~ DEVICE
        GENERIC ~~~ IPC
    end
    
    %% HAL Layer
    subgraph HAL[HAL]
        H1[WiFi HAL]
        H2[Ethernet HAL]
        H3[DHCP V4 HAL]
        H1 ~~~ H2 ~~~ H3
        H4[DHCP V6 HAL]
        H5[XDSL HAL]
        H6[MoCA HAL]
        H4 ~~~ H5 ~~~ H6
        H7[Platform HAL]
        H8[Cellular HAL]
        H9[VLAN HAL]
        H7 ~~~ H8 ~~~ H9
        H10[Voice HAL]
        H11[MTA HAL]
        H12[MSO HAL]
        H10 ~~~ H11 ~~~ H12
        H13[FW Upgrade HAL]
        H14[DPOE HAL]
        H13 ~~~ H14
    end
    
    %% OSS Core
    subgraph OSS[Yocto oe-core packages, Other OSS, Security Patches]
        O1[systemd]
        O2[dbus]
        O3[iptables]
        O1 ~~~ O2 ~~~ O3
        O4[dnsmasq]
        O5[libhostap]
        O6[ModemManager]
        O4 ~~~ O5 ~~~ O6
        O7[busybox]
        O8[Bridge Utils]
        O9[VLAN Utils]
        O7 ~~~ O8 ~~~ O9
        O10[Wireless Tools]
        O11[UPnP]
        O12[IGMP Proxy]
        O10 ~~~ O11 ~~~ O12
        O13[wget/curl]
        O14[Libqmi]
        O15[Dibbler]
        O13 ~~~ O14 ~~~ O15
    end
    
    %% Platform Layer
    subgraph PLATFORM[Kernel, SDK, Vendor Libraries, Drivers and Bootloader]
        P1[Linux Kernel & Drivers]
        P2[Bootloader]
        P3[Vendor Libraries]
        P1 ~~~ P2 ~~~ P3
        P4[SoC/OEM]
    end
    
    %% Connections
    APP --> MIDDLEWARE
    MIDDLEWARE --> HAL
    HAL --> OSS
    OSS --> PLATFORM
    
    %% Styling
    classDef appStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef middlewareStyle fill:#F0A30A,stroke:#333,stroke-width:3px,color:#000
    classDef remoteStyle fill:#f8cecc,stroke:#b85450,stroke-width:2px,color:#000
    classDef deviceStyle fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000
    classDef halStyle fill:#1BA1E2,stroke:#333,stroke-width:3px,color:#000
    classDef ossStyle fill:#60A917,stroke:#333,stroke-width:3px,color:#000
    classDef platformStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef ipcStyle fill:#d5e8d4,stroke:#82b366,stroke-width:2px,color:#000
    classDef compStyle fill:#fff,stroke:#666,stroke-width:1px,color:#000
    
    class APP appStyle
    class MIDDLEWARE middlewareStyle
    class REMOTE remoteStyle
    class DEVICE deviceStyle
    class HAL halStyle
    class OSS ossStyle
    class PLATFORM platformStyle
    class IPC ipcStyle
    class CCSP,UNIFIED,GENERIC middlewareStyle
    class A1,A2,A3,A4 compStyle
    class R1,R2,R3,R4,R5,R6,R7 compStyle
    class D1,D2,D3,D4,D5,D6 compStyle
    class C1,C2,C3,C4,C5,C6,C7,C8,C9,C10,C11,C12,C13,C14,C15 compStyle
    class U1,U2,U3,U4,U5,U6,U7 compStyle
    class G1,G2,G3,G4 compStyle
    class H1,H2,H3,H4,H5,H6,H7,H8,H9,H10,H11,H12,H13,H14 compStyle
    class O1,O2,O3,O4,O5,O6,O7,O8,O9,O10,O11,O12,O13,O14,O15 compStyle
    class P1,P2,P3,P4 compStyle
```
### Sample 5:

```mermaid
flowchart TB
    %% Application Layer
    subgraph ROW1[" "]
        direction LR
        APPLABEL["<b>Application<br/>Layer</b>"]
        subgraph APP[" "]
            A1["Web Apps | Operator Apps | 3rd Party Apps | RDK Reference Apps"]
        end
        APPLABEL ~~~ APP
    end
    
    %% Middleware Layer
    subgraph ROW2[" "]
        direction LR
        MIDLABEL["<b>Middleware<br/>Layer</b>"]
        subgraph MIDDLEWARE[" "]
            direction LR
            
            subgraph CCSP["Ccsp components"]
                C1["• Webui<br/>• WebPa<br/>• Provisioning & Mgmnt<br/>• CcspCr<br/>• CcspCommonLibrary<br/>• hotspot<br/>• CcspCMAgent<br/>• Persistent Storage<br/>• Utopia<br/>• CcspEthAgent<br/>• CcspWifiAgent<br/>• CcspPandM<br/>• CcspPsm<br/>• CcspLMLite<br/>• CcspDmCli"]
            end
            
            subgraph UNIFIED["RDK Unified Components"]
                U1["• Onewifi<br/>• RDK VlanBridgeManager<br/>• RDK Gpon Manager<br/>• RDK Ppp Manager<br/>• RDK WAN Manager<br/>• RDK Telco Voice Manager<br/>• RDK Cellular Manager-MM"]
            end
            
            subgraph GENERIC["Generic open source components"]
                G1["• IP Tables<br/>• IGMP Proxy<br/>• UPNP IGD<br/>• Bridge Utils"]
            end
            
            subgraph IPC["Rbus/Dbus IPC"]
                I1[" "]
            end
            
            subgraph REMOTE["Remote Management"]
                R1["• TR-369<br/>• TR-069<br/>• WebPA<br/>• Webconfig<br/>• SNMP<br/>• SSH<br/>• Local WebUI"]
            end
            
            subgraph DEVICE["Device Management"]
                D1["• Firmware Upgrade<br/>• Telemetry 2.0<br/>• RFC<br/>• Log Upload<br/>• Crash Upload<br/>• Log Rotation"]
            end
            
            CCSP ~~~ UNIFIED ~~~ GENERIC
            IPC ~~~ REMOTE ~~~ DEVICE
        end
        MIDLABEL ~~~ MIDDLEWARE
    end
    
    %% HAL Layer
    subgraph ROW3[" "]
        direction LR
        HALLABEL["<b>HAL<br/>Layer</b>"]
        subgraph HAL[" "]
            H1["WiFi HAL | Ethernet HAL | DHCP V4 HAL | DHCP V6 HAL | XDSL HAL | MoCA HAL | Platform HAL<br/>Cellular HAL | VLAN HAL | Voice HAL | MTA HAL | MSO HAL | FW Upgrade HAL | DPOE HAL"]
        end
        HALLABEL ~~~ HAL
    end
    
    %% OSS Core
    subgraph ROW4[" "]
        direction LR
        OSSLABEL["<b>OSS Core<br/>Layer</b>"]
        subgraph OSS[" "]
            O1["systemd | dbus | iptables | dnsmasq | libhostap | ModemManager | busybox<br/>Bridge Utils | VLAN Utils | Wireless Tools | UPnP | IGMP Proxy | wget/curl | Libqmi | Dibbler"]
        end
        OSSLABEL ~~~ OSS
    end
    
    %% Platform Layer
    subgraph ROW5[" "]
        direction LR
        PLATLABEL["<b>Platform<br/>Layer</b>"]
        subgraph PLATFORM[" "]
            P1["Linux Kernel & Drivers | Bootloader | Vendor Libraries | SoC/OEM"]
        end
        PLATLABEL ~~~ PLATFORM
    end
    
    %% Connections
    ROW1 --> ROW2
    ROW2 --> ROW3
    ROW3 --> ROW4
    ROW4 --> ROW5
    
    %% Styling
    classDef appStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef middlewareStyle fill:#F0A30A,stroke:#333,stroke-width:3px,color:#000
    classDef halStyle fill:#1BA1E2,stroke:#333,stroke-width:3px,color:#000
    classDef ossStyle fill:#60A917,stroke:#333,stroke-width:3px,color:#000
    classDef platformStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef compStyle fill:#fff,stroke:#666,stroke-width:1px,color:#000,text-align:left
    classDef subgraphStyle fill:#F0A30A,stroke:#333,stroke-width:2px,color:#000
    classDef labelStyle fill:#666,stroke:#333,stroke-width:2px,color:#fff
    classDef rowStyle fill:none,stroke:none
    
    class APP appStyle
    class MIDDLEWARE middlewareStyle
    class HAL halStyle
    class OSS ossStyle
    class PLATFORM platformStyle
    class CCSP,UNIFIED,GENERIC,IPC,REMOTE,DEVICE subgraphStyle
    class A1,C1,U1,G1,I1,R1,D1,H1,O1,P1 compStyle
    class APPLABEL,MIDLABEL,HALLABEL,OSSLABEL,PLATLABEL labelStyle
    class ROW1,ROW2,ROW3,ROW4,ROW5 rowStyle
```

## Layer Details

### Application Layer (Orange)
Contains various application types that run on the RDK-B platform.

### Middleware Layer (Orange/Yellow)
- **Rbus/Dbus IPC**: Inter-process communication layer
- **CCSP Components**: Legacy Common Component Software Platform components
- **RDK Unified Components**: Modern RDK components for network management

### HAL Layer (Blue)
Hardware abstraction layer providing standardized interfaces to hardware components.

### OSS Core Layer (Green)
Open source software packages and utilities from Yocto/Linux ecosystem.

### Platform Layer (Orange)
Low-level system components including kernel, bootloader, and vendor-specific implementations.


```mermaid
flowchart TB
    %% Application Layer
    subgraph APP[" "]
        A1["Web Apps | Operator Apps | 3rd Party Apps | RDK Reference Apps"]
    end
    
    %% Middleware Layer
    subgraph MIDDLEWARE[" "]
        direction LR
        
        subgraph CCSP["Ccsp components"]
            C1["• Webui<br/>• WebPa<br/>• Provisioning & Mgmnt<br/>• CcspCr<br/>• CcspCommonLibrary<br/>• hotspot<br/>• CcspCMAgent<br/>• Persistent Storage<br/>• Utopia<br/>• CcspEthAgent<br/>• CcspWifiAgent<br/>• CcspPandM<br/>• CcspPsm<br/>• CcspLMLite<br/>• CcspDmCli"]
        end
        
        subgraph UNIFIED["RDK Unified Components"]
            U1["• Onewifi<br/>• RDK VlanBridgeManager<br/>• RDK Gpon Manager<br/>• RDK Ppp Manager<br/>• RDK WAN Manager<br/>• RDK Telco Voice Manager<br/>• RDK Cellular Manager-MM"]
        end
        
        subgraph GENERIC["Generic open source components"]
            G1["• IP Tables<br/>• IGMP Proxy<br/>• UPNP IGD<br/>• Bridge Utils"]
        end
        
        subgraph IPC["Rbus/Dbus IPC"]
            I1[" "]
        end
        
        subgraph REMOTE["Remote Management"]
            R1["• TR-369<br/>• TR-069<br/>• WebPA<br/>• Webconfig<br/>• SNMP<br/>• SSH<br/>• Local WebUI"]
        end
        
        subgraph DEVICE["Device Management"]
            D1["• Firmware Upgrade<br/>• Telemetry 2.0<br/>• RFC<br/>• Log Upload<br/>• Crash Upload<br/>• Log Rotation"]
        end
        
        CCSP ~~~ UNIFIED ~~~ GENERIC
        IPC ~~~ REMOTE ~~~ DEVICE
    end
    
    %% HAL Layer
    subgraph HAL["HAL"]
        H1["WiFi HAL | Ethernet HAL | DHCP V4 HAL | DHCP V6 HAL | XDSL HAL | MoCA HAL | Platform HAL<br/>Cellular HAL | VLAN HAL | Voice HAL | MTA HAL | MSO HAL | FW Upgrade HAL | DPOE HAL"]
    end
    
    %% OSS Core
    subgraph OSS["Yocto oe-core packages, Other OSS, Security Patches"]
        O1["systemd | dbus | iptables | dnsmasq | libhostap | ModemManager | busybox<br/>Bridge Utils | VLAN Utils | Wireless Tools | UPnP | IGMP Proxy | wget/curl | Libqmi | Dibbler"]
    end
    
    %% Platform Layer
    subgraph PLATFORM["Kernel, SDK, Vendor Libraries, Drivers and Bootloader"]
        P1["Linux Kernel & Drivers | Bootloader | Vendor Libraries | SoC/OEM"]
    end
    
    %% Connections
    APP --> MIDDLEWARE
    MIDDLEWARE --> HAL
    HAL --> OSS
    OSS --> PLATFORM
    
    %% Styling
    classDef appStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef middlewareStyle fill:#F0A30A,stroke:#333,stroke-width:3px,color:#000
    classDef halStyle fill:#1BA1E2,stroke:#333,stroke-width:3px,color:#000
    classDef ossStyle fill:#60A917,stroke:#333,stroke-width:3px,color:#000
    classDef platformStyle fill:#E27100,stroke:#333,stroke-width:3px,color:#000
    classDef compStyle fill:#fff,stroke:#666,stroke-width:1px,color:#000,text-align:left
    classDef subgraphStyle fill:#F0A30A,stroke:#333,stroke-width:2px,color:#000
    
    class APP appStyle
    class MIDDLEWARE middlewareStyle
    class HAL halStyle
    class OSS ossStyle
    class PLATFORM platformStyle
    class CCSP,UNIFIED,GENERIC,IPC,REMOTE,DEVICE subgraphStyle
    class A1,C1,U1,G1,I1,R1,D1,H1,O1,P1 compStyle
```




