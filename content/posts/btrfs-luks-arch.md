---
title: "Configurando Btrfs con subvolúmenes y cifrado LUKS en Arch Linux"
date: 2026-05-02
categories: ["gnu-linux"]
tags: ["btrfs", "luks", "arch", "filesystems"]
summary: "Una guía práctica sobre cómo estructurar un sistema de archivos moderno con snapshots, compresión y cifrado completo de disco desde cero."
related: ["hardening-servidor-linux", "base-conocimiento-llm"]
---

Configurar un sistema base sólido en Arch Linux requiere entender cómo interactúan el esquema de particiones, el cifrado y el sistema de archivos. En esta guía documento mi stack preferido: GPT + LUKS2 con cryptsetup + Btrfs con subvolúmenes.

## Particionado GPT

Uso `fdisk` o `gdisk` para crear un esquema limpio con dos particiones: una EFI para systemd-boot y una raíz que cifraremos por completo.

```bash
gdisk /dev/nvme0n1
# Crear partición 1: tipo EF00 (EFI), tamaño 512M
# Crear partición 2: tipo 8300 (Linux), resto del disco
```

{{< advertencia >}}
Verificá dos veces el dispositivo (`lsblk`) antes de ejecutar cualquier operación de particionado. Una equivocación aquí borra todos los datos.
{{< /advertencia >}}

## Cifrado con LUKS2

```bash
cryptsetup luksFormat --type luks2 /dev/nvme0n1p2
cryptsetup open /dev/nvme0n1p2 cryptroot
```

{{< nota >}}
LUKS2 permite usar Argon2id como KDF, que es más resistente a ataques de fuerza bruta que el PBKDF2 de LUKS1.
{{< /nota >}}

## Formateo y subvolúmenes Btrfs

Una vez abierto el contenedor cifrado, formateamos y creamos los subvolúmenes principales:

```bash
mkfs.btrfs /dev/mapper/cryptroot
mount /dev/mapper/cryptroot /mnt

btrfs subvolume create /mnt/@
btrfs subvolume create /mnt/@home
btrfs subvolume create /mnt/@snapshots

umount /mnt
```

## Opciones de montaje

El secreto está en las opciones. Para un SSD NVMe con Btrfs:

```bash
mount -o noatime,compress=zstd:3,space_cache=v2,ssd,discard=async,subvol=@ \
  /dev/mapper/cryptroot /mnt

mkdir -p /mnt/{home,.snapshots}

mount -o noatime,compress=zstd:3,space_cache=v2,ssd,discard=async,subvol=@home \
  /dev/mapper/cryptroot /mnt/home

mount -o noatime,compress=zstd:3,space_cache=v2,ssd,discard=async,subvol=@snapshots \
  /dev/mapper/cryptroot /mnt/.snapshots
```

{{< tip >}}
`compress=zstd:3` ofrece un balance excelente entre compresión y velocidad. Para SSDs rápidos podés bajar a `zstd:1` para priorizar throughput.
{{< /tip >}}

## Integración con Snapper

Con la estructura de subvolúmenes lista, Snapper puede gestionar snapshots automáticos del sistema y del home de forma independiente, permitiendo rollbacks quirúrgicos sin afectar los datos del usuario.
