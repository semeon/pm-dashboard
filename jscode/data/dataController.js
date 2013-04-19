function DataController(userSettings, appSettings, redmineSettings, eventHandler){

	var self = this;

	// this.dataModel = new DataModel(userSettings, appSettings, redmineSettings);
	this.data = new DataModel(userSettings);

	// this.prevRequestCounter = 0;
	// this.pendingRequestCounter = 0;
	// this.totalRequestCounter = 0;


// ========================================================================================================
// PUBLIC
// ========================================================================================================

	// --------------------------------------------------------------------------------------------------------
	this.startInitialDataLoad = function() {
		console.log('Starting startInitialDataLoad: structured requests');
		for(var p=0; p<userSettings.projects.length; p++) {
			console.log('Calling loadProjectData for ' + userSettings.projects[p].id);
			loadProjectData(userSettings.projects[p].id);
		}

	}

	// --------------------------------------------------------------------------------------------------------
	this.reloadVersionData = function(project, version) {
		console.log('Calling reload data for ' + project.id + ' / ' + version.name);
		version.reset();
		loadVersionIssuesData(project, version);
	}

	// --------------------------------------------------------------------------------------------------------
	this.createDataStructureFromAllIssues = function(project, version) {
		self.data.calculateStatistics(project, version);
	}


//-----------------------------------------------------------------------------------------------------
// PROJECT DATA LOAD
//-----------------------------------------------------------------------------------------------------

	//-----------------------------------------------------------------------------------------------------
	function loadProjectData(projectId) {
		console.log('Starting getVersionList for ' + projectId);

		var userProject = userSettings.getProjectSettingsById(projectId);
		var dataProject = self.data.projects[userProject.id];

		console.log('Cheking, if the project already exist');
		if(dataProject == undefined) {
			console.log(' - It doesn\'t, creating a new one.');
			dataProject = self.data.createProject(userProject);

		} else {
			console.log(' - It does, proceeding with it.');
		}
		console.log('Calling issue load for ' + dataProject.id);
		loadVersions(dataProject);
	}//----------------------------------------------------------------------------------------------------


	//-----------------------------------------------------------------------------------------------------
	function loadVersions(project, loadIssues) {
		console.log('Starting getVersionList for ' + project.id);

	    var requestUrl =  redmineSettings.redmineUrl + 
	                      redmineSettings.projectDataUrl + 
	                      project.id + '/' +
	                      redmineSettings.versionsRequestUrl + 
	                      redmineSettings.jsonRequestModifier;

		console.log('Requesting versions for ' + project.id);

		requestVersions(project, requestUrl);  

	    // Request --------------------------------------------------------------
		function requestVersions (project, requestUrl) {

			var requestParameters = { status: 'open'};

			genericRequest( requestUrl, 
							requestParameters, 
							function (data) {
								processVersions(data, project);
							});
		}

		// Response processing -------------------------------------------------
	    function processVersions(data, project) {
			console.log('Starting procesing versions for ' + project.id);

			if (data.versions) {

				if (data.total_count > redmineSettings.responseLimit) {
					// TODO - Use pagination here
					alert('Warning! Redmine response limit is exceeded.' +
					      '\nRequested items count: ' + data.total_count + '.' +
					      '\nLimit: ' + redmineSettings.responseLimit + '.'
					      );
				}
				eventHandler.projectLoadCompleted(project);

				for (var v=0; v<data.versions.length; v++) {
					if (data.versions[v].status != 'closed') {
						// Creating a new version
						// ------------------------------
						var version = self.data.createVersion(project, data.versions[v]);
						eventHandler.versionCreated(project, version);

						console.log('Calling load issues by version for ' + project.id + ' / ' + version.name);
						loadVersionIssuesData(project, version);
					}
					// ------------------------------
				}

			} else if (data.error) { 
				console.log(data.error);
				eventHandler.dataLoadErrorOccured(data.error);

			} else {
				console.log(data.error);
				eventHandler.genericErrorOccured('AJAX Data load');
			}

			
	    }
	}//----------------------------------------------------------------------------------------------------


// --------------------------------------------------------------------------------------------------------
// VERSION DATA LOAD
// --------------------------------------------------------------------------------------------------------

	function loadVersionIssuesData(project, version) {
		console.log('Starting batch load for ' + project.id + ' / ' + version.name);

	    var requestUrl =  redmineSettings.redmineUrl + 
	                      redmineSettings.projectDataUrl + 
	                      project.id + '/' +
	                      redmineSettings.issuesRequestUrl + 
	                      redmineSettings.jsonRequestModifier;

		eventHandler.versionBatchLoadStarted(project, version);
	    requestIssuesPage(project, version, requestUrl, 0);

	    // Request --------------------------------------------------------------
		function requestIssuesPage (project, version, requestUrl, offset) {

			var requestParameters = { offset: offset, 
									  status_id: '*',
									  fixed_version_id: version.id
									 };

			console.log('Requesting issues page ' + offset + ' for ' + project.id + ' / ' + version.name);
			console.log(' - URL:  ' + requestUrl);

			genericRequest( requestUrl, 
							requestParameters, 
							function (data) {
								processIssuesPage(data, requestParameters, project, version, requestUrl);
							});
		} // --------------------------------------------------------------------

		// Response processing --------------------------------------------------
		function processIssuesPage (data, rp, project, version, requestUrl) {
			console.log('Processing issues page ' + rp.offset + ' for ' + project.id + ' / ' + version.name);

			if (data.issues) {

				var prevPagesIssueCount = version.sourceIssues.length;
				var currentPageIssueCount = data.issues.length;

				if( (prevPagesIssueCount+currentPageIssueCount) > data.total_count) {
					var diff = data.total_count - prevPagesIssueCount;
					var notLoadedIssues = data.issues.slice(currentPageIssueCount-diff);
					version.sourceIssues = version.sourceIssues.concat(notLoadedIssues);

				} else {
					version.sourceIssues = version.sourceIssues.concat(data.issues);
				}

				var loadedIssuesCount = version.sourceIssues.length;
				eventHandler.versionBatchLoadUpdated(project, version, loadedIssuesCount, data.total_count);

				if (loadedIssuesCount < data.total_count) {
					var nexPageNum = currentPageIssueCount;
					console.log(' - Calling next page load, page ' + nexPageNum);
					requestIssuesPage(project, version, requestUrl, nexPageNum);

				} else {
					eventHandler.versionBatchLoadCompleted(project, version);
				}
			} else if (data.error) { 
				console.log(data.error);
				eventHandler.dataLoadErrorOccured(data.error);

			} else {
				console.log(data.error);
				eventHandler.genericErrorOccured('AJAX Data load');
			}
		} // --------------------------------------------------------------------
	}


// --------------------------------------------------------------------------------------------------------
// GENERIC REQUEST
// --------------------------------------------------------------------------------------------------------
	function genericRequest(requestUri, requestParams, callback) {
		self.pendingRequestCounter++;
		self.totalRequestCounter++;
		requestParams.key = redmineSettings.userKey;
		requestParams.limit = redmineSettings.responseLimit;
		requestParams.subproject_id= '!*';

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