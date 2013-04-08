function AppController(userSettings, appSettings, redmineSettings){

	var self = this;
	var initialLoad = true;

	this.eventHandler = {};

	this.dataController = new DataController(userSettings, appSettings, redmineSettings);
	this.appView = new AppView(self.eventHandler);
	// this.dataModel = new DataModel(userSettings, appSettings, redmineSettings, self.dataController);
	this.appMonitor = new AppMonitor(self.appView, self.dataController, self.dataModel);



	// Event Handlers
	// -------------------------------------------------------------------------------------------

	this.eventHandler.onBodyLoad = function() {
		// self.appMonitor.runMonitor();
		self.dataController.startInitialDataLoad();
	}

	this.eventHandler.onProjectSummaryRefreshBtnClick = function(projectId) {
		// alert('onProjectSummaryRefreshBtnClick');
		self.refreshQueries(projectId);
	}

	$(document).ajaxStart(
		function() {
			if (initialLoad) {
				self.appMonitor.runMonitor();
				self.appView.showPermanotice('Loading...','Application is collecting data from Redmine.', 'info');
			}
		}
	);


	$(document).ajaxStop(
		function() {
			if (initialLoad) {
				initialLoad = false;
				self.appView.removePermanotice();

				// Start buildig standard summary
				// displayStandardSummary(self.dataController.dataModel.projectList);

				for(var p=0; p<userSettings.projects.length; p++) {
					createProjectSummaryBlank(userSettings.projects[p]);
				}

				// self.appMonitor.runMonitor();
			}
		}
	);


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

	// Auto update 
	function autoRefresh() {
		setInterval(autoRefresh, 60000);
	}


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



	// -------------------------------------------------------------------------------------------
	// Create blank custom query table
	// -------------------------------------------------------------------------------------------
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
	// -------------------------------------------------------------------------------------------




	// DEBUG
	// ---------------------------------------------------



	this.debugEvent = function() {
		getQueryResult('isori', '461');
	}

}