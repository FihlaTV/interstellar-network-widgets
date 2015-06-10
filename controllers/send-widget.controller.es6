require('../styles/send-widget.scss');

import {Inject, Intent} from 'interstellar-core';
import {Account, Currency, Keypair, Operation, TransactionBuilder} from 'js-stellar-lib';
import moduleDatastore from "../util/module-datastore.es6";

@Inject("$scope", "interstellar-sessions.Sessions", "interstellar-network.Server", "interstellar-stellar-api.StellarApi")
class SendWidgetController {
  constructor($scope, Sessions, Server, StellarApi) {
    if (!Sessions.hasDefault()) {
      console.error('No session');
      return;
    }

    this.$scope = $scope;
    this.Server = Server;
    this.Sessions = Sessions;
    this.StellarApi = StellarApi;
    this.session = Sessions.default;
    this.destination = moduleDatastore.get('destinationAddress');
    this.transactionSent = false;
    this.errors = [];

    $scope.$watch('widget.destination', (newValue, oldValue) => {
      this.onChangeDestination.call(this, newValue, oldValue);
    });
  }

  onChangeDestination() {
    if (!this.destination) {
      this.destinationAddress = null;
      this.errors = [];
      return;
    }

    this.errors = [];
    this.destinationAddress = null;
    if (Account.isValidAddress(this.destination)) {
      this.destinationAddress = this.destination;
    } else {
      this.StellarApi.federation(this.destination, 'stellar.org')
        .success(data => {
          this.destinationAddress = data.federation_json.destination_new_address;
        })
        .error((data, status) => {
          if (status === 404) {
            this.errors.push('Can\'t find this user in federation database.');
          } else {
            this.errors.push('Federation server error.');
          }
        });
    }
  }

  send() {
    this.errors = [];
    this.transactionSent = false;

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
    if (!(this.destinationAddress && Account.isValidAddress(this.destinationAddress))) {
      this.errors.push('Destination address is not valid.');
      return;
    }

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
