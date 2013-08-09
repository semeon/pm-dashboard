function DbController(userSettings, appSettings, redmineSettings, eventHandler) {

// -------------------------------------------------------------------------------------------
// Iris's CouchDB try
// -------------------------------------------------------------------------------------------
	this.testDbReq = function () {
		console.log('DEBUG Click');
	 	
	 	var requestUri = 'https://junior.iriscouch.com/dashboard_stats/my_id?callback=?';
		function callback(data) {
			console.log('DB Req callback');
		}

		dbRequest(requestUri, null, callback);
	}

	function dbRequest(requestUri, requestParams, callback) {
		$.ajax({
			url: requestUri,
			type: "GET",
			dataType: "jsonp",
			contentType: "application/json"
		});
	}  

	
}
