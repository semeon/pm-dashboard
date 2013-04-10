function DataController(userSettings, appSettings, redmineSettings, eventHandler){

	var self = this;

	this.dataModel = new DataModel(userSettings, appSettings, redmineSettings);

	this.prevRequestCounter = 0;
	this.pendingRequestCounter = 0;
	this.totalRequestCounter = 0;

// ========================================================================================================
// PUBLIC
// ========================================================================================================

	// --------------------------------------------------------------------------------------------------------
	this.startInitialDataLoad = function() {
		for(var p=0; p<userSettings.projects.length; p++) {
			loadProjectData(userSettings.projects[p]);
		}
	}


	// --------------------------------------------------------------------------------------------------------
	this.getQueryResult = function(projectId, queryId, callback) {
	    var requestUrl =  redmineSettings.redmineUrl + 
	                      redmineSettings.issuesRequestUrl + 
	                      redmineSettings.jsonRequestModifier;

	    genericRequest(userSettings.queryURL + '.json', 
                        {
                          project_id: projectId,
                          query_id: queryId
                        },
                        callback
                        ); 
  }



// ========================================================================================================
// PRIVATE
// ========================================================================================================


	//-----------------------------------------------------------------------------------------------------
	function loadProjectData(userProject) {
		getVersionList(userProject);

	}//----------------------------------------------------------------------------------------------------


	//-----------------------------------------------------------------------------------------------------
	function getVersionList(userProject) {
	    var requestUrl =  redmineSettings.redmineUrl + 
	                      redmineSettings.projectDataUrl + 
	                      userProject.id + '/' +
	                      redmineSettings.versionsRequestUrl + 
	                      redmineSettings.jsonRequestModifier;
	    // Request
		genericRequest( requestUrl, {}, processVersions);  

		// Response processing
	    function processVersions(data) {
			var project = {};	  
			self.dataModel.projects[userProject.id] = project;

			project.id = userProject.id;
			project.versions = {};

			if (data.total_count > redmineSettings.responseLimit) {
				alert('Warning! Redmine response limit is exceeded.' +
				      '\nRequested items count: ' + data.total_count + '.' +
				      '\nLimit: ' + redmineSettings.responseLimit + '.'
				      );
			}

			for (var v=0; v<data.versions.length; v++) {
				var version = data.versions[v];

				if (version.status != 'closed') {
					project.versions[String(version.id)] = version;
					version.issueGroups = {};

					// fill statuses with issues
					getIssuesCount(project, version.issueGroups, userProject.customStatuses, version.id);

					var d = 1;
				}
			}
			
	    }

	}//----------------------------------------------------------------------------------------------------

 	// ----------------------------------------------------------------------------------------------------
	function getIssuesCount(project, issueGroups, customStatuses, verId) {

		var requestUrl =  	redmineSettings.redmineUrl + redmineSettings.projectDataUrl + 
							project.id + '/' + redmineSettings.issuesRequestUrl + 
							redmineSettings.jsonRequestModifier;

		for (var i=0; i<customStatuses.length; i++){
			var issueGroup = {};

			issueGroups[customStatuses[i].title] = issueGroup;
			issueGroup.count = 0;
			issueGroup.title = customStatuses[i].title;
			issueGroup.ver = verId;
			issueGroup.includes = customStatuses[i].includes;

			sendIssueGroupRequests (project, issueGroup, customStatuses);
		}

		function sendIssueGroupRequests (project, group, customStatuses) {
			var standardStatuses = group.includes;

			for (var j=0; j<standardStatuses.length; j++) {
				var requestParams = {
					fixed_version_id: 	group.ver,
					status_id: 			standardStatuses[j],
				};

				// Request
				genericRequest( requestUrl, 
								requestParams, 
								function (data) {
									processIssuegroupResponse(data, group);
								});
			}
		}
		
		// Response processing
		function processIssuegroupResponse(responseData, gr) {
			// console.log('Response processing..  Ver:' +gr.ver);
			// console.log(gr);
			// console.log('Response data: ');
			// console.log(responseData);
			// console.log('Issues to add: ');
			// console.log(responseData.total_count);

			if (responseData.total_count || responseData.total_count == 0) {
				gr.count += responseData.total_count;

			} else if (responseData.error) { 
				eventHandler.dataLoadErrorOccured(responseData.error);

			} else {
				eventHandler.genericErrorOccured('AJAX Data load');
			}

		}


	} // --------------------------------------------------------------------------------------------------





	// --------------------------------------------------------------------------------------------------------
	function genericRequest(requestUri, requestParams, callback) {
		self.pendingRequestCounter++;
		self.totalRequestCounter++;
		requestParams.key = redmineSettings.userKey;
		requestParams.limit = redmineSettings.responseLimit;

		$.getJSON(
		          requestUri,
		          requestParams,
		          function(data) {
		            self.pendingRequestCounter--;
		            callback(data, requestParams);
		          }
		         );

	}  


}