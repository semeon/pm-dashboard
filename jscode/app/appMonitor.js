function AppMonitor(appView, appDC, appData){
    
	var self = this;
	this.updatePeriod = 200;

  // PUBLIC
  // -------------------------------------------------------------------------------------------

	this.runMonitor = function() {
		updatePendingRequestsNumber();
		appDC.totalRequestCounter = 0;
	}


  // PRIVATE
  // -------------------------------------------------------------------------------------------

	function updatePendingRequestsNumber (){
		var prevNum =         appDC.prevRequestCounter;
		var currentNum =      appDC.pendingRequestCounter;
		var totalRequestNum = appDC.totalRequestCounter;

		if (currentNum>0 && prevNum==0) {
		  var text = 'Current number of pending requests: ' + currentNum + ' of ' + totalRequestNum;
		  appView.requestStatusAlert.show(text, 'info');

		  var progressBarPosition = Math.round(100 - (currentNum/totalRequestNum)*100 );
		  appView.requestsProgressBar.show(0, 'striped');

		} else if(prevNum>0){
		  var text = 'Current number of pending requests: ' + currentNum + ' of ' + totalRequestNum;
		  appView.requestStatusAlert.update(text);

		  var progressBarPosition = Math.round(100 - (currentNum/totalRequestNum)*100 );
		  appView.requestsProgressBar.update(progressBarPosition);

		} else if(currentNum==0 && prevNum==0 && appView.requestStatusAlert.isActive){
		  appView.requestStatusAlert.hide();
		  appView.requestsProgressBar.hide();
		  appDC.totalRequestCounter = 0;

		} else if(currentNum==0 && prevNum>0){

		}

		appDC.prevRequestCounter = currentNum;
		setTimeout(updatePendingRequestsNumber, self.updatePeriod);
	}


}