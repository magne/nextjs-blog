# YubiKey in Docker container

## Run docker with access to usb devices

```sh
docker run -it --rm -v /dev/bus/usb:/dev/bus/usb --device-cgroup-rule="c 189:* mrw" ubuntu:21.04
```

## Required packages

```sh
apt update && apt install --no-install-recommends scdaemon gnupg usbutils inotify-tools

# Print status
gpg --card-status
```

## Detect usb port changes

```bash notify.sh
#!/usr/bin/env bash

#Set the idVendor/idProduct that we are interested in
idVendor="1050"
idProduct="0407"

idString="${idVendor}:${idProduct}"


#Check if the device we are interested in is already connected
#before we start listing in a loop
devWasConnected=$(lsusb | grep "ID ${idString}" | wc -l)



inotifywait -r -m /dev/bus/usb -e CREATE -e DELETE | while read e
do
  #check if the relevant device is now connected, based on
  #idVendor and idProduct codes
  devIsConnected=$(lsusb | grep "ID ${idString}" | wc -l)

  #Check if the new device plugged in is garmin
  #this means that if it was not connected before, but it is
  #connected now, we must perform the actions
  if [[ ( "$devWasConnected" == 0) && ( "$devIsConnected" == 1) ]]
  then
    ##Do all the stuff you want to do when the device connects
    ##e.g. in my case, download all data from garmin watch
    ##and upload new tracks to strava
        gpgconf --kill gpg-agent
  fi

  #Now update the wasConnected to the isConnected for the
  #next iteration
  devWasConnected=${devIsConnected}
done
```
