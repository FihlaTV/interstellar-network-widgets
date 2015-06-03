import {Module, Intent} from "interstellar-core";
import interstellarSessions from "interstellar-sessions";
import interstellarNetwork from "interstellar-network";
import moduleDatastore from "./util/module-datastore.es6";

const mod = new Module('interstellar-network-widgets');
export default mod;

mod.use(require('angular-cookies'));
mod.use(interstellarSessions);
mod.use(interstellarNetwork);

mod.controllers = require.context("./controllers", true);
mod.directives  = require.context("./directives", true);
mod.templates   = require.context("raw!./templates", true);

let registerBroadcastReceivers = (IntentBroadcast) => {
  IntentBroadcast.registerReceiver(Intent.TYPES.SEND_TRANSACTION, intent => {
    moduleDatastore.set('destinationAddress', intent.data.destination);
  });
};
registerBroadcastReceivers.$inject = ["interstellar-core.IntentBroadcast"];
mod.run(registerBroadcastReceivers);


mod.define();
