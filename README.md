[![Github actions status](https://github.com/ractive/brick-remote/workflows/brick-remote/badge.svg)](https://github.com/ractive/brick-remote/actions?query=workflow%3Abrick-remote)

# About
This is a prototype of a web application that allows controlling Lego :tm: smarthubs via bluetooth.
It's a [react](https://reactjs.org/) app using the [node-poweredup](https://github.com/nathankellenicki/node-poweredup)
node library for communication.

I only tested it with the Control+ hubs, but powered up and the boost move hubs should work as well.

:information_source: The app can be found at [brick-remote.ractive.ch](https://brick-remote.ractive.ch).

![brick-remote-screenshot](https://user-images.githubusercontent.com/783861/69193780-deee2300-0b27-11ea-9d40-cef99e0f73c4.png)

# Howto
Turn on the control+ hub by pressing its button, click on the blue "Scan for hubs" button in the
webapp and pair the hub. You can pair multiple hubs by pressing the "Scan for hubs" button again.

The hub will then appear on the left side listing the ports A to D and the two tilt indicators for the
X any Y axis. 

<img alt="brick-remote-pair" src="https://user-images.githubusercontent.com/783861/69191588-160e0580-0b23-11ea-993d-069fa5e7e45d.png" width="75%" height="75%"/>

## Tilt indicator
Pressing the button for a tilt indicator in the hub details on the left, adds an indicator to the controls panel
on the right. It shows the tilt in degrees for the corresponding axis. 

(I think the tilt indicators are only supported by the Control+ hubs)

## Motor Control
Pressing the "motor control" button in the hub details on the left for a specific port, adds an element
to control the speed of a single motor. You can assign keyboard shortcuts to increase and decrease the speed
of the motor and to stop the motor completely. Configre the keyboard shortcuts by pressing the "cog" symbol on
the top of the control.

## Track Control
Pressing the "track control" button in the hub details on the left for a specific port, lets you choose
what other motor should be part of the track control being added. A track control lets you easily
control vehicles with tracks that are driven by two motors. You can steer the vehicle by increasing and
decreasing the speed and by turning lef and right (instead of controlling the two motors individually).
You can set keyboard shortcuts by clicking on the "cog" symbol on the top of the track control.

## Keyboard shortcuts
This app uses the [hotkeys](https://github.com/jaywcjlove/hotkeys) library to handle keyboard input so
that you can use their supported keys [in this way](https://github.com/jaywcjlove/hotkeys#supported-keys).
That means that you can set e.g. `up` or `ctrl+a` or `space` as keyboard shortcuts when configuring the controls by
pressing the "cog" symbol.

<img alt="brick-remote-keyboard-shortcuts" src="https://user-images.githubusercontent.com/783861/69191586-15756f00-0b23-11ea-8a0f-3b0c28b4cc84.png" width="66%" height="66%" />
