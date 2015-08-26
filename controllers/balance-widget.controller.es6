require('../styles/balance-widget.scss');
import {Widget, Inject} from 'interstellar-core';
import {isArray, sortBy} from 'lodash';

@Widget('balance', 'BalanceWidgetController', 'interstellar-network-widgets/balance-widget')
@Inject("$scope", "interstellar-sessions.Sessions", "interstellar-network.AccountObservable", "interstellar-network.Server")
export default class BalanceWidgetController {
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
    if (isArray(balances) && balances.length > 0) {
      this.balances = sortBy(balances, balance => balance.currency_type !== 'native');
      this.balances[0].balance = Math.floor(this.balances[0].balance/1000000);
      this.balances[0].currency_code = 'XLM';
    } else {
      this.balances = [{balance: 0, currency_code: 'XLM'}];
    }
    this.$scope.$apply();
  }
}
