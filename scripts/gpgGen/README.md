# GPG Generator

This script is used to generate a GPG key pair for the bot.

## Usage

To run the script, simply run the following command in this directory:

```bash
make
```

This will run the script and generate a GPG key pair for the bot.

The public key will be generated to the `../../keys/gpg-public-key.asc` file and the private key will be generated to the `../../keys/gpg-private-key.asc` file.

## Notes

- The public key will be commited to the repository.
- The private key will NOT be commited to the repository.
- The keys will expire in 50 years.