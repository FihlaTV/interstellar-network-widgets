require('../styles/send-widget.scss');

import {Inject, Intent} from 'interstellar-core';
import {Account, Currency, Keypair, Operation, TransactionBuilder} from 'js-stellar-lib';
import moduleDatastore from "../util/module-datastore.es6";

@Inject("$scope", "interstellar-sessions.Sessions", "interstellar-network.Server")
class SendWidgetController {
  constructor($scope, Sessions, Server) {
    if (!Sessions.hasDefault()) {
      console.error('No session');
      return;
    }

    this.$scope = $scope;
    this.Server = Server;
    this.Sessions = Sessions;
    this.session = Sessions.default;
    this.destinationAddress = moduleDatastore.get('destinationAddress');
    this.transactionSent = false;
    this.errors = [];
  }

  send() {
    this.errors = [];
    this.transactionSent = false;

    if (!Account.isValidAddress(this.destinationAddress)) {
      this.errors.push('Destination address is not valid.');
      return;
    }

    if (!this.session.getAccount()) {
      this.Sessions.loadDefaultAccount()
        .then(() => {
          if (!this.session.getAccount()) {
            this.errors.push('Your account is not funded.');
            return;
          }
          this._send();
        });
    } else {
      this._send();
    }
  }

  _send() {
    let currency = Currency.native();
    let amount = this.amount * 1000000;
    let transaction = new TransactionBuilder(this.session.getAccount())
      .addOperation(Operation.payment({
        destination: this.destinationAddress,
        currency: currency,
        amount: amount
      }))
      .addSigner(Keypair.fromSeed(this.session.getSecret()))
      .build();

    this.Server.submitTransaction(transaction)
      .then(transactionResult => {
        this.transactionSent = true;
      })
      .catch(e => {
        this.errors.push('Network error.');
        console.error(e);
      })
      .finally(() => this.$scope.$apply());
  }
}

module.exports = function(mod) {
  mod.controller("SendWidgetController", SendWidgetController);
};
