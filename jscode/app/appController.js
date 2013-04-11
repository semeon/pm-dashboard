function AppController(userSettings, appSettings, redmineSettings){

	var self = this;
	var initialLoad = true;

	this.eventHandler = {};

	this.dataController = new DataController(userSettings, appSettings, redmineSettings, self.eventHandler);
	this.appView = new AppView(self.eventHandler, userSettings, appSettings, redmineSettings);
	// this.dataModel = new DataModel(userSettings, appSettings, redmineSettings, self.dataController);
	this.appMonitor = new AppMonitor(self.appView, self.dataController, self.dataModel);



	// Event Handlers
	// -------------------------------------------------------------------------------------------
	$(document).ajaxStart(
		function() {
			if (initialLoad) {
				self.appView.switchFromGreatingsToPleaseWait();
				self.appMonitor.runMonitor();
				// self.appView.showAlert('Loading...','Application is collecting data from Redmine.', 'info');
			}
		}
	);

	$(document).ajaxStop(
		function() {
			if (initialLoad) {
				initialLoad = false;

				self.appView.hideItem('#pleaseWaitMessage');

				// Start buildig standard summary
				// displayStandardSummary(self.dataController.dataModel.projectList);

				for(var p=0; p<userSettings.projects.length; p++) {
					createProjectSummaryBlank(userSettings.projects[p].id);
				}

				// self.appMonitor.runMonitor();
			}
		}
	);

	this.eventHandler.startButtonClick = function() {
		self.dataController.startInitialDataLoad();
	}

	this.eventHandler.onBodyLoad = function() {
		// self.appMonitor.runMonitor();

		self.appView.listProjectsOnTheGreatingScreen();
	}

	this.eventHandler.onProjectSummaryRefreshBtnClick = function(project) {
		self.appView.projectSummaryView.update(project);
	}

	this.eventHandler.dataLoadErrorOccured = function (error) {
		var message = error.message + ' (' + error.code + ').';
		self.appView.showAlert('Error', message, 'error')
	}

	this.eventHandler.genericErrorOccured = function (text) {
		var message = 'Unexpected error occure. Beware.';
		if (text) {
			message = text + ': ' + message;
		}
		self.appView.showAlert('Error', message, 'error')
	}






	// -------------------------------------------------------------------------------------------
	// PUBLIC
	// -------------------------------------------------------------------------------------------

	// this.loadData = function() {
	// 	// alert('Loading app...');
	// 	var projectsNumber = userSettings.projects.length;
	// 	self.dataController.totalRequestCounter = 0;

	// 	for(var p=0; p<projectsNumber; p++) {
	// 		updateProjectSummaryBlank(userSettings.projects[p]);
	// 	}
	// }

	this.refreshQueries = function(projectId) {
		for(var p=0; p<userSettings.projects.length; p++) {
			if (userSettings.projects[p].id == projectId) {
				updateProjectSummaryBlank(userSettings.projects[p]);
				break;
			}
		}
	}


// ===========================================================================================
// PRIVATE
// ===========================================================================================


	// -------------------------------------------------------------------------------------------
	// Create project stat blank
	// -------------------------------------------------------------------------------------------
	function createProjectSummaryBlank (projectId) {
		var project = self.dataController.data.projects[projectId];

		self.appView.projectSummaryView.createBlank(project);


	}





	// -------------------------------------------------------------------------------------------
	// Create custom project stat blank
	// -------------------------------------------------------------------------------------------
	// function createProjectSummaryBlank (project) {
	// 	self.appView.createProjectSummary(project.id, project.title, project.queryTitles);

	// 	for(var v=0; v<project.versions.length; v++) {
	// 		var versionObj = project.versions[v];
	// 		var rowNode = self.appView.createProjectTableRowNode(project.id, versionObj.version);

	// 		for(var q=0; q<project.queryTitles.length; q++) {
	// 			var queryId = versionObj.queries[q];
	// 			if (queryId == undefined) { queryId = 'none'; }
	// 			self.appView.appendQueryResultNode(rowNode, project.id, versionObj.version, queryId);
	// 		}
	// 	}    
	// }
	// -------------------------------------------------------------------------------------------

	// -------------------------------------------------------------------------------------------
	// Update custom query results
	// -------------------------------------------------------------------------------------------
	function updateProjectSummaryBlank (project) {
		var queriesNumber = project.queryTitles.length;
		var versionsNumber = project.versions.length;

		function processRequestResult (data, requestParams) {
			var linkHref =  redmineSettings.redmineUrl + 
							redmineSettings.issuesRequestUrl +
							'?query_id=' + requestParams.query_id + 
							'&project_id=' + requestParams.project_id;
			self.appView.showQueryResult(requestParams.query_id, data.total_count, linkHref);
		}


		for(var v=0; v<versionsNumber; v++) {
			var versionObj = project.versions[v];
			var queries = versionObj.queries;

			for(var q=0; q<queriesNumber; q++) {
				var queryId = queries[q];
				if (queryId != undefined) {
					self.dataController.getQueryResult(project.id, queryId, processRequestResult);
				}
			}
		}
	}
	// -------------------------------------------------------------------------------------------







	// DEBUG
	// ---------------------------------------------------



	// Auto update 
	function autoRefresh() {
		setInterval(autoRefresh, 60000);
	}

	this.debugEvent = function() {

		self.appView.clearProjectSummaryRoot();

		for(var p=0; p<userSettings.projects.length; p++) {
			createProjectSummaryBlank(userSettings.projects[p].id);
		}
	}

}