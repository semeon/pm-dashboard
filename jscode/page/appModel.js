function DataModel(userSettings, appSettings, redmineSettings, dataController) {

  self = this;

  this.projectList = {};

  for (var p=0; p<userSettings.projects.length; p++) {

    var project = {};
    project.id = userSettings.projects[p].id;
  	self.projectList[project.id] = project;

		loadProjectData(project);

  }



	// PRIVATE
	// -------------------------------------------------------------------------------------------

  function loadProjectData(project) {

  	// Load project versions
		var requestUrl =  redmineSettings.redmineUrl + 
											redmineSettings.projectDataUrl + 
											project.id + '/' +
											redmineSettings.versionsRequestUrl + 
											redmineSettings.jsonRequestModifier;

		function processVersions(data, requestParams) {

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

		}

		dataController.genericRequest(requestUrl, 
																	{
																		key: redmineSettings.userKey
																	},
																	processVersions
																	); 




  	// Load issues by status

  	// Assign issues groups to versions



  }

}