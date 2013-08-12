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

		// dbRequest('GET', null, callback);
		// debug_createNewDoc();
		saveSnapshot();
		
	}

	this.saveVersion = function(project, version) {
		   //      for (var it=0; it<project.issueTrackers.length; it++) {

					// var columns = project.customStatuses;
					// var columnCounter = 0;
					// for (cs in columns) {
					// 	columnCounter++;

					// 	var groupName = columns[cs].title;
					// 	var issues = version.getIssuesByCustomStatusAndTracker(groupName, trackerId);

					// 	console.log('-- Creating cell for custom status: ' + groupName);
					// 	rowNode.append( createDataCell(issues, rowCounter, columnCounter, trackerName + ' / ' + groupName) );
					// }		        	
	}


	function saveSnapshot () {
		// create
		var newSnapshot = createSnapshotObject('pkserver', '462', '1', '1', 'VAL_' + moment().format('hh:mm:ss') );
		
		function writeToDb (snapshot, rev) {
			console.log('writeToDb: ' + snapshot._id);
			console.log('writeToDb rev: ' + rev);

			if (rev) {
				snapshot._rev = rev;
			}

			function success(data){
				console.log('Document ' + snapshot._id + ' successfully saved to DB.');
			};

		 	dbRequest('PUT', snapshot._id, JSON.stringify(snapshot), success);	
		}	

		// Check doc
		debug_checkDoc(newSnapshot, writeToDb);
	}

	
	function debug_checkDoc(snapshot, writeToDb) {
		var docId = snapshot._id;

		function successCallback(data) {
			console.log('Doc exists: ' + docId);
			// console.log(data._rev);

			writeToDb(snapshot, data._rev);
		}

		function errorCallback(data) {
			console.log('Doc doesnt exist: ' + docId);
			// console.log(data);
			// console.log(data._rev);
			writeToDb(snapshot);
		}

		console.log('Checking the doc: ' + docId);
	 	dbRequest('GET', docId, null, successCallback, errorCallback);
	}



	function createSnapshotObject(pId, vId, tId, sId, v) {
		var date = moment().format('YYYY-MM-DD:hh');
		var id = pId + '_' + vId + '_' + tId +'_' + sId + '_' + date;

		var snapshot = {};
		snapshot['_id'] = id;
		snapshot['projectId'] = pId;
		snapshot['versionId'] = vId;
		snapshot['trackerId'] = tId;
		snapshot['statusId'] = sId;
		snapshot['date'] = date;
		snapshot['value'] = v;
		return snapshot;
	}

	function dbRequest(type, urlParams, data, success, error) {
		console.log('dbRequest..');

		var dbUri = appSettings.dbUri + urlParams;
		console.log('dbUri: ' + dbUri);

		$.ajax({
			url: dbUri,
			type: type,
			dataType: "json",
			data: data,
			contentType: "application/json",
			success: success,
			error: error
		});
	}  

	
}
