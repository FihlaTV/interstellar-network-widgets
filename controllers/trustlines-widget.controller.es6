require('../styles/trustlines-widget.scss');
import {Widget, Inject} from 'interstellar-core';
import {Account, Currency, Keypair, Operation, TransactionBuilder} from 'stellar-sdk';

@Widget('trustlines', 'TrustlinesWidgetController', 'interstellar-network-widgets/trustlines-widget')
@Inject("$scope", "interstellar-sessions.Sessions", "interstellar-network.Server")
export default class TrustlinesWidgetController {
  constructor($scope, Sessions, Server) {
    if (!Sessions.hasDefault()) {
      console.error('No session. This widget should be used with active session.');
      return;
    }

    this.$scope = $scope;
    this.Sessions = Sessions;
    this.Server = Server;

    this.session = Sessions.default;
    this.errors = [];
  }

  createTrustline() {
    this.errors = [];

    if (!this.currency || !this.issuer) {
      this.errors.push('All fields should be filled.');
      return;
    }

    this.Sessions.loadDefaultAccount()
      .then(() => {
        if (!this.session.getAccount()) {
          this.errors.push('Your account is not funded.');
          return;
        }

        return new TransactionBuilder(this.session.getAccount())
          .addOperation(Operation.changeTrust({
            currency: new Currency(this.currency, this.issuer)
          }))
          .addSigner(Keypair.fromSeed(this.session.getSecret()))
          .build();
      })
      .then(transaction => this.Server.submitTransaction(transaction))
      .then(result => {
        this.result = result;
      })
      .finally(() => this.$scope.$apply());
  }
}
