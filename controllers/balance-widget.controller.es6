require('../styles/balance-widget.scss');
import {Inject} from 'interstellar-core';
import {sortBy} from 'lodash';

@Inject("$scope", "interstellar-sessions.Sessions", "interstellar-network.Server")
export class BalanceWidgetController {
  constructor($scope, Sessions, Server) {
    if (!Sessions.hasDefault()) {
      console.error('No session. This widget should be used with active session.');
      return;
    }

    let session = Sessions.default;
    let address = session.getAddress();
    Server.accounts(address)
      .then(account => {
        if (!account) {
          this.balances = {balance: 0, currency_code: 'STR'};
        } else {
          this.balances = sortBy(account.balances, balance => balance.currency_type !== 'native');
          this.balances[0].balance = Math.floor(this.balances[0].balance/1000000);
          this.balances[0].currency_code = 'STR';
        }
        $scope.$apply();
      })
      .catch(error => {
        console.error(error);
      });
  }
}

module.exports = function(mod) {
  mod.controller("BalanceWidgetController", BalanceWidgetController);
};
