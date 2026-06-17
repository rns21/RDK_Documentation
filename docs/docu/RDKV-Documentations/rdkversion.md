now ill just add all the comments and suggestions here, just modify the md file and in the review fixes folder create a file for cellularmm to explain the resolutions

1.line 304
This startup dependency list appears incomplete compared to the repository's systemd_units/RdkCellularManager.service (it also specifies utopia.service and RdkWanManager.service in After=). Keeping this list aligned helps integrators bring the service up reliably.

suggested:  - **Systemd Services**: `utopia.service`, `CcspCrSsp.service`, `PsmSsp.service`, `RdkWanManager.service` must be active before `RdkCellularManager.service` starts

2.line 438to442
The TR-181 object hierarchy omits the implemented top-level vendor extensions Device.Cellular.X_RDK_Enable and Device.Cellular.X_RDK_Status (both are exposed as RBUS properties/events). Without listing them here, the README implies X_RDK_Status exists under Interface.{i}, which does not match the implementation.
suggested:` └── Cellular.
``     ├── RoamingEnabled (boolean, R/W)
``     ├── RoamingStatus (string, R)
``     ├── X_RDK_Enable (boolean, R/W)
``     ├── X_RDK_Status (string, R)
``     ├── InterfaceNumberOfEntries (unsignedInt, R)
``     ├── AccessPointNumberOfEntries (unsignedInt, R)
``     └── Interface.{i}.
`

3.line 451to455
These interface parameter names/paths don’t match what the component actually registers on RBUS: the implementation uses PreferredAccessTechnologies (plural) and exposes network-in-use under X_RDK_PlmnAccess.NetworkInUse.* (not Interface.{i}.NetworkInUse).
suggested:`         ├── Upstream (boolean, R)
``         ├── IMEI (string, R)
``         ├── SupportedAccessTechnologies (string, R)
``         ├── PreferredAccessTechnology (string, R/W)
``         ├── PreferredAccessTechnologies (string, R/W)
``         ├── CurrentAccessTechnology (string, R)
``         ├── NetworkInUse (string, R)
``         ├── X_RDK_PlmnAccess.NetworkInUse.Name (string, R)
``         ├── RSSI (int, R)
``         ├── RSRP (int, R)
``         ├── RSRQ (int, R)
`

4.The README lists SNR, X_RDK_Status, and X_RDK_LinkAvailability under Interface.{i}, but the RBUS data model exposes X_RDK_SNR and link/phy booleans (X_RDK_LinkAvailableStatus, X_RDK_PhyConnectedStatus). Device.Cellular.X_RDK_Status is a top-level parameter (not per-interface).
suggested:
`         ├── RSSI (int, R)
``         ├── RSRP (int, R)
``         ├── RSRQ (int, R)
``         ├── SNR (int, R)
``         ├── X_RDK_Status (string, R)
``         ├── X_RDK_LinkAvailability (string, R)
``         ├── X_RDK_SNR (int, R)
``         ├── X_RDK_PhyConnectedStatus (boolean, R)
``         ├── X_RDK_LinkAvailableStatus (boolean, R)
``         ├── USIM.
``         │   ├── Status (string, R)
``         │   ├── IMSI (string, R)

5.line 459to461
The TR-181 object hierarchy lists X_RDK_LinkAvailability (string, R), but the actual parameter in config/RdkCellularManager.xml is X_RDK_LinkAvailableStatus and it is a boolean. Please align the documented name/type with the data model so readers can query the correct parameter.
suggested:
`         ├── X_RDK_LinkAvailableStatus (boolean, R)

6line 477 to481
The X_RDK_Statistics subtree doesn’t match config/RdkCellularManager.xml: the XML defines unsignedInt counters and includes separate drop counters and bitrate fields (e.g., PacketsSentDrop, PacketsReceivedDrop, UpStreamMaxBitRate, DownStreamMaxBitRate). Documenting the correct fields/types will prevent confusion when consuming TR-181.
suggested:`            ├── BytesSent (unsignedInt, R)
``             ├── BytesReceived (unsignedInt, R)
``             ├── PacketsSent (unsignedInt, R)
``             ├── PacketsReceived (unsignedInt, R)
``             ├── PacketsSentDrop (unsignedInt, R)
``             ├── PacketsReceivedDrop (unsignedInt, R)
``             ├── UpStreamMaxBitRate (unsignedInt, R)
``             └── DownStreamMaxBitRate (unsignedInt, R)
`

7.line520to522
This event table references event topics that are not registered as events/properties in the implementation: Device.Cellular.Interface.{i}.NetworkInUse doesn’t exist (network-in-use is under X_RDK_PlmnAccess.NetworkInUse.*), and X_RDK_Status is published at Device.Cellular.X_RDK_Status (not per-interface). Consider aligning these rows with the RBUS event-enabled elements.
` | Phy_Connection_Status_Change | `Device.Cellular.Interface.{i}.X_RDK_PhyConnectedStatus` | Physical modem/network interface connection state change | WAN Manager, Monitoring Services   |
`` | Signal_Quality_Update        | `Device.Cellular.Interface.{i}.RSSI`                    | Radio signal quality metrics update                      | Network Analytics, Telemetry Collection |
`` | Cellular_State_Change        | `Device.Cellular.X_RDK_Status`                          | State machine / connection state change                  | WAN Manager, Routing Services      |
`
