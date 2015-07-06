require('../styles/delete-account-widget.scss');
import {Widget, Intent, Inject} from 'interstellar-core';
import {Account, Operation, Keypair, TransactionBuilder} from 'js-stellar-lib';

@Widget('deleteAccount', 'DeleteAccountWidgetController', 'interstellar-network-widgets/delete-account-widget')
@Inject("$scope", "interstellar-sessions.Sessions", "interstellar-core.IntentBroadcast", "interstellar-network.Server")
export default class DeleteAccountWidgetController {
  constructor($scope, Sessions, IntentBroadcast, Server) {
    if (!Sessions.hasDefault()) {
      console.error('No session. This widget should be used with active session.');
      return;
    }

    this.$scope = $scope;
    this.session = Sessions.default;
    this.Server = Server;
    this.IntentBroadcast = IntentBroadcast;
    this.destination = null;
  }

  deleteAccount() {
    this.error = null;

    if (!(this.destination && Account.isValidAddress(this.destination))) {
      this.error = 'Destination address is not valid.';
      return;
    }

    let transaction = new TransactionBuilder(this.session.getAccount())
      .addOperation(Operation.accountMerge({
        destination: this.destination
      }))
      .addSigner(Keypair.fromSeed(this.session.getSecret()))
      .build();

    this.Server.submitTransaction(transaction)
      .then(() => {
        let intent = new Intent(Intent.TYPES.LOGOUT);
        this.IntentBroadcast.sendBroadcast(intent);
      })
      .catch(e => this.error = 'Network error.')
      .finally(() => this.$scope.$apply());
  }
}
