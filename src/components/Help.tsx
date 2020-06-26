import React from "react";

const Help: React.FC = () => (
  /* tslint:disable:max-line-length */
  <div>
    <h2 id="about">About</h2>
    <p>
      This is a prototype of a web application that allows controlling Lego ™
      smarthubs via bluetooth. It&#39;s a{" "}
      <a href="https://reactjs.org/">react</a> app using the{" "}
      <a href="https://github.com/nathankellenicki/node-poweredup">
        node-poweredup
      </a>
      node library for communication.
    </p>
    <p>
      I only tested it with the Control+ hubs, but powered up and the boost move
      hubs should work as well.
    </p>
    <p>
      On Android you probably need to "scan for hubs" multiple times until a hub
      appears. I try to investigate why this happens on mobile phones.
    </p>
    <p>
      More information can be found on github:{" "}
      <a href="https://github.com/ractive/brick-remote">
        github.com/ractive/brick-remote
      </a>
    </p>
    <p>
      <img
        style={{ maxWidth: "900px" }}
        src="https://user-images.githubusercontent.com/783861/69193780-deee2300-0b27-11ea-9d40-cef99e0f73c4.png"
        alt="brick-remote-screenshot"
        width="90%"
      />
    </p>
    <h2 id="howto">Howto</h2>
    <p>
      Turn on the bluetooth hub on your lego model by pressing its button, click
      on the blue &quot;Scan for hubs&quot; button in the webapp and pair the
      hub. You can pair multiple hubs by pressing the &quot;Scan for hubs&quot;
      button again.
    </p>
    <p>
      The hub will then appear on the left side listing the ports A to D and the
      two tilt indicators for the X any Y axis.{" "}
    </p>
    <p>
      <img
        style={{ maxWidth: "800px" }}
        alt="brick-remote-pair"
        src="https://user-images.githubusercontent.com/783861/69191588-160e0580-0b23-11ea-993d-069fa5e7e45d.png"
        width="90%"
      />
    </p>
    <h3 id="tilt-indicator">Tilt indicator</h3>
    <p>
      Pressing the button for a tilt indicator in the hub details on the left,
      adds an indicator to the controls panel on the right. It shows the tilt in
      degrees for the corresponding axis.{" "}
    </p>
    <p>(I think the tilt indicators are only supported by the Control+ hubs)</p>
    <h3 id="motor-control">Motor Control</h3>
    <p>
      Pressing the &quot;motor control&quot; button in the hub details on the
      left for a specific port, adds an element to control the speed of a single
      motor. You can assign keyboard shortcuts to increase and decrease the
      speed of the motor and to stop the motor completely. Configre the keyboard
      shortcuts by pressing the &quot;cog&quot; symbol on the top of the
      control.
    </p>
    <h3 id="track-control">Track Control</h3>
    <p>
      Pressing the &quot;track control&quot; button in the hub details on the
      left for a specific port, lets you choose what other motor should be part
      of the track control being added. A track control lets you easily control
      vehicles with tracks that are driven by two motors. You can steer the
      vehicle by increasing and decreasing the speed and by turning lef and
      right (instead of controlling the two motors individually). You can set
      keyboard shortcuts by clicking on the &quot;cog&quot; symbol on the top of
      the track control.
    </p>
    <h3 id="keyboard-shortcuts">Keyboard shortcuts</h3>
    <p>
      This app uses the{" "}
      <a href="https://github.com/jaywcjlove/hotkeys">hotkeys</a> library to
      handle keyboard input so that you can use their supported keys{" "}
      <a href="https://github.com/jaywcjlove/hotkeys#supported-keys">
        in this way
      </a>
      . That means that you can set e.g. <code>up</code> or <code>ctrl+a</code>{" "}
      or <code>space</code> as keyboard shortcuts when configuring the controls
      by pressing the &quot;cog&quot; symbol.
    </p>
    <p>
      <img
        style={{ maxWidth: "500px" }}
        alt="brick-remote-keyboard-shortcuts"
        src="https://user-images.githubusercontent.com/783861/69191586-15756f00-0b23-11ea-8a0f-3b0c28b4cc84.png"
        width="50%"
        height="50%"
      />
    </p>
  </div>
);

export default Help;
