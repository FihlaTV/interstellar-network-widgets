require('../styles/balance-widget.scss');
import {Inject} from 'interstellar-core';
import {sortBy} from 'lodash';

@Inject("$scope", "interstellar-sessions.Sessions", "interstellar-network.AccountObservable", "interstellar-network.Server")
export class BalanceWidgetController {
  constructor($scope, Sessions, AccountObservable, Server) {
    if (!Sessions.hasDefault()) {
      console.error('No session. This widget should be used with active session.');
      return;
    }

    this.$scope = $scope;
    this.Server = Server;

    let session = Sessions.default;
    this.address = session.getAddress();
    this.balances = [];
    AccountObservable.getBalances(this.address)
      .then(balances => this.onBalanceChange.call(this, balances));
    AccountObservable.registerBalanceChangeListener(this.address, balances => this.onBalanceChange.call(this, balances));
  }

  onBalanceChange(balances) {
    if (balances) {
      this.balances = sortBy(balances, balance => balance.currency_type !== 'native');
      this.balances[0].balance = Math.floor(this.balances[0].balance/1000000);
      this.balances[0].currency_code = 'STR';
    } else {
      this.balances = [{balance: 0, currency_code: 'STR'}];
    }
    this.$scope.$apply();
  }
}

module.exports = function(mod) {
  mod.controller("BalanceWidgetController", BalanceWidgetController);
};
