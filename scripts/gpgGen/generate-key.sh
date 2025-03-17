#!/bin/bash
set -e

# Ensure GPG directory exists
export GNUPGHOME="/root/.gnupg"
mkdir -p "$GNUPGHOME"
chmod 700 "$GNUPGHOME"

# Generate a GPG key in batch mode
gpg --batch --gen-key <<EOF
Key-Type: RSA
Key-Length: 4096
Subkey-Type: RSA
Subkey-Length: 4096
Name-Real: Docker GPG User
Name-Email: docker@example.com
Expire-Date: 50y
%no-protection
%commit
EOF

# Export the public key
gpg --export --armor docker@example.com > /keys/gpg-public-key.asc
echo "Public key saved to /keys/gpg-public-key.asc"

# Export the private key
gpg --export-secret-keys --armor docker@example.com > /keys/gpg-private-key.asc
echo "Private key saved to /keys/gpg-private-key.asc"

tail -f /dev/null
