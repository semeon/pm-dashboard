function DbController(userSettings, appSettings, redmineSettings, eventHandler) {

// -------------------------------------------------------------------------------------------
// Iris's CouchDB try
// -------------------------------------------------------------------------------------------
// http://wiki.apache.org/couchdb/Reference


	this.testDbReq = function () {
		console.log('DEBUG Click');
	 	
	 	var requestUri = appSettings.dbUri + 'doc1';
	 	// var requestUri = 'https://junior.iriscouch.com/dashboard_stats/my_id';
	 	// var requestUri = 'https://junior:eloisre@junior.cloudant.com/dashboard_stats/my_id_1?callback=?';

		function callback(data) {
			console.log('DB Req callback');
			console.log(data);
		}

		dbRequest(requestUri, null, callback);
	}

	function dbRequest(requestUri, requestParams, callback) {
		console.log('dbRequest..');
		$.ajax({
			url: requestUri,
			type: "GET",
			dataType: "json",
			contentType: "application/json",
			success: callback
		});
	}  

	
}
