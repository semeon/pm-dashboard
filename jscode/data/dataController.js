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
			loadProjectData(userSettings.projects[p].id, false);
		}

	}

	// --------------------------------------------------------------------------------------------------------
	this.reloadProductData = function(project) {
		console.log('Calling reload project versions for ' + project.id);
		loadVersions(project);
	}

	// --------------------------------------------------------------------------------------------------------
	this.createDataStructureFromAllIssues = function(project, version) {

		// Structure:
		// 	Project
		// 	 - Version
		//		- Custom Status

		console.log('Creating data structure for ' + project.id + ' / ' + version.name);

		var supportedStatuses = [];
		for (var cs=0; cs<project.customStatuses.length; cs++) {
			supportedStatuses = supportedStatuses.concat(project.customStatuses[cs].includes);
		}
		// console.log('Supported statuses: ' + supportedStatuses);

		var issues = version.allIssues;
		for (var i=0; i<issues.length; i++) {
			var issue = issues[i];
			console.log('------------------------------------------------------');
			console.log('Processing issue[' + i + '] #' + issue.id);

			var issueStatus = issue.status.id;
			var issueTracker = issue.tracker.id;

			console.log('- Checking tracker and status..');
			if ( $.inArray(issueTracker, project.issueTrackers) > -1 
					&&
				 $.inArray(issueStatus, supportedStatuses) > -1 ) {

				console.log('-- Good. Status: ' + issueStatus + ', tracker:  '+ issueTracker + '. Proceeding..');

				var issueGroupname = '';
				for (var cs=0; cs<project.customStatuses.length; cs++ ) {
					var groupName = project.customStatuses[cs].title;
					if ( $.inArray(issueStatus, project.customStatuses[cs].includes) > -1 ) {
						issueGroupname = groupName;
						continue;
					}
				}

				var group = version.issueGroups[issueGroupname];
				group.count++;
				group.issues.push(issue);
				version.issues.push(issue);

			} else {
				// console.log(' - Doesn\'t fit. Next..');
			}
		}
	}


//-----------------------------------------------------------------------------------------------------
// PROJECT DATA LOAD
//-----------------------------------------------------------------------------------------------------

	//-----------------------------------------------------------------------------------------------------
	function loadProjectData(projectId, batch) {
		console.log('Starting getVersionList for ' + projectId);

		var userProject = userSettings.getProjectSettingsById(projectId);
		var dataProject = self.data.projects[userProject.id];

		console.log('Cheking, if the project already exist');
		if(dataProject == undefined) {
			console.log(' - It doesn\'t, creating a new one.');

			// Creating a new version
			// ------------------------------
			dataProject = {};
			self.data.projects[userProject.id] = dataProject;

			dataProject.id = userProject.id;
			dataProject.title = userProject.title;
			dataProject.versions = {};
			dataProject.allIssues = [];
			dataProject.customStatuses = userProject.customStatuses;
			dataProject.issueTrackers = userProject.issueTrackers;
			dataProject.customQueries = userProject.customQueries;
			// ------------------------------

		} else {
			console.log(' - It does, proceeding with it.');
		}
		console.log('Calling batch issue load for ' + dataProject.id);
		loadVersions(dataProject, batch);
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

	    // Request
		function requestVersions (project, requestUrl) {

			var requestParameters = { status: 'open'};

			genericRequest( requestUrl, 
							requestParameters, 
							function (data) {
								processVersions(data, project, loadIssues);
							});
		}

		// Response processing
	    function processVersions(data, project, loadIssues) {
			console.log('Starting procesing versions for ' + project.id);

			if (data.total_count > redmineSettings.responseLimit) {
				// TODO - Use pagination here
				alert('Warning! Redmine response limit is exceeded.' +
				      '\nRequested items count: ' + data.total_count + '.' +
				      '\nLimit: ' + redmineSettings.responseLimit + '.'
				      );
			}

			for (var v=0; v<data.versions.length; v++) {

				// Creating a new version
				// ------------------------------
				var version = data.versions[v];
				if (version.status != 'closed') {
					project.versions[String(version.id)] = version;
					version.issueGroups = {};
					version.allIssues = [];
					version.issues = [];

					for (var cs=0; cs<project.customStatuses.length; cs++ ) {
						var groupName = project.customStatuses[cs].title;
						version.issueGroups[groupName] = {};
						version.issueGroups[groupName].title = groupName;
						version.issueGroups[groupName].count = 0;
						version.issueGroups[groupName].issues = [];
					}

					console.log('Calling load issues by groups');
					batchLoadVersionIssuesData(project, version);
				}
				// ------------------------------
			}
			
	    }
	}//----------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------
// BATCH ISSUE LOAD by VERSION
// --------------------------------------------------------------------------------------------------------

	function batchLoadVersionIssuesData(project, version) {
		console.log('Starting batch load for ' + project.id + ' / ' + version.name);

	    var requestUrl =  redmineSettings.redmineUrl + 
	                      redmineSettings.projectDataUrl + 
	                      project.id + '/' +
	                      redmineSettings.issuesRequestUrl + 
	                      redmineSettings.jsonRequestModifier;

		eventHandler.versionBatchLoadStarted(project, version);
	    requestIssuesPage(project, version, requestUrl, 0);

	    // Request
		function requestIssuesPage (project, version, requestUrl, offset) {

			var requestParameters = { offset: offset, 
									  status_id: '*',
									  fixed_version_id: version.id
									 };

			console.log('Requesting issues page ' + offset + ' for ' + project.id + ' / ' + version.name);
			console.log(' - URL:  ' + requestUrl);


			if (version.href == undefined ) {
				var href = 	redmineSettings.redmineUrl + 
	                      	redmineSettings.projectDataUrl + 
	                      	project.id + '/' +
	                      	redmineSettings.issuesRequestUrl + '?';
				href = href + '&fixed_version_id=' + version.id;
				href = href + '&group_by=status';
				version.href = href;
			}

			genericRequest( requestUrl, 
							requestParameters, 
							function (data) {
								processIssuesPage(data, requestParameters, project, version, requestUrl);
							});
		}

	    // Response preocessing
		function processIssuesPage (data, rp, project, version, requestUrl) {
			console.log('Processing issues page ' + rp.offset + ' for ' + project.id + ' / ' + version.name);
			console.log(data);

			if (data.issues) {

				var prevPagesIssueCount = version.allIssues.length;
				var currentPageIssueCount = data.issues.length;

				if( (prevPagesIssueCount+currentPageIssueCount) > data.total_count) {
					var diff = data.total_count - prevPagesIssueCount;
					var notLoadedIssues = data.issues.slice(currentPageIssueCount-diff);
					version.allIssues = version.allIssues.concat(notLoadedIssues);

				} else {
					version.allIssues = version.allIssues.concat(data.issues);
				}

				var loadedIssuesCount = version.allIssues.length;
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