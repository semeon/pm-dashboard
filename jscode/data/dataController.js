function DataController(userSettings, appSettings, redmineSettings, eventHandler){

	var self = this;

	// this.dataModel = new DataModel(userSettings, appSettings, redmineSettings);
	this.data = {};
	self.data.projects = {};

	this.prevRequestCounter = 0;
	this.pendingRequestCounter = 0;
	this.totalRequestCounter = 0;


// ========================================================================================================
// PUBLIC
// ========================================================================================================

	// --------------------------------------------------------------------------------------------------------
	this.startInitialDataLoad = function() {
		console.log('Starting startInitialDataLoad: structured requests');
		for(var p=0; p<userSettings.projects.length; p++) {
			console.log('Calling loadProjectData for ' + userSettings.projects[p].id);
			loadProjectData(userSettings.projects[p].id, true);
		}

	}


	// --------------------------------------------------------------------------------------------------------
	this.reloadProductData = function(project) {
		console.log('Calling reload project versions for ' + project.id);
		loadVersions(project);
	}

	// --------------------------------------------------------------------------------------------------------
	this.reloadVersionData = function(project, version) {
		console.log('Calling reload version data for ' + project.id + ' / ' + version.name);
	}

//-----------------------------------------------------------------------------------------------------
// CUSTOM QUERIES
//-----------------------------------------------------------------------------------------------------

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


//-----------------------------------------------------------------------------------------------------
// SRTUCTURED ISSUES REQUESTS
//-----------------------------------------------------------------------------------------------------

	//-----------------------------------------------------------------------------------------------------
	function loadProjectData(projectId, batch) {
		console.log('Starting getVersionList for ' + projectId);

		var userProject = userSettings.getProjectSettingsById(projectId);

		var dataProject = self.data.projects[userProject.id];

		console.log('Cheking, if the project already exist');
		if(dataProject == undefined) {
			console.log(' - It doesn\'t, creating a new one.');
			dataProject = {};
			self.data.projects[userProject.id] = dataProject;

			dataProject.id = userProject.id;
			dataProject.title = userProject.title;
			dataProject.versions = {};
			dataProject.allIssues = [];
			dataProject.customStatuses = userProject.customStatuses;
			dataProject.issueTrackers = userProject.issueTrackers;

		} else {
			console.log(' - It does, proceeding with it.');
		}

		if (batch) {
			console.log('Calling batch issue load for ' + dataProject.id);
			batchLoadProjectData(dataProject);
		} else {
			console.log('Calling getVersionList for ' + dataProject.id);
			loadVersions(dataProject);
		}
	}//----------------------------------------------------------------------------------------------------


	//-----------------------------------------------------------------------------------------------------
	function loadVersions(project) {
		console.log('Starting getVersionList for ' + project.id);

	    var requestUrl =  redmineSettings.redmineUrl + 
	                      redmineSettings.projectDataUrl + 
	                      project.id + '/' +
	                      redmineSettings.versionsRequestUrl + 
	                      redmineSettings.jsonRequestModifier;

		console.log('Requesting versions for ' + project.id);

		requestVersions(project, requestUrl);  

	    // Request
		function requestVersions (project, requestUrl) {
			genericRequest( requestUrl, 
							{}, 
							function (data) {
								processVersions(data, project);
							});
		}

		// Response processing
	    function processVersions(data, project) {
			console.log('Starting procesing versions for ' + project.id);

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
					loadVersion(	project, 
									version);

					var d = 1;
				}
			}
			
	    }
	}//----------------------------------------------------------------------------------------------------

 	// ----------------------------------------------------------------------------------------------------
	function loadVersion(project, version, issueGroups, customStatuses, verId) {

		var requestUrl =  	redmineSettings.redmineUrl + redmineSettings.projectDataUrl + 
							project.id + '/' + redmineSettings.issuesRequestUrl + 
							redmineSettings.jsonRequestModifier;

		for (var i=0; i<project.customStatuses.length; i++){
			var issueGroup = {};
			version.issueGroups[project.customStatuses[i].title] = issueGroup;

			issueGroup.count = 0;
			issueGroup.title = project.customStatuses[i].title;
			issueGroup.ver = version.id;
			issueGroup.prId = project.id;
			issueGroup.includes = project.customStatuses[i].includes;
			issueGroup.requestCounter = 0;
			issueGroup.requestsTotal = project.customStatuses[i].includes.length * project.issueTrackers.length;

			loadTrackersAndStatuses (project, issueGroup);
		}

		function loadTrackersAndStatuses (project, group) {
			var trackers = project.issueTrackers;
			var standardStatuses = group.includes;

			for (var t=0; t<trackers.length; t++) {
				var trackerId = trackers[t];

				for (var s=0; s<standardStatuses.length; s++) {
					var statusId = standardStatuses[s];
					var requestParams = {
						fixed_version_id: 	group.ver,
						status_id: 			statusId,
						tracker_id: 		trackerId
					};

					sendIssueStatusRequest( requestUrl, requestParams, group);
				}

			}
		}



		// Request
		function sendIssueStatusRequest (requestUrl, requestParams, group) {

			console.log('Requesting issues for project/version/group/tracker/status_id: ' + 
						group.prId + '/' + 
						group.ver + '/' + 
						group.title + '/' +
						requestParams.tracker_id + '/' +
						requestParams.status_id
						);

			genericRequest( requestUrl, 
							requestParams, 
							function (data) {
								processIssuegroupResponse(data, requestParams, group);
							});
		}


		// Response processing
		function processIssuegroupResponse(responseData, rp, gr) {

			gr.requestCounter += 1;

			if (responseData.total_count || responseData.total_count == 0) {
				console.log('Processing issues: ' + 

							'prj: ' + gr.prId + ', ' + 
							'ver: ' + gr.ver + ', ' + 
							'group: ' + gr.title + ', ' + 
							'request: ' + gr.requestCounter + ' of ' + gr.requestsTotal + ', ' + 
							'tracker: ' + rp.tracker_id + ', ' + 
							'status: ' + rp.status_id + ', ' + 
							'result: ' + responseData.total_count );

				if (responseData.total_count>0) {
					console.log(' - EXAMPLE> Tracker: ' + 	
									responseData.issues[0].tracker.name + ' (' + 
									responseData.issues[0].tracker.id + '), Status: ' + 
											responseData.issues[0].status.name + ' (' + 
											responseData.issues[0].status.id + ')');
					gr.count += responseData.total_count;

				}

				if(gr.requestCounter == gr.requestsTotal) {
					console.log('Issue group calculated.');
					eventHandler.onProjectDataUpdate(gr.prId, gr.ver, gr.title, gr.count);
				}

			} else if (responseData.error) { 
				console.log(responseData.error);
				eventHandler.dataLoadErrorOccured(responseData.error);

			} else {
				console.log(responseData.error);
				eventHandler.genericErrorOccured('AJAX Data load');
			}

		}
	} // --------------------------------------------------------------------------------------------------



