function DataController(userSettings, appSettings, redmineSettings){

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
			var pid = userSettings.projects[p].id;
			loadProjectData(pid);
		}


	}


	// --------------------------------------------------------------------------------------------------------
	this.getQueryResult = function(projectId, queryId) {
	    var requestUrl =  redmineSettings.redmineUrl + 
	                      redmineSettings.issuesRequestUrl + 
	                      redmineSettings.jsonRequestModifier;

	    function processRequestResult (data, requestParams) {
			var linkHref =  redmineSettings.redmineUrl + 
							redmineSettings.issuesRequestUrl +
							'?query_id=' + requestParams.query_id + 
							'&project_id=' + requestParams.project_id;
			self.appView.showQueryResult(requestParams.query_id, data.total_count, linkHref);
	    }

	    genericRequest(userSettings.queryURL + '.json', 
	                        {
	                          project_id: projectId,
	                          query_id: queryId,
	                          key: redmineSettings.userKey
	                        },
	                        processRequestResult
	                        ); 
  }



// ========================================================================================================
// PRIVATE
// ========================================================================================================


	// --------------------------------------------------------------------------------------------------------
	function loadProjectData(projectId) {
		getVersionList(projectId);



	    // Load issues by status

	    // Assign issues groups to versions
	}


 	// --------------------------------------------------------------------------------------------------------
	function getVersionList(projectId) {
	    var requestUrl =  redmineSettings.redmineUrl + 
	                      redmineSettings.projectDataUrl + 
	                      projectId + '/' +
	                      redmineSettings.versionsRequestUrl + 
	                      redmineSettings.jsonRequestModifier;

	    function processVersions(data, requestParams) {
			var project = {};	  
			project.versions = {};
			if (data.total_count > redmineSettings.responseLimit) {
			alert('Warning! Redmine response limit is exceeded.' +
			      '\nRequested items count: ' + data.total_count + '.' +
			      '\nLimit: ' + redmineSettings.responseLimit + '.'
			      );
			}

			for (var v=0; v<data.total_count; v++) {
				var version = data.versions[v];
				project.versions[version.id] = version;
			}

			self.dataModel.projectList[projectId] = project;
	    }

		genericRequest(
						requestUrl, 
						{key: redmineSettings.userKey}, 
						processVersions);  
	}


	// --------------------------------------------------------------------------------------------------------
	function genericRequest(requestUri, requestParams, callback) {
		self.pendingRequestCounter++;
		self.totalRequestCounter++;

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