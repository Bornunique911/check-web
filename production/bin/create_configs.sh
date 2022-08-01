#!/bin/bash

# This script generates json configuration files for check-web using values
# from the environment set via the SSM parameter store.

# The following environment variables must be set:
if [[ -z ${DEPLOY_ENV+x} || -z ${DEPLOYDIR+x} || -z ${AWS_DEFAULT_REGION+x} ]]; then
  echo "DEPLOY_ENV, DEPLOYDIR, and AWS_DEFAULT_REGION must be in the environment. Exiting."
  exit 1
fi

WORKTMP=$(mktemp)

# Create user config.js from ENV:
DESTFILE="${DEPLOYDIR}/latest/config.js"
echo $config | python -m base64 -d > $WORKTMP
if (( $? != 0 )); then
  echo "Error retrieving SSM parameter ${SSM_PREFIX}/config. Exiting."
  exit 1
fi
mv $WORKTMP $DESTFILE

# Create config-server.js from ENV:
DESTFILE="${DEPLOYDIR}/latest/config-server.js"
echo $config_server | python -m base64 -d > $WORKTMP
if (( $? != 0 )); then
  echo "Error retrieving SSM parameter ${SSM_PREFIX}/config-server. Exiting."
  exit 1
fi
mv $WORKTMP $DESTFILE


echo "Configuration for env $DEPLOY_ENV complete."
exit 0
