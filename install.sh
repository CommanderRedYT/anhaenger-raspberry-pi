#!/bin/bash
npm install
sudo setcap cap_net_bind_service,cap_sys_rawio+ep "$(which node)"
sudo usermod -aG kmem "$(whoami)"