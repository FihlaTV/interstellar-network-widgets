import {Account, Server} from 'stellar-sdk';
import {Widget, Inject} from 'interstellar-core';
import {find, map} from 'lodash';
require('../styles/history-widget.scss');

@Widget('history', 'HistoryWidgetController', 'interstellar-network-widgets/history-widget')
@Inject("$scope", "interstellar-sessions.Sessions", "interstellar-network.AccountObservable")
export default class HistoryWidgetController {
  constructor($scope, Sessions, AccountObservable) {
    if (!Sessions.hasDefault()) {
      console.error('No session. This widget should be used with active session.');
      return;
    }

    this.$scope = $scope;
    let session = Sessions.default;
    this.address = session.getAddress();

    AccountObservable.getPayments(this.address)
      .then(payments => {
        this.payments = map(payments.records, payment => this._transformPaymentFields(payment));
        $scope.$apply();
        AccountObservable.registerPaymentListener(this.address, payment => this.onPayment.call(this, payment));
      });
  }

  onPayment(payment) {
    if (find(this.payments, p => p.id === payment.id)) {
      return;
    }
    payment = this._transformPaymentFields(payment);
    this.payments.unshift(payment);
    this.$scope.$apply();
  }

  _transformPaymentFields(payment) {
    if (payment.type_s === 'create_account') {
      payment.from   = payment.funder;
      payment.to     = payment.account;
      payment.amount = payment.starting_balance;
    }

    payment.direction = (payment.from === this.address) ? 'out' : 'in';
    payment.display_address = (payment.from === this.address) ? payment.to : payment.from;

    if (payment.asset_code) {
      payment.display_amount = `${payment.amount} ${payment.asset_code}`;
    } else {
      let amount = payment.amount / 1000000;
      payment.display_amount = `${amount} XLM`;
      payment.asset_issuer = 'stellar network';
    }

    return payment;
  }
}