// --------------------------------------------------------------------------------------------------------
// BATCH ISSUE LOAD
// --------------------------------------------------------------------------------------------------------

	function batchLoadProjectData(project) {
	    var requestUrl =  redmineSettings.redmineUrl + 
	                      redmineSettings.projectDataUrl + 
	                      project.id + '/' +
	                      redmineSettings.issuesRequestUrl + 
	                      redmineSettings.jsonRequestModifier;

		eventHandler.projectBatchLoadStarted(project);

	    requestIssuesPage(project, requestUrl, 0);


	    // Request
		function requestIssuesPage (project, requestUrl, offset) {

			var requestParameters = { offset: offset };

			console.log('Requesting issues page ' + offset + ' for ' + project.id);
			console.log(' - URL:  ' + requestUrl);

			genericRequest( requestUrl, 
							requestParameters, 
							function (data) {
								processIssuesPage(data, requestParameters, project, requestUrl);
							});
		}

		function processIssuesPage (data, rp, project, requestUrl) {
			console.log('Processing issues page ' + rp.offset + ' for ' + project.id);
			console.log(data);

			if (data.issues) {

				var prevPagesIssueCount = project.allIssues.length;
				var currentPageIssueCount = data.issues.length;

				if( (prevPagesIssueCount+currentPageIssueCount) > data.total_count) {
					var diff = data.total_count - prevPagesIssueCount;
					var notLoadedIssues = data.issues.slice(currentPageIssueCount-diff);
					project.allIssues = project.allIssues.concat(notLoadedIssues);

				} else {
					project.allIssues = project.allIssues.concat(data.issues);
				}

				var loadedIssuesCount = project.allIssues.length;

				// console.log(' - Previously loaded issues: ' + prevPagesIssueCount);
				// console.log(' - Issues loaded on current page: ' + currentPageIssueCount);
				// console.log(' - Total issues loaded so far: ' + loadedIssuesCount);

				eventHandler.projectBatchLoadUpdated(project.id, loadedIssuesCount, data.total_count);

				if (loadedIssuesCount < data.total_count) {
					var nexPageNum = rp.offset + 1;
					console.log(' - Calling next page load, page ' + nexPageNum);
					requestIssuesPage(project, requestUrl, nexPageNum);
				} else {
					eventHandler.projectBatchLoadCompleted(project);
				}



			} else if (data.error) { 
				console.log(data.error);
				eventHandler.dataLoadErrorOccured(data.error);

			} else {
				console.log(data.error);
				eventHandler.genericErrorOccured('AJAX Data load');
			}



		}


	}



// --------------------------------------------------------------------------------------------------------
// GENERIC REQUEST
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