#!/usr/bin/env bash

USERNAME=${USERNAME:-"node"}

set -eux

# Setup STDERR.
err() {
    echo "(!) $*" >&2
}

# Ensure apt is in non-interactive to avoid prompts
export DEBIAN_FRONTEND=noninteractive

# Install npm dependencies
npm install
