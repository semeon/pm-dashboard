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


	// --------------------------------------------------------------------------------------------------------
	function loadProjectData(userProject) {
		getVersionList(userProject);



	    // Load issues by status

	    // Assign issues groups to versions
	}


 	// --------------------------------------------------------------------------------------------------------
	function getVersionList(userProject) {

	    var requestUrl =  redmineSettings.redmineUrl + 
	                      redmineSettings.projectDataUrl + 
	                      userProject.id + '/' +
	                      redmineSettings.versionsRequestUrl + 
	                      redmineSettings.jsonRequestModifier;

		genericRequest( requestUrl, 
						{}, 
						processVersions);  

	    function processVersions(data) {
			var project = {};	  
			project.id = userProject.id;
			project.versions = {};
			if (data.total_count > redmineSettings.responseLimit) {
			alert('Warning! Redmine response limit is exceeded.' +
			      '\nRequested items count: ' + data.total_count + '.' +
			      '\nLimit: ' + redmineSettings.responseLimit + '.'
			      );
			}

			for (var v=0; v<data.total_count; v++) {
				var version = data.versions[v];

				if (version.status != 'closed') {
					project.versions[String(version.id)] = version; // add 'v' before ver.id ? 
					// var  userStatuses = userProject.customStatuses;
					// version.userStatuses = userProject.customStatuses;
				
					version.issueGroups = {};
					// call create statuses

					// createIssueStatuses(userProject, version);
					for (var i=0; i<userProject.customStatuses.length; i++){
						var issueGroupTitle = userProject.customStatuses[i].title;
						// alert('issueGroupTitle: ' + issueGroupTitle);
						version.issueGroups[issueGroupTitle] = userProject.customStatuses[i];
					}

					// fill statuses with issues
					getIssueList(project, version);

				}
			}
			self.dataModel.projects[userProject.id] = project;

	    }

	}
 	// --------------------------------------------------------------------------------------------------------
		// function createIssueStatuses(userProject, version) {
		// 	var userStatuses = userProject.customStatuses;
		// 	for (var i=0; i<userStatuses.length; i++){
		// 		version.statuses[userStatuses[i].title] = userStatuses[i];
		// 	}
		// }
	 	// --------------------------------------------------------------------------------------------------------
		function getIssueList(project, version) {

			for (var issueGroupName in version.issueGroups) {
				// alert(version.id + ' ' + issueGroup);
				var group = version.issueGroups[issueGroupName];

				// alert(group.title + ': ' + group.includes);

				// get status IDs
				for(var i=0; i<group.includes.length; i++) {
					var sId = group.includes[i];

					if (sId == 3 ) {

						// http://dintrsrv01.domain.corp/projects/isori/issues.json?
						// fixed_version_id=340
						// status_id=5
						// key=2da4605ebea54748909b946d3c9d2bd5c04c4837&limit=100
						var requestUrl =  	redmineSettings.redmineUrl + 
											redmineSettings.projectDataUrl + 
											project.id + '/' +
											redmineSettings.issuesRequestUrl + 
											redmineSettings.jsonRequestModifier;

						var requestParams = {
							fixed_version_id: version.id,
							status_id: 	sId
						};

						// alert(requestUrl);

 						var aaa = sId;

						alert('REQUESTING: ' + group.title + ': ' + group.includes);

						// request issues of particular id
						genericRequest( requestUrl,
										requestParams, 
										function (data) {
											processIssues(data, 
														  group, 
														  requestUrl, 
														  requestParams,
														  version
														  );
										});
					}
				}
			}

			function processIssues(data, group, requestUrl, requestParams, ver) {
				// alert('Happines!');
				if (data.total_count > redmineSettings.responseLimit) {
					alert('Warning! Redmine response limit is exceeded.' +
					      '\nRequested items count: ' + data.total_count + '.' +
					      '\nLimit: ' + redmineSettings.responseLimit + '.'
					      );
				}				

				var a = 2;

				if (data.total_count > 0) {
					alert(
							'group.title: ' + group.title + 
							'\n' + 'group.includes: ' + group.includes[0] + 
							'\n' + 'requestUrl ' + 			requestUrl +
							'\n' + 'fixed_version_id: ' + 	requestParams.fixed_version_id +
							'\n' + 'status_id: ' + 			requestParams.status_id +
							'\n' + 'total_count: ' + data.total_count +
							// '\n' + version.id + ' | ' + vStatus.title + ' (' + stId + ')' + 
						  	'\n#1: ' + data.issues[0].id + ' | ' + data.issues[0].subject + ' | ' + 
							data.issues[0].status.name + ' (' + data.issues[0].status.id + ')'
						);
				}

				group.issues = data.issues;
			}

		}
	 	// --------------------------------------------------------------------------------------------------------





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