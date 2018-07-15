app.controller("startingScreenController", startingScreenController);

function startingScreenController($scope, $timeout, $interval, localStorageService) {
	
	$scope.loading = false;
	$scope.getLoading = function() { return $scope.loading }
	$scope.setLoading = function(set) { $scope.loading = set }
	
	$scope.defaultKeys = localStorageService.get("defaultWiFiKeys");
	$scope.tries = 0;
	
	$scope.waitForConnection = function() {
		//check currentSSID until equals the default one
		WifiWizard.getCurrentSSID(function(SSID) {
			$timeout(function() {
				if (SSID != '\"'+$scope.defaultKeys.SSID+'\"' && $scope.tries <= 150) {
					$scope.waitForConnection();
					$scope.tries++;
				} else if (SSID != '\"'+$scope.defaultKeys.SSID+'\"' && $scope.tries > 150) {
					window.screen.orientation.unlock();
					window.screen.orientation.lock("landscape");
					$scope.setStartScreenActive(false);
					$scope.setSettingsScreenActive(true);
					$scope.setConnected(false);
					$scope.setControlsScreenActive(false);
					$scope.setLoading(false);
					$scope.showSimpleToast("Non riesco a connettermi! Scegli la rete manualmente");
				} else {
					//TODO fare il check con arduino
					window.screen.orientation.unlock();
					window.screen.orientation.lock("landscape");
					$scope.setStartScreenActive(false);
					$scope.setSettingsScreenActive(false);
					$scope.setConnected(true);
					$scope.setControlsScreenActive(true);
					$scope.setLoading(false);
				}
			}, 100, false, SSID);
		}, function() {
			$timeout(function() {
				$scope.showSimpleToast("Non riesco ad ottenere l'SSID corrente");
			})
		});
	}
	
	$scope.begin = function(event) {
		$scope.setLoading(true);
		if ($scope.defaultKeys == null) {
			$timeout(function() {
				window.screen.orientation.unlock();
				window.screen.orientation.lock("landscape");
				$scope.setStartScreenActive(false);
				$scope.setSettingsScreenActive(true);
				$scope.setConnected(false);
				$scope.setControlsScreenActive(false);
				$scope.setLoading(false);
				$scope.showSimpleToast("Configurazioni di default non trovate!");
			}, 3219)
		} else {
			//trovo le chiavi di default, provo a connettermi automagicamente
			WifiWizard.addNetwork(WifiWizard.formatWPAConfig($scope.defaultKeys.SSID, $scope.defaultKeys.PWD), null, null);
			WifiWizard.connectNetwork($scope.defaultKeys.SSID, function() {
				//chiamo la funzione per aspettare che mi sono connesso
				$timeout(function() {
					$scope.waitForConnection();
					$scope.tries++;
				}, 100);
			}, function() {
				$timeout(function() {
					window.screen.orientation.unlock();
					window.screen.orientation.lock("landscape");
					$scope.setStartScreenActive(false);
					$scope.setConnected(false);
					$scope.setSettingsScreenActive(true);
					$scope.setControlsScreenActive(false);
					$scope.setLoading(false);
					$scope.showSimpleToast("Connessione fallita! Scegli la rete manualmente");
				}, 100)
			});
		}
	}
}