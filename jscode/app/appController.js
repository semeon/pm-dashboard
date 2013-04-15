function AppController(userSettings, appSettings, redmineSettings){

	var self = this;
	var initialLoad = true;

	this.eventHandler = {};

	this.dataController = new DataController(userSettings, appSettings, redmineSettings, self.eventHandler);
	this.appView = new AppView(self.eventHandler, userSettings, appSettings, redmineSettings);
	// this.dataModel = new DataModel(userSettings, appSettings, redmineSettings, self.dataController);
	this.appMonitor = new AppMonitor(self.appView, self.dataController, self.dataModel);



// -------------------------------------------------------------------------------------------
// Event Handlers
//
	$(document).ajaxStart(
		function() {
			// if (initialLoad) {
			// 	console.log('Initial data load started.');
			// 	self.appView.switchFromGreatingsToPleaseWait();
			// 	// self.appMonitor.runMonitor();
			// 	// self.appView.showAlert('Loading...','Application is collecting data from Redmine.', 'info');
			// } else {
			// 	console.log('Data load started.');
			// }
		}
	);

	$(document).ajaxStop(
		function() {
			// if (initialLoad) {
			// 	initialLoad = false;

			// 	console.log('Initial data load completed.');
			// 	console.log('  App data:');
			// 	console.log(self.dataController.data);

			// 	self.appView.hideItem('#pleaseWaitMessage');

			// 	// Start buildig standard summary
			// 	// displayStandardSummary(self.dataController.dataModel.projectList);

			// 	// for(var p=0; p<userSettings.projects.length; p++) {
			// 	// 	console.log('Calling creating summary blank for ' + userSettings.projects[p].id);
			// 	// 	createProjectSummaryBlank(userSettings.projects[p].id);
			// 	// }

			// 	for(projectId in self.dataController.data.projects) {
			// 		// console.log('Calling creating summary blank for ' + projectId);
			// 		//self.appView.projectSummaryView.createBlank(self.dataController.data.projects[projectId]);
			// 		// self.appView.projectSummaryView.update(self.dataController.data.projects[projectId]);
			// 	}


			// 	// self.appMonitor.runMonitor();
			// } else {
			// 	console.log('Data load completed.');
			// }
			// console.log('---------------------------------------');
		}
	);


	this.eventHandler.onBodyLoad = function() {
		// self.appMonitor.runMonitor();
		self.appView.listProjectsOnTheGreatingScreen();
	}

	this.eventHandler.startButtonClick = function() {
		self.dataController.startInitialDataLoad();
		self.appView.switchFromGreatingsToPleaseWait();
	}

	this.eventHandler.projectBatchLoadStarted = function (project) {
		self.appView.createBatchLoadProgressBar(project);
		console.log('Calling project summary blank for ' + project.id);
		self.appView.projectSummaryView.createBlank(project);
	}

	this.eventHandler.projectBatchLoadUpdated = function (projectId, current, total) {
		console.log('Event: batch issue load updated for ' + projectId + '. Progress: ' + current + '/' + total);
		self.appView.updateBatchLoadProgresBar(projectId, current, total);
	}

	this.eventHandler.projectBatchLoadCompleted = function (project) {
		self.dataController.createDataStructureFromAllIssues(project);
		self.appView.projectSummaryView.update(project);
	}



	this.eventHandler.dataLoadErrorOccured = function (error) {
		var message = error.message + ' (' + error.code + ').';
		self.appView.showAlert('Error', message, 'error')
	}

	this.eventHandler.genericErrorOccured = function (text) {
		var message = 'Unexpected error occured. Beware.';
		if (text) {
			message = text + ': ' + message;
		}
		self.appView.showAlert('Error', message, 'error')
	}

	this.eventHandler.onProjectSummaryRefreshBtnClick = function(project) {
		console.log('Refresh project summary button clicked for ' + project.id);
		// self.dataController.reloadProductData(project);
	}


// -------------------------------------------------------------------------------------------
// OLD
// -------------------------------------------------------------------------------------------

	this.eventHandler.onProjectDataUpdate = function(projectId, versionId, groupName, newValue) {
		if (!initialLoad) {
			console.log('Project data updated for project/version/group: ' + projectId + '/' + versionId + '/' + groupName );
			self.appView.projectSummaryView.updateCell(projectId, versionId, groupName, newValue);
		}
	}


// -------------------------------------------------------------------------------------------
// PUBLIC
// -------------------------------------------------------------------------------------------


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