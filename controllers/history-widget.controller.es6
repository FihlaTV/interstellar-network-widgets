import {Account, Server} from 'js-stellar-lib';
import {Widget, Inject} from 'interstellar-core';
import {find} from 'lodash';
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
    let address = session.getAddress();

    AccountObservable.getTransactions(address)
      .then(transactions => {
        this.transactions = transactions.records;
        $scope.$apply();
        AccountObservable.registerTransactionListener(address, transaction => this.onTransaction.call(this, transaction));
      });
  }

  onTransaction(transaction) {
    if (find(this.transactions, t => t.id === transaction.id)) {
      return;
    }
    this.transactions.unshift(transaction);
    this.$scope.$apply();
  }
}
