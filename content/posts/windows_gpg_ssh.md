---
layout: post
tags: ["技术","Ops"]
title: "在Windows中使用GPG验证SSH连接"
date: 2023-04-14T22:07:33-07:00
draft: false
---

## 这是什么？

`GnuPG`在近期的2.4.0 Release中添加了对`Win32-OpenSSH`的原生支持，这也被包含在[Gpg4win 4.1.0](https://lists.wald.intevation.org/pipermail/gpg4win-announce/2022/000099.html)中。这意味着我们可以在最新版本的`Gpg4win`中直接启用对SSH验证的支持，不再需要[wsl-ssh-pageant](https://github.com/benpye/wsl-ssh-pageant)转接。找了一圈没有看到对应这一特性的教程，在这里简单总结一下配置的过程。

本文假定你已经创建了主秘钥，如没有，你可以参考[这篇教程](https://docs.github.com/zh/authentication/managing-commit-signature-verification/generating-a-new-gpg-key)。

## 创建验证子秘钥

(*如已完成可直接跳过*)

 ```
PS C:\Users\xsling> gpg --expert --edit-key me@xsl.sh
gpg (GnuPG) 2.4.0; Copyright (C) 2021 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  rsa4096/<*10-digits-hex-id*>
     created: YYYY-MM-DD  expires: YYYY-MM-DD       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1). xsling <me@xsl.sh>
 ```

添加秘钥：

```
gpg> addkey
```

选择`RSA (set your own capabilities)`：

```
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (12) ECC (encrypt only)
  (13) Existing key
  (14) Existing key from card
```

```
Your selection? 8
```

由于仅将该子秘钥用于验证，我们开启`Authenticate`功能，关闭`Sign`和`Encrypt`：

```
Possible actions for this RSA key: Sign Encrypt Authenticate
Current allowed actions: Sign Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? A

Possible actions for this RSA key: Sign Encrypt Authenticate
Current allowed actions: Sign Encrypt Authenticate

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? S

Possible actions for this RSA key: Sign Encrypt Authenticate
Current allowed actions: Encrypt Authenticate

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? E

Possible actions for this RSA key: Sign Encrypt Authenticate
Current allowed actions: Authenticate

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? Q
```

输入秘钥长度，这里设置为`4096`：

```
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
Requested keysize is 4096 bits
```

设置秘钥的过期时间，这里设置为一个月`1m`：

```
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 1m
```

然后确认，并保存退出即可：

```
gpg> save
```

此时可以检查我们生成的秘钥：

```
PS C:\Users\xsling> gpg --list-key
C:\Users\xsling\AppData\Roaming\gnupg\pubring.kbx
-------------------------------------------------
pub   rsa4096 YYYY-MM-DD [SC]
      <*some-hex-id*>
uid           [ultimate] xsling <me@xsl.sh>
sub   rsa4096 YYYY-MM-DD [A]
```

其中`sub rsa4096 YYYY-MM-DD [A]`即是我们将用来验证的秘钥。

## 开启GnuPG SSH支持

定位到`%AppData%\gnupg`文件夹。我们需要依次修改以下文件（如不存在即创建）：

- `gpg-agent.conf`
- `sshcontrol`
  
在`gpg-agent.conf`中添加以下内容：

```
enable-win32-openssh-support
```

这为我们添加`Win32-OpenSSH`的socket支持。

然后我们执行：

```
gpg --list-keys --with-keygrip
```

获取秘钥的`keygrip`：

```
PS C:\Users\xsling> gpg --list-keys --with-keygrip
C:\Users\xsling\AppData\Roaming\gnupg\pubring.kbx
-------------------------------------------------
pub   rsa4096 YYYY-MM-DD [C]
      <*some-hex-id*>
      Keygrip = <*some-hex-keygrip*>
uid           [ultimate] xsling <me@xsl.sh>
sub   rsa4096 YYYY-MM-DD [A]
      Keygrip = C0892B3E6BA886395CDF4364FD891C19C8F508B9
```

此处的`C0892B3E6BA886395CDF4364FD891C19C8F508B9`就是我们需要的内容。将其粘贴到`sshcontrol`文件中，使其内容包含：

```
C0892B3E6BA886395CDF4364FD891C19C8F508B9
```

**注意**：这里的坑在于，我们必须在`keygrip`后面添加一个换行符为`LF`的空行，否则`gpg-agent`无法正确地读取秘钥列表。你可以使用`VSCode`等编辑器切换换行符。

如果你以前设置过`SSH_AUTH_SOCK`环境变量，你可以直接将其删除，或设置为`\\.\pipe\openssh-ssh-agent`：

```
PS C:\Users\xsling> $env:SSH_AUTH_SOCK="\\.\pipe\openssh-ssh-agent"
```

最后重启`gpg-agent`：

```
PS C:\Users\xsling> gpg-connect-agent killagent /bye
OK closing connection
PS C:\Users\xsling> gpg-connect-agent /bye
gpg-connect-agent: no running gpg-agent - starting 'C:\\Program Files (x86)\\GnuPG\\bin\\gpg-agent.exe'
gpg-connect-agent: waiting for the agent to come up ... (5s)
gpg-connect-agent: connection to the agent established
```

此时使用`ssh-add -L`获取所有可用的公钥，`gpg-agent`应该已经能正确地提供我们的验证信息。

```
PS C:\Users\xsling> ssh-add -L
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABczf...*public-key-omitted*...ZbeVRr4olZHjI6zrCyWpIN6xN5SZdWBWVrV (none)
```

将以上内容复制到`Github`、`Gitlab`、`authorized_keys`... 即可进行测试：

```
PS C:\Users\xsling> ssh -T git@gitlab.cs.washington.edu
Welcome to GitLab, @shanlx!
```
