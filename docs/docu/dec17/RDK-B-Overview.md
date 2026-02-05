# RDK-B (RDK Broadband) - Overview Documentation

**Version:** 2.0  
**Last Updated:** February 2026  

---

## Table of Contents

1. [Introduction](#introduction)
2. [What is RDK-B?](#what-is-rdk-b)
3. [Benefits from RDK-B](#benefits-from-rdk-b)
4. [Key Benefits](#key-benefits)
5. [Core Features](#core-features)
6. [RDK-B Profiles](#rdk-b-profiles)

---

## Introduction

RDK-B (Reference Design Kit for Broadband) is an open-source software platform for broadband gateway devices. This documentation provides an overview for those who are new to RDK-B.

---

## What is RDK-B?

RDK Broadband provides a common software and data solution across all broadband access technologies including Fixed Wireless, DOCSIS, GPON, and DSL. It provides functionality such as routing, Wi-Fi, DNS, remote management, and the smaller image footprint eases deployment on devices.

---

## Benefits from RDK-B

RDK-B provides benefits to service providers and operators by enabling them to deploy consistent features across multi-vendor hardware. OEMs and hardware manufacturers benefit from reduced software development overhead. Silicon vendors can integrate their chipsets into the RDK ecosystem. Software developers can build applications once and deploy across multiple platforms.

---

## Key Benefits

RDK-B provides a unified software platform with a single codebase supporting multiple access technologies including DOCSIS, PON, DSL, 5G, and Ethernet. The open-source architecture enables transparent development and community-driven innovation. The modular and scalable design uses a component-based architecture that supports devices from low-end to high-end configurations. RDK-B features rigorously tested releases with comprehensive testing frameworks. Applications and services are portable across different technologies, providing consistent functionality regardless of the underlying access technology. The platform includes advanced management capabilities supporting TR-069, TR-181, and other management protocols. RDK-B offers a rich feature set including routing, Wi-Fi, security features, IoT protocol support, parental controls, and quality of service management.

---

## Core Features

RDK-B encompasses device management capabilities including remote configuration, provisioning, firmware upgrade management, self-healing, and telemetry. Network connectivity features include WAN management supporting multiple technologies such as EthWAN, DOCSIS, GPON, DSL, and LTE. LAN management provides DHCP server, IPv4/IPv6 routing, and VLAN support. IP features include NAT, port forwarding, DMZ, and DDNS. Wireless connectivity supports Wi-Fi standards including 802.11 a/b/g/n/ac/ax with features like WPA2/WPA3, band steering, mesh networking, multiple SSIDs, and guest networks. Security features include firewall with stateful packet inspection, VPN support through IPsec and OpenVPN, intrusion detection, and secure boot. Advanced features include home automation and IoT support with Zigbee, Thread, and Bluetooth Low Energy. Parental controls offer content filtering and time-based access restrictions. Quality of service features provide traffic prioritization and bandwidth allocation. Cloud integration enables cloud-based device management and remote diagnostics. Multicast support includes MABR for efficient content delivery. Voice services are supported through VoIP and SIP integration.

---

## RDK-B Profiles

RDK-B supports different device profiles to address various deployment scenarios.

### Router Profile

The Router profile provides a full-featured residential gateway with comprehensive LAN and WAN management capabilities. This profile includes LAN management features such as DHCP server for automatic IP address assignment, NAT for private network connectivity, and firewall settings for network security. For WAN connectivity, the Router profile supports multiple technologies including EthWAN (Ethernet WAN), DSL (Digital Subscriber Line), GPON (Gigabit Passive Optical Network), and LTE (Long-Term Evolution). These technologies enable connections to different types of internet services. The Router profile serves as a central hub for distributing internet connectivity in homes or offices, managing data transmission through both wired and wireless connections.

### WiFi Extender Profile

The WiFi Extender profile is designed to extend Wi-Fi coverage for wireless clients. It operates in conjunction with the RDK-B gateway and broadcasts the same SSID as the gateway to ensure seamless connectivity. The extender hardware is designed to be cost-effective and does not require all the software components of the full gateway. The extender functions as a Layer-2 switch and supports various connectivity technologies like MoCA, Wi-Fi, Zigbee, and BLE for user device connectivity. Backhaul IP connectivity can be established using MoCA, Ethernet, or Wi-Fi. The Turris Omnia serves as a reference extender platform, which is an Ethernet-based router that facilitates the development of tri-band designs.

---

