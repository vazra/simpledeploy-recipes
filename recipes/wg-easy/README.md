# WireGuard VPN (wg-easy)

WireGuard VPN server bundled with a web admin UI for adding peers, generating client configs, and toggling clients on/off. Simpler to operate than raw WireGuard.

## Variables

- `DOMAIN`: public domain for the **admin UI** (e.g. `vpn.example.com`). SimpleDeploy fronts this with TLS.
- `WG_HOST`: the public hostname or IP that VPN **clients** connect to. Usually the same as `DOMAIN`, but it can be a bare IP if you don't have DNS.

## Post-deploy

1. Open `https://<DOMAIN>` in a browser.
2. The first-run setup wizard prompts you to create an admin account. Pick a strong password.
3. Add a peer; download the `.conf` file or scan the QR code from the WireGuard mobile app.
4. Connect from the client; verify with `https://<DOMAIN>` reflecting an "online" peer.

## Networking notes

- UDP port `51820` must be open on your host's firewall and any cloud security group. SimpleDeploy's reverse proxy handles only the admin UI; the VPN traffic flows directly to the container.
- The container needs `NET_ADMIN` and `SYS_MODULE` capabilities and `ip_forward=1`. These are set in the compose file. They are **not** privileged mode but do extend container permissions.
- IPv6 is disabled by default. Enable it by adding `INIT_IPV6_CIDR` and the matching sysctls if you need it.

## Backups

Peer configs and the wg-easy database live in the `wg-data` named volume. Back it up via SimpleDeploy "volume" backup. Losing it means re-issuing every peer config.

## Resources

Trivial: 0.5 vCPU / 256MB handles dozens of peers. Throughput is bound by your host's NIC, not the container.

## Security

- The admin UI password is set on first launch. **Never expose this UI without TLS.** SimpleDeploy's `tls: auto` covers that.
- VPN traffic is end-to-end encrypted by WireGuard regardless of the UI's TLS state.

## Links

- Project: https://github.com/wg-easy/wg-easy
- WireGuard: https://www.wireguard.com/
- License: GPL-2.0
