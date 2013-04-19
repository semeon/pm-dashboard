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
// -------------------------------------------------------------------------------------------

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


	this.eventHandler.onVersionSummaryRefreshBtnClick = function(project, version) {
		console.log('Refresh version summary button clicked for ' + project.id + ' / ' + version.name);
		self.dataController.reloadVersionData(project, version);
	}

	// Version issues load events

	this.eventHandler.projectLoadCompleted = function (project) {
		console.log('Event: project versions load completed for ' + project.id);
		self.appView.createProjectSummary(project);
	}
	this.eventHandler.versionCreated = function (project, version) {
		console.log('Event: project versions load completed for ' + project.id + ' / ' + version.name);
		self.appView.addVersionSummary(project, version);
	}


	this.eventHandler.versionBatchLoadStarted = function (project, version) {
		console.log('Event:version issues load started for ' + project.id + ' / ' + version.name );
		self.appView.updateBatchLoadProgressBar(project, version, 0, 'none');
	}

	this.eventHandler.versionBatchLoadUpdated = function (project, version, current, total) {
		console.log('Event: version issues load updated for ' + project.id + ' / ' + version.name + '. Progress: ' + current + '/' + total);

		self.appView.updateBatchLoadProgressBar(project, version, current, total);
	}

	this.eventHandler.versionBatchLoadCompleted = function (project, version) {
		console.log('Event: version issues load completed for ' + project.id + ' / ' + version.name);
		self.dataController.createDataStructureFromAllIssues(project, version);
		self.appView.updateSummary(project, version);
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




// -------------------------------------------------------------------------------------------
// PUBLIC
// -------------------------------------------------------------------------------------------



// -------------------------------------------------------------------------------------------
// PRIVATE
// -------------------------------------------------------------------------------------------



}