# Nginx Static Site

Minimal Nginx serving the default welcome page. Replace the image with your own static build, or mount a volume at `/usr/share/nginx/html`.

## Variables

- `DOMAIN`: public domain pointing at this server.

## Post-deploy

Update DNS to point your domain at the server's public IP.
