require('../styles/pre-send-widget.scss');

import {Inject, Intent} from "interstellar-core";

@Inject("interstellar-core.IntentBroadcast")
class PreSendWidgetController {
  constructor(IntentBroadcast) {
    this.IntentBroadcast = IntentBroadcast;
  }

  go() {
    this.IntentBroadcast.sendBroadcast(
      new Intent(
        Intent.TYPES.SEND_TRANSACTION,
        {destination: this.destination}
      )
    );
  }
}

module.exports = mod => {
  mod.controller("PreSendWidgetController", PreSendWidgetController);
};
