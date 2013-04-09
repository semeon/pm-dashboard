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
			var issueGroupTitle = customStatuses[i].title;
			issueGroups[customStatuses[i].title] = {};

			var group = issueGroups[issueGroupTitle];
			issueGroups[issueGroupTitle].count = 0;
			issueGroups[issueGroupTitle].ver = verId;
			issueGroups[issueGroupTitle].title = issueGroupTitle;
			issueGroups[issueGroupTitle].includes = customStatuses[i].includes;

			for (var j=0; j<issueGroups[issueGroupTitle].includes.length; j++) {
				var requestParams = {
					fixed_version_id: 	verId,
					status_id: 			issueGroups[issueGroupTitle].includes[j],
					
					// not for request, just for passing to callback (can't pass another way for some reason)
					project_id: 		project.id,        	
					issue_group_name: 	issueGroupTitle
				};

				// console.log(group);
				// console.log(group.includes[j]);
				// Request
				genericRequest( requestUrl, 
								requestParams, 
								function (data) {
									processIssuegroupResponse(data, requestParams, issueGroups[issueGroupTitle]);
								});

				text = 'Flow my tears, developer said';
			}
		}

		// Response processing
		function processIssuegroupResponse(responseData, rp, gr) {
			// self.dataModel.projects[rp.project_id].versions[String(rp.fixed_version_id)].issueGroups[rp.issue_group_name].count += responseData.total_count;

			console.log('Response for: ');
			console.log('Ver:' +rp.fixed_version_id);
			console.log(gr);
			console.log(gr);
			console.log(gr);
			console.log(gr.count + ' before');
			gr.count += responseData.total_count;
			console.log(gr.count + ' after');

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