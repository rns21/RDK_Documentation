# Try out RDK Broadband

------------------------------------------------------------------------

This guide provides a step-by-step instruction for bringing up RDK-B using a Raspberry Pi as the target device. The document covers the necessary test setup, pre-compiled image, and detailed flashing instructions to get your Raspberry Pi ready to run the RDK-B software.

The RDK port for Raspberry Pi makes the RDK software stack available on a popular hardware device. Raspberry PI (RPI) for RDK-B supports Dunfell and kirkstone builds.

------------------------------------------------------------------------

# Download pre-compiled image

Click on 
[Try out RDK Broadband](../../../preview-rdk/preview-rdk-broadband/try-out-rdk-broadband/try-out-rdk-broadband.md)
Broadband Stable Image - kirkstone
to download the pre compiled kirkstone image.

------------------------------------------------------------------------

# Flash the image to an SD card

This section outlines two methods for flashing:
 
**Flashing using bmaptool
 **
(flashing steps in a Linux environment) and
** **
using
 
**balenaEtcher App**
 
(flashing in Windows).

## Flashing using bmaptool

```
bzip2 -d &lt;path to ImageName.wic.bz2&gt;
sudo -E bmaptool copy --nobmap &lt;path to ImageName.wic&gt; &lt;path to SD card space&gt;
Example:
$ bzip2 -d rdk-generic-broadband-image-raspberrypi-rdk-broadband.wic.bz2
$ sudo -E bmaptool copy --nobmap rdk-generic-broadband-image-raspberrypi-rdk-broadband.wic /dev/sdb
```

## Flashing using BalenaEtcher

To flash the image on an SD card in Windows, you will need to download the BalenaEtcher application:
[https://www.balena.io/etcher/](https://www.balena.io/etcher/)
.  
*\*Note:
 
Prefer to use a 32GB SD card, and there should be a minimum of 12GB of free space available in the device.*
*Be sure to remove all other portable flash drives/hard drives/SD cards from your computer before flashing the RDK image.*

-   Open the application.
-   Select the image from your download folder.
-   Select the drive containing your SD card.
-   Click “Flash” to copy the image onto the SD card.

![flash-1-png](./try-out-rdk-broadband-images/flash-1-png)
![flash-2-png](./try-out-rdk-broadband-images/flash-2-png)

------------------------------------------------------------------------

# Bring Up the device

## System Setup

![rdkvsystemsetup](./try-out-rdk-broadband-images/rdkvsystemsetup.png)

1.  Connect TV/Monitor to HDMI Video Output.

2.  Connect the Ethernet cable to the LAN port.
    1.  For the Raspberry Pi device to be issued an IP address during boot-up, the other end of the Ethernet cable needs to be connected to the network where the DHCP server is operating.
    2.  Connectivity to the Internet is required so that the client connected can access the Internet via RDK-B gateway.

3.  Connect the USB-Ethernet adapter to one of the USB slots present in Raspberry Pi.

4.  Connect the Ethernet cable from the USB-Ethernet adapter to the client device/machine.

5.  Insert the SD card into the Micro SD Card Slot.

6.  Connect the Power cable to the Micro USB power Input.

------------------------------------------------------------------------

Once the RPI boots up, login prompts will be displayed on the TV

1.  Type “root” when the login prompt is displayed
2.  Run the following in the terminal
    1.  \#  ifconfig
3.  Check the interface shown for the USB-Ethernet adapter. e.g eth1, eth2 ... so on
4.  In case you are running in Ethernet mode, add the interface of the USB-Ethernet adapter in file “/etc/utopia/system_defaults. Change lan_ethernet_physical_ifnames. It will be your LAN side.
    1.  e.g:lan_ethernet_physical_ifnames=eth1
5.  Reboot the Raspberry Pi

------------------------------------------------------------------------

WebUI can be accessed by both the LAN clients and from the WAN Side.

-   For LAN/WAN Clients:
    -   Open an internet browser on the LAN client/machine.
    -   Give the following URL in the browser window:
        -   From LAN Side:
            http://10.0.0.1
            -
            if we use LAN IP (10.0.0.1) then it opens a captive portal page

![captiveportal-png](./try-out-rdk-broadband-images/captiveportal-png)

-   -   -   From WAN Side:
            -   http://&lt;WAN IP Address of Raspberry Pi&gt;:8080
            -   For e.g http://192.168.30.230:8080
            -   If you are accessing erouter IP from any wan network in the same range, it will redirect to the admin page.

![wan_adminpage-png](./try-out-rdk-broadband-images/wan_adminpage-png)

