[![Github actions status](https://github.com/ractive/lego-remote/workflows/lego-remote/badge.svg)](https://github.com/ractive/lego-remote/actions?query=workflow%3Alego-remote)

# About
This is a prototype of a web application that allows controlling Lego :tm: smarthubs via bluetooth.
It's a [react](https://reactjs.org/) app using the [node-poweredup](https://github.com/nathankellenicki/node-poweredup)
node library for communication.

I only tested it with the Control+ hubs, but powered up and the boost move hubs should work as well.

The app can be found at [lego-remote.ractive.ch](https://lego-remote.ractive.ch).

# Howto
Turn on the control+ hub by pressing its button, click on the blue "Scan for hubs" button :one: in the
webapp and pair the hub. You can pair multiple hubs by pressing the "Scan for hubs" button again.

The hub will then appear on the left side listing the ports A to D and the two tilt indicators for the
X any Y axis. 

## Tilt indicator
Pressing the button for a tilt indicator in the hub details on the left, adds an indicator ot the controls panel
on the right. It shows the tilt in degrees for the corresponding axis. 

(I think the tilt indicators are only supported by the Control+ hubs)

## Motor Control
Pressing the button for a motor control in the hub details on the left for a specific port, adds an element
to control the speed of a single motor. You can assign keyboard shortcuts to increase and decrease the speed
of the motor and to stop the motor completely by pressing the "cog" symbol on the top of the control.

## Track Control
Pressing the button for a track control in the hub details on the left for a specific port, lets you choose
what other motor should be part of the track control that should be added. The track control lets you easily
control vehicles with tracks that are driven by two motors. You can steer the vehicle by increasing and
decreasing the speed and by turning lef and right (instead of controlling the two motors individually).
You can set keyboard shortcuts by clicking on the "cog" symbol on the top of the track control.

## Keyboard shortcuts
This app uses the [hotkeys](https://github.com/jaywcjlove/hotkeys) library to handle keyboard input so
that you can use their supported keys [in this way](https://github.com/jaywcjlove/hotkeys#supported-keys).
That means that you can set e.g. `up` or `ctrl+a` or `space` as keyboard shortcuts for the controls by
pressing the "cog" symbol.
