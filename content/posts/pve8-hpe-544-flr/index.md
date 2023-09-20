---
layout: post
tags: ["技术","DevOps"]
title: "在PVE8中使用HPE 544+FLR"
date: 2023-09-19T21:20:08-07:00
draft: false
resources:
- alt: ConnectX-3 Pro芯片组只能使用MLNX_OFED 4.9-x LTS驱动
  src: 0001.png
- alt: MLNX_OFED 4.9-x LTS只支持到Debian 10.0
  src: 0002.png
- alt: 找到要下载的MFT包
  src: 0003.png
- alt: PVE配置虚拟网桥
  src: 0004.png
- alt: 桥接虚拟机网卡
  src: 0005.png
---
## 引言
最近在着手装一台新的Homelab，网络方面用到了`HPE 544+FLR`这张卡。由于芯片组（`ConnectX-3 Pro`）较老，资源与文档相对分散和零碎，在此记录一下配置的过程，以便不时引阅之用。

## 驱动？
在查找官方支持时，发现Mellanox为此芯片组提供的[OFED](https://network.nvidia.com/products/infiniband-drivers/linux/mlnx_ofed/)只支持到`Debian 10.0`，不能直接在PVE8（`Debian 12`）上安装。

![ConnectX-3 Pro芯片组只能使用MLNX_OFED 4.9-x LTS驱动](/2023/09/pve8-hpe-544-flr/0001.png)
![MLNX_OFED 4.9-x LTS只支持到Debian 10.0](/2023/09/pve8-hpe-544-flr/0002.png)

但所幸驱动本身被包含在Linux内核中(`mlx4_core`)，且我们可以使用`NVIDIA Firmware Tools(MFT)`包进行配置以让网卡正常运作。首先下载安装`MFT`。进入这个[地址](https://network.nvidia.com/products/adapter-software/firmware-tools/)，找到要下载的版本并安装。
![找到要下载的MFT包](/2023/09/pve8-hpe-544-flr/0003.png)

```
root@pve:~# wget https://www.mellanox.com/downloads/MFT/mft-4.25.0-62-x86_64-deb.tgz
--2023-09-19 21:48:40--  https://www.mellanox.com/downloads/MFT/mft-4.25.0-62-x86_64-deb.tgz
...

root@pve:~# tar xzvf mft-4.25.0-62-x86_64-deb.tgz 
mft-4.25.0-62-x86_64-deb/
...

root@pve:~# bash mft-4.25.0-62-x86_64-deb/install.sh
...
```

安装完成后`mst start`即可。

```
root@pve:~# mst start
Starting MST (Mellanox Software Tools) driver set
Loading MST PCI module - Success
Loading MST PCI configuration module - Success
Create devices
```

## 找到网卡
在首次插入时网卡会运行在`InfiniBand`模式，因此无法直接列出网络接口。可以通过PCI列表确认：

```
root@pve:~# lspci | grep Mellanox
04:00.0 Network controller: Mellanox Technologies MT27520 Family [ConnectX-3 Pro]
```

出现这个设备则意味着网卡已插入且被正确识别。此处的`04:00.0`即BusID。你可以使用`lspci -vv -s [BusID]`和`udevadm info -e | grep -B 10 "[BusID]"`查看更多信息。

接下来，我们使用`mst status`找到网卡的设备名：

```
root@pve:~# mst status
MST modules:
------------
    MST PCI module loaded
    MST PCI configuration module loaded

MST devices:
------------
/dev/mst/mt4103_pciconf0         - PCI configuration cycles access.
                                   domain:bus:dev.fn=0000:04:00.0 addr.reg=88 data.reg=92 cr_bar.gw_offset=-1
                                   Chip revision is: 00
/dev/mst/mt4103_pci_cr0          - PCI direct access.
                                   domain:bus:dev.fn=0000:04:00.0 bar=0xfb300000 size=0x100000
                                   Chip revision is: 00
```
即`/dev/mst/mt4103_pciconf0`。
## 切换模式
将网卡切换到Ethernet模式：

```
root@pve:~# mlxconfig -d /dev/mst/mt4103_pciconf0 set LINK_TYPE_P1=2

Device #1:
----------

Device type:    ConnectX3Pro    
Device:         /dev/mst/mt4103_pciconf0

Configurations:                                      Next Boot       New
        LINK_TYPE_P1                                IB(1)          ETH(2)          

 Apply new Configuration? (y/n) [n] : y
Applying... Done!
-I- Please reboot machine to load new configurations.
```

此处`LINK_TYPE_P1=2`即切换至Ethernet模式。完成后`reboot`。重新启动后应当能看到新的网络接口：

```
root@pve:~# ip link show
...
5: enp4s0: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/ether e0:07... brd ff:ff:ff:ff:ff:ff
6: enp4s0d1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 noop state DOWN mode DEFAULT group default qlen 1000
    link/ether e0:07... brd ff:ff:ff:ff:ff:ff
...
```

## 创建虚拟网桥
进入PVE网络配置界面，创建`Linux Bridge`，设置静态地址、桥接端口后，应用配置即可。这一步亦可通过编辑`/etc/network/interfaces`达成。
![PVE配置虚拟网桥](/2023/09/pve8-hpe-544-flr/0004.png)

然后将虚拟机网卡桥接到虚拟网桥即可。

![桥接虚拟机网卡](/2023/09/pve8-hpe-544-flr/0005.png)
最后我们可以通过`ethtool`确认接口的运行情况：

```
root@pve:~# ethtool enp4s0d1
Settings for enp4s0d1:
        Supported ports: [ FIBRE ]
        Supported link modes:   10000baseKX4/Full
                                40000baseCR4/Full
                                40000baseSR4/Full
                                56000baseCR4/Full
                                56000baseSR4/Full
                                1000baseX/Full
                                10000baseCR/Full
                                10000baseSR/Full
        Supported pause frame use: Symmetric Receive-only
        Supports auto-negotiation: Yes
        Supported FEC modes: Not reported
        Advertised link modes:  10000baseKX4/Full
                                40000baseCR4/Full
                                40000baseSR4/Full
                                1000baseX/Full
                                10000baseCR/Full
                                10000baseSR/Full
        Advertised pause frame use: Symmetric
        Advertised auto-negotiation: Yes
        Advertised FEC modes: Not reported
        Speed: 40000Mb/s
        Duplex: Full
        Auto-negotiation: off
        Port: FIBRE
        PHYAD: 0
        Transceiver: internal
        Supports Wake-on: g
        Wake-on: g
        Current message level: 0x00000014 (20)
                               link ifdown
        Link detected: yes
```

可以看到已经跑在了40G速率。