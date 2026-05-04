---
title: "Hardening inicial de un servidor Linux: checklist para producción"
date: 2026-04-28
categories: ["seguridad"]
tags: ["hardening", "ssh", "firewall", "seguridad"]
summary: "Los primeros pasos que aplico a cualquier servidor: SSH seguro, firewall, fail2ban, auditoría y reducción de superficie de ataque."
related: ["btrfs-luks-arch"]
---

Exponer un servidor a internet sin medidas básicas de seguridad garantiza que será comprometido en cuestión de horas. Este es el proceso estandarizado que aplico antes de instalar cualquier servicio en un nodo nuevo.

## Asegurando SSH

El puerto 22 es el objetivo principal de los escaneos automatizados. En `/etc/ssh/sshd_config` aplicamos restricciones estrictas:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
AllowTcpForwarding no
MaxAuthTries 3
LoginGraceTime 20
```

{{< advertencia >}}
Antes de deshabilitar `PasswordAuthentication`, asegurate de haber copiado tu clave pública con `ssh-copy-id`. Si no, te quedás afuera.
{{< /advertencia >}}

Reiniciá el servicio y verificá desde otra terminal antes de cerrar la sesión actual:

```bash
systemctl restart sshd
ssh -i ~/.ssh/tu_clave usuario@servidor
```

## Firewall con nftables

Uso `nftables` como reemplazo moderno de iptables. Un conjunto de reglas básicas que descarta todo el tráfico entrante excepto lo estrictamente necesario:

```
flush ruleset

table inet filter {
  chain input {
    type filter hook input priority 0; policy drop;
    ct state invalid drop
    ct state established,related accept
    iif "lo" accept
    tcp dport 22 accept
    tcp dport { 80, 443 } accept
    icmp type echo-request accept
  }
  chain forward { type filter hook forward priority 0; policy drop; }
  chain output  { type filter hook output  priority 0; policy accept; }
}
```

{{< nota >}}
Guardá las reglas con `nft list ruleset > /etc/nftables.conf` y habilitá el servicio con `systemctl enable --now nftables`.
{{< /nota >}}

## Fail2ban

Para mitigar ataques de fuerza bruta en SSH, configurá fail2ban con una política agresiva:

```ini
[sshd]
enabled  = true
maxretry = 3
findtime = 300
bantime  = 3600
```

{{< tip >}}
Considerá usar `bantime.increment = true` para incrementar el tiempo de baneo exponencialmente con cada reincidencia de la misma IP.
{{< /tip >}}

## Reducción de superficie

- Desinstalá servicios innecesarios: `apt purge avahi-daemon cups`
- Deshabilitá módulos de kernel que no usás
- Configurá `sysctl` para deshabilitar IP forwarding si no es un router
- Activá `auditd` para registrar accesos a archivos sensibles
