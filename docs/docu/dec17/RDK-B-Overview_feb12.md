# RDK-B (RDK Broadband) - Overview
RDK Broadband provides a common software and data solution across all broadband access technologies including Fixed Wireless, DOCSIS, GPON, and DSL. It provides functionality such as routing, Wi-Fi, DNS, remote management, and the smaller image footprint eases deployment on devices.

Some of the key characteristics of RDK-B are:

**Open-Source Platform:** RDK-B is developed as an open-source project under RDK Management LLC.

**Modular & Scalable Design:** Component-based architecture supporting device profiles from full-featured gateways to lightweight extenders.

**Standards-Based:** Implements TR-181 data model and TR-069/TR-369 USP management protocols.

**Easily Customizable:** Standards like TR-181 are customized based on operators' needs rather than following exact specifications, enabling flexible deployment tailored to specific requirements.

**Hardware-Agnostic:** Clearly defined HAL APIs for each functions, making it easy for multiple chipset vendors to adopt RDK, as well as keeping RDK middleware platform agnostic.

![RDK-B Overview](./Overview.png)

RDK-B supports multiple access technologies including DOCSIS 3.0/3.1, GPON/XGS-PON, DSL (ADSL2+, VDSL2, G.fast), Fixed Wireless (LTE/5G), and Ethernet WAN with multi-WAN capabilities. Networking features include WiFi (WiFi 6/6E), mesh networking, LAN bridging, VLAN, DHCP server, routing, and QoS. Security is provided through firewall, WPA3 encryption, access control, and parental controls. Device management is supported via TR-069 (CWMP), TR-369 (USP), WebPA, and WebConfig protocols. Additional features include voice services (SIP/VoIP), IoT protocol support (Zigbee, Z-Wave, Thread), IPv6 support, and DNS management.

---

## RDK-B Device Profiles

**Router Profile**

A router serves as a central hub for distributing internet connectivity in homes or offices, managing seamless data transmission through wired and wireless connections. The RDK-B router profile offers comprehensive LAN management capabilities, empowering users to configure and manage their local area network settings effectively. This includes features like DHCP (Dynamic Host Configuration Protocol) server for automatic IP address assignment, NAT (Network Address Translation) for private network connectivity, and firewall settings for network security. In terms of WAN management, RDK-B supports various technologies such as EthWAN (Ethernet WAN), DSL (Digital Subscriber Line), GPON (Gigabit Passive Optical Network), and LTE (Long-Term Evolution). These technologies enable flexible and reliable connections to different types of internet services.

**WiFi Extender Profile**

The RDK-B WiFi extender is designed to extend the WiFi range for wireless clients. It operates in conjunction with the RDKB gateway and broadcasts the same SSID as the gateway, ensuring seamless connectivity. The hardware of the WiFi extender is cost sensitive, and it does not require all the software components of the gateway. Acting as a Layer-2 switch, it supports various RF technologies like MoCA, Wi-Fi, Zigbee, and BLE for user device connectivity. The extender can establish backhaul IP connectivity using MoCA, Ethernet, or WiFi.

---

