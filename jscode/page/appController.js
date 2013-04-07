function AppController(userSettings, appSettings, redmineSettings){

	var self = this;

	this.eventHandler = {};
	this.dataController = new DataController();
	this.appView = new AppView(self.eventHandler);
	this.dataModel = new DataModel(userSettings, appSettings, redmineSettings, self.dataController);
	this.appMonitor = new AppMonitor(self.appView, self.dataController, self.dataModel);

	this.dataLoaded = false;


	// Event Handlers
	// -------------------------------------------------------------------------------------------

	this.eventHandler.onBodyLoad = function() {
		// for(var p=0; p<userSettings.projects.length; p++) {
		// 	createProjectSummaryBlank(userSettings.projects[p]);
		// }
		// self.appMonitor.runMonitor();
		self.appView.initialLoadAlert.show('Application is collecting data from Redmine...', 'info');
	}

	this.eventHandler.onProjectSummaryRefreshBtnClick = function(projectId) {
		// alert('onProjectSummaryRefreshBtnClick');
		self.refreshQueries(projectId);
	}

	$(document).ajaxStop(
		function() {
			if (!self.dataLoaded) {
				self.dataLoaded = true;

				// Start buildig standard summary
				// displayStandardSummary(self.dataModel.projectList);

				self.appView.initialLoadAlert.hide(true);

				for(var p=0; p<userSettings.projects.length; p++) {
					createProjectSummaryBlank(userSettings.projects[p]);
				}

				self.appMonitor.runMonitor();
			}
		}
	);


	// PUBLIC
	// -------------------------------------------------------------------------------------------

	this.loadData = function() {
		// alert('Loading app...');
		var projectsNumber = userSettings.projects.length;
		self.dataController.totalRequestCounter = 0;

		for(var p=0; p<projectsNumber; p++) {
			updateProjectSummaryBlank(userSettings.projects[p]);
		}
	}

	this.refreshQueries = function(projectId) {
		for(var p=0; p<userSettings.projects.length; p++) {
			if (userSettings.projects[p].id == projectId) {
				updateProjectSummaryBlank(userSettings.projects[p]);
				break;
			}
		}
	}



	// PRIVATE
	// -------------------------------------------------------------------------------------------

	// Auto update 
	function autoRefresh() {
		setInterval(autoRefresh, 60000);
	}

	// Request and proccess project's version list 
	function getVersionList(projectId) {
		var requestUrl =  redmineSettings.redmineUrl + 
											redmineSettings.projectDataUrl + projectId + '/' +
											redmineSettings.versionsRequestUrl + 
											redmineSettings.jsonRequestModifier;

		// alert(requestUrl);

		function processRequestResult(data, requestParams) {
			alert(data);
		}

		self.dataController.genericRequest(	requestUrl, 
																				{
																					key: redmineSettings.userKey
																				},
																				processRequestResult
																				); 
	}

	// Request and proccess redmine's query
	function getQueryResult(projectId, queryId) {
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

		self.dataController.genericRequest( userSettings.queryURL + '.json', 
																				{
																					project_id: projectId,
																					query_id: queryId,
																					key: redmineSettings.userKey
																				},
																				processRequestResult
																				 ); 
	}

	function updateProjectSummaryBlank (project) {
		var queriesNumber = project.queryTitles.length;
		var versionsNumber = project.versions.length;

		for(var v=0; v<versionsNumber; v++) {
			var versionObj = project.versions[v];
			var queries = versionObj.queries;

			for(var q=0; q<queriesNumber; q++) {
				var queryId = queries[q];
				if (queryId != undefined) {
					getQueryResult(project.id, queryId);
				}
			}
		}
	}

	function createProjectSummaryBlank (project) {
		self.appView.createProjectSummary(project.id, project.title, project.queryTitles);

		for(var v=0; v<project.versions.length; v++) {
			var versionObj = project.versions[v];
			var rowNode = self.appView.createProjectTableRowNode(project.id, versionObj.version);

			for(var q=0; q<project.queryTitles.length; q++) {
				var queryId = versionObj.queries[q];
				if (queryId == undefined) { queryId = 'none'; }
				self.appView.appendQueryResultNode(rowNode, project.id, versionObj.version, queryId);
			}
		}    
	}


	// DEBUG
	// ---------------------------------------------------



	this.debugEvent = function() {

		getQueryResult('isori', '461');
	}







}